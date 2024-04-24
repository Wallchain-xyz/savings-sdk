import { KernelValidator, addressToEmptyAccount, createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import { serializeSessionKeyAccount, signerToSessionKeyValidator } from '@zerodev/session-key';

import { bundlerActions } from 'permissionless';
import { Address, Hex, PrivateKeyAccount, type Transport, createPublicClient, encodeFunctionData, http } from 'viem';

import { NetworkEnum } from '../api/thecat/__generated__/createApiClient';
import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import { getIsNativeStrategy } from '../depositStrategies/getIsNativeStrategy';
import { WallchainAuthMessage } from '../SavingsAccount/createAuthMessage';

import { AllowanceParams, ERC_20_ALLOWANCE_FUNCTION_NAME, createAllowanceTxn } from './createAllowanceTxn';
import { createERC20AddDepositTxn } from './createERC20AddDepositTxn';
import { createNativeAddDepositTxn } from './createNativeAddDepositTxn';
import { createRequestAllowanceTxn } from './createRequestAllowanceTxn';
import { UserOperation, createSponsorUserOperation } from './createSponsorUserOperation';

import type { DepositStrategyId } from '../depositStrategies/DepositStrategy';

const ERC20_DEPOSIT_FUNCTION_NAME = 'deposit';
// This is the same for all native coins, not just BNB
const NATIVE_ADD_DEPOSIT_FUNCTION_NAME = 'depositBNB';
const NATIVE_WITHDRAW_DEPOSIT_FUNCTION_NAME = 'withdrawBNB';
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

export interface WithdrawOrDepositParams {
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

  private async sendUserOp(txns: MinimumTxn[]) {
    if (!this.sponsoredAccountClient) {
      throw new Error('Call init() before using sendUserOp');
    }

    const { account } = this.sponsoredAccountClient;
    return this.sponsoredAccountClient.sendUserOperation({
      // TODO: @merlin fix typing
      // @ts-expect-error it doesn't know here that we have account inside
      account,
      userOperation: {
        // TODO: @merlin fix typing
        // @ts-expect-error it doesn't know here that we have account inside
        callData: await account.encodeCallData(txns),
      },
    });
  }

  private async getHasAllowance({ token, owner, spender, amount }: AllowanceParams): Promise<boolean> {
    const requestAllowanceTxn = createRequestAllowanceTxn({ owner, token, spender });
    const allowance: string = await this.aaAccountClient.transport.request(requestAllowanceTxn);
    return BigInt(allowance) >= amount;
  }

  async deposit({ depositStrategyId, amount }: WithdrawOrDepositParams) {
    const depositStrategy = getDepositStrategyById(depositStrategyId);

    const isNativeStrategy = getIsNativeStrategy(depositStrategy);
    const functionName = isNativeStrategy ? NATIVE_ADD_DEPOSIT_FUNCTION_NAME : ERC20_DEPOSIT_FUNCTION_NAME;

    const addDepositPermission = depositStrategy.permissions.find(
      permission => permission.functionName === functionName,
    );
    if (!addDepositPermission) {
      throw new Error('Add deposit permission is not found');
    }

    const txns = [];
    if (isNativeStrategy) {
      const nativeAddDepositTxn = createNativeAddDepositTxn({ addDepositPermission, amount });
      txns.push(nativeAddDepositTxn);
    } else {
      const allowancePermission = depositStrategy.permissions.find(
        permission => permission.functionName === ERC_20_ALLOWANCE_FUNCTION_NAME,
      );

      if (!allowancePermission) {
        throw new Error('Allowance permission is not found');
      }

      const allowanceParams = {
        spender: addDepositPermission.target,
        owner: this.aaAddress,
        token: allowancePermission.target,
        amount,
      };
      const hasAllowance = await this.getHasAllowance(allowanceParams);

      if (!hasAllowance) {
        const allowanceTxn = createAllowanceTxn(allowanceParams);
        txns.push(allowanceTxn);
      }

      const erc20AddDepositTxn = createERC20AddDepositTxn({ addDepositPermission, amount });
      txns.push(erc20AddDepositTxn);
    }

    return this.executeTxns(txns);
  }

  async executeTxns(txns: MinimumTxn[]) {
    if (!this.sponsoredAccountClient) {
      throw new Error('Call init() before using sendTxnsAndWaitForReceipt');
    }
    const userOpHash = await this.sendUserOp(txns);

    return this.sponsoredAccountClient.extend(bundlerActions).waitForUserOperationReceipt({
      hash: userOpHash,
    });
  }

  async withdraw({ depositStrategyId, amount }: WithdrawOrDepositParams) {
    const depositStrategy = getDepositStrategyById(depositStrategyId);
    const withdrawDepositPermission = depositStrategy.permissions.find(
      permission => permission.functionName === NATIVE_WITHDRAW_DEPOSIT_FUNCTION_NAME,
    );

    const isNativeStrategy = getIsNativeStrategy(depositStrategy);
    if (!isNativeStrategy) {
      throw new Error('Withdrawal for ERC20 tokens is not yet supported');
    }

    if (!withdrawDepositPermission) {
      throw new Error('Permission is not found');
    }

    const txn = {
      to: withdrawDepositPermission.target,
      value: BigInt(0),
      data: encodeFunctionData({
        // @ts-expect-error @merlin to fix
        abi: withdrawDepositPermission.abi,
        functionName: withdrawDepositPermission.functionName,
        args: [amount],
      }),
    };

    return this.executeTxns([txn]);
  }
}
