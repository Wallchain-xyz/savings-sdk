import { KernelValidator, addressToEmptyAccount, createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import { revokeSessionKey, serializeSessionKeyAccount, signerToSessionKeyValidator } from '@zerodev/session-key';

import { bundlerActions } from 'permissionless';
import { Address, Hex, PrivateKeyAccount, type Transport, createPublicClient, encodeFunctionData, http } from 'viem';

import { NetworkEnum } from '../api/thecat/__generated__/createApiClient';
import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import { WallchainAuthMessage } from '../SavingsAccount/createAuthMessage';

import { UserOperation, createSponsorUserOperation } from './createSponsorUserOperation';

import type { DepositStrategyId } from '../depositStrategies/DepositStrategy';

interface ConstructorParams {
  sudoValidator: KernelValidator;
  privateKeyAccount: PrivateKeyAccount;
  bundlerChainAPIKey: string;
  sponsorshipAPIKey: string;
  chainId: NetworkEnum;
}

interface MinimumTxn {
  to: Address;
  value: bigint;
  data: Hex;
}

export interface WithdrawParams {
  depositStrategyId: DepositStrategyId;
  amount: bigint;
}

interface PrepareSessionKeyAccountParams {
  sessionKeyAccountAddress: Address;
  depositStrategyIds: DepositStrategyId[];
}

export class AAManager {
  // this account is provided outside as AA account to use
  private _aaAccountClient: ReturnType<typeof createKernelAccountClient> | undefined;

  // this account is used only to withdraw deposits
  private sponsoredAccountClient: ReturnType<typeof createKernelAccountClient> | undefined;

  private readonly sudoValidator: KernelValidator;

  private readonly privateKeyAccount: PrivateKeyAccount;

  private readonly publicClient: ReturnType<typeof createPublicClient>;

  private readonly transport: Transport;

  private readonly sponsorUserOperation: ({
    userOperation,
  }: {
    userOperation: UserOperation;
  }) => Promise<UserOperation>;

  constructor({ sudoValidator, bundlerChainAPIKey, sponsorshipAPIKey, chainId, privateKeyAccount }: ConstructorParams) {
    this.sudoValidator = sudoValidator;
    this.transport = http(`https://rpc.zerodev.app/api/v2/bundler/${bundlerChainAPIKey}`);
    this.publicClient = createPublicClient({
      transport: this.transport,
    });
    this.sponsorUserOperation = createSponsorUserOperation({
      pimlicoApiKey: sponsorshipAPIKey,
      chainId,
    });
    this.privateKeyAccount = privateKeyAccount;
  }

  async init() {
    const aaAccount = await createKernelAccount(this.publicClient, {
      plugins: {
        sudo: this.sudoValidator,
      },
    });
    this._aaAccountClient = createKernelAccountClient({
      account: aaAccount,
      transport: this.transport,
    });

    this.sponsoredAccountClient = createKernelAccountClient({
      account: aaAccount,
      transport: this.transport,
      // @ts-expect-error @merlin fix
      sponsorUserOperation: this.sponsorUserOperation,
    });
  }

  get aaAccountClient() {
    if (!this._aaAccountClient) {
      throw new Error('Call init() before using aaAccountClient');
    }
    return this._aaAccountClient;
  }

  get aaAddress(): Address {
    // TODO: @merlin fix typing
    // @ts-expect-error it doesn't know here that we have account inside
    return this.aaAccountClient.account.address;
  }

  async signMessage(message: WallchainAuthMessage) {
    return this.privateKeyAccount.signTypedData({
      // TODO: @merlin fix typing
      // @ts-expect-error it doesn't know here that we have account inside
      account: this.aaAccountClient.account,
      domain: {
        name: 'WallchainAuthMessage',
      },
      types: {
        WallchainAuthMessage: [
          { name: 'info', type: 'string' },
          { name: 'aa_address', type: 'address' },
          { name: 'expires', type: 'uint256' },
        ],
      },
      primaryType: 'WallchainAuthMessage',
      message: {
        ...message,
        expires: BigInt(message.expires),
      },
    });
  }

  async revokeSKA(sessionKeyAccountAddress: Address) {
    // TODO: @merlin fix typing
    // @ts-expect-error it doesn't know here that we have account inside
    await revokeSessionKey(this.aaAccountClient, sessionKeyAccountAddress);
  }

  async signSKA({ sessionKeyAccountAddress, depositStrategyIds }: PrepareSessionKeyAccountParams) {
    const emptySessionKeySigner = addressToEmptyAccount(sessionKeyAccountAddress);

    const strategies = depositStrategyIds.map(getDepositStrategyById);
    // TODO: @merlin remove permissions duplication
    const combinedPermissions = strategies.flatMap(strategy => strategy.permissions);

    const sessionKeyValidator = await signerToSessionKeyValidator(this.publicClient, {
      signer: emptySessionKeySigner,
      validatorData: {
        permissions: combinedPermissions,
      },
    });

    const sessionKeyAccount = await createKernelAccount(this.publicClient, {
      plugins: {
        sudo: this.sudoValidator,
        regular: sessionKeyValidator,
      },
    });

    return serializeSessionKeyAccount(sessionKeyAccount);
  }

  private async executeUserOperation(txn: MinimumTxn) {
    if (!this.sponsoredAccountClient) {
      throw new Error('Call init() before using executeUserOperation');
    }

    const { account } = this.sponsoredAccountClient;
    return this.sponsoredAccountClient.sendUserOperation({
      // TODO: @merlin fix typing
      // @ts-expect-error it doesn't know here that we have account inside
      account,
      userOperation: {
        // TODO: @merlin fix typing
        // @ts-expect-error it doesn't know here that we have account inside
        callData: await account.encodeCallData({
          ...txn,
        }),
      },
    });
  }

  async withdraw({ depositStrategyId, amount }: WithdrawParams) {
    if (!this.sponsoredAccountClient) {
      throw new Error('Call init() before using withdraw');
    }

    const functionName = 'withdrawBNB'; // This is the same for all native coins, not just BNB
    const depositStrategy = getDepositStrategyById(depositStrategyId);
    const withdrawDepositPermission = depositStrategy.permissions.find(
      permission => permission.functionName === functionName,
    );
    if (!withdrawDepositPermission) {
      throw new Error('Permission is not found');
    }

    const txn = {
      to: withdrawDepositPermission.target,
      value: BigInt(0),
      data: encodeFunctionData({
        // @ts-expect-error @merlin to fix
        abi: withdrawDepositPermission.abi,
        functionName,
        args: [amount],
      }),
    };

    const userOpHash = await this.executeUserOperation(txn);

    return this.sponsoredAccountClient.extend(bundlerActions).waitForUserOperationReceipt({
      hash: userOpHash,
    });
  }
}
