import {
  KernelAccountAbi,
  KernelValidator,
  addressToEmptyAccount,
  createKernelAccount,
  createKernelAccountClient,
} from '@zerodev/sdk';
import { KernelAccountClient } from '@zerodev/sdk/clients/kernelAccountClient';
import {
  Permission,
  SESSION_KEY_VALIDATOR_ADDRESS,
  SessionKeyValidatorAbi,
  serializeSessionKeyAccount,
  signerToSessionKeyValidator,
} from '@zerodev/session-key';

import { bundlerActions } from 'permissionless';
import { SponsorUserOperationReturnType } from 'permissionless/actions/smartAccount/prepareUserOperationRequest';
import {
  Abi,
  Address,
  Chain,
  type Client,
  Hex,
  HttpTransport,
  PrivateKeyAccount,
  createPublicClient,
  encodeFunctionData,
  getAbiItem,
  toFunctionSelector,
  zeroAddress,
} from 'viem';

import { ChainId } from '../api/auth/__generated__/createApiClient';
import { WallchainAuthMessage } from '../api/SavingsBackendClient';
import { ActiveStrategy, ActiveStrategyParamValuesByKey } from '../api/ska/__generated__/createApiClient';
import { DepositStrategyId, DepositStrategyType } from '../depositStrategies/DepositStrategy';
import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import { getIsNativeStrategy } from '../depositStrategies/getIsNativeStrategy';

import { mapValuesDeep } from '../utils/mapValuesDeep';

import { AAManagerEntryPoint, entryPoint } from './EntryPoint';
import { createRequestAllowanceTxn } from './requests/createRequestAllowanceTxn';
import { createPimlicoTransport } from './transports/createPimlicoTransport';
import { createRPCTransport } from './transports/createRPCTransport';
import { AllowanceParams, ERC20_ALLOWANCE_FUNCTION_NAME, createAllowanceTxn } from './txns/createAllowanceTxn';
import { createERC20AddDepositTxn } from './txns/createERC20AddDepositTxn';
import { ERC20_TRANSFER_FUNCTION_NAME, createERC20TransferTxn } from './txns/createERC20TransferTxn';
import { createNativeAddDepositTxn } from './txns/createNativeAddDepositTxn';

import { TRANSFER_FROM_FUNCTION_NAME, createTransferFromTxn } from './txns/createTransferFromTxn';
import { UserOperation } from './UserOperation';

import type { KernelSmartAccount } from '@zerodev/sdk/accounts';
import type { GetUserOperationReceiptReturnType } from 'permissionless/_types/actions/bundler/getUserOperationReceipt';

const ERC20_ADD_DEPOSIT_FUNCTION_NAME = 'deposit';
const ERC20_WITHDRAW_DEPOSIT_FUNCTION_NAME = 'withdraw';
// This is the same for all native coins, not just BNB
const NATIVE_ADD_DEPOSIT_FUNCTION_NAME = 'depositBNB';
const NATIVE_WITHDRAW_DEPOSIT_FUNCTION_NAME = 'withdrawBNB';

type AAManagerTransport = HttpTransport;
type AAManagerSmartAccount = KernelSmartAccount<AAManagerEntryPoint>;

interface MinimumTxn {
  to: Address;
  value: bigint;
  data: Hex;
}

type GetSponsorshipInfo = (
  userOperation: UserOperation,
) => Promise<SponsorUserOperationReturnType<AAManagerEntryPoint>>;
type PickedPrivateKeyAccount = Pick<PrivateKeyAccount, 'signTypedData'> & {
  address?: PrivateKeyAccount['address'];
};

interface ConstructorParams {
  sudoValidator: KernelValidator<AAManagerEntryPoint>;
  privateKeyAccount: PickedPrivateKeyAccount;
  apiKey: string;
  chainId: ChainId;
  getSponsorshipInfo: GetSponsorshipInfo;
}

export interface WithdrawOrDepositParams {
  depositStrategyId: DepositStrategyId;
  amount: bigint;
}

interface PrepareSessionKeyAccountParams {
  sessionKeyAccountAddress: Address;
  activeStrategies: ActiveStrategy[];
}

export class AAManager<TChain extends Chain> {
  private _aaAccountClient:
    | KernelAccountClient<AAManagerEntryPoint, AAManagerTransport, TChain, AAManagerSmartAccount>
    | undefined;

  get aaAccountClient() {
    if (!this._aaAccountClient) {
      throw new Error('Call init() before using aaAccountClient');
    }
    return this._aaAccountClient;
  }

  private readonly sudoValidator: KernelValidator<AAManagerEntryPoint>;

  private readonly privateKeyAccount: PickedPrivateKeyAccount;

  private readonly publicClient: Client<AAManagerTransport, TChain, undefined>;

  private readonly bundlerTransport: AAManagerTransport;

  private readonly getSponsorshipInfo: GetSponsorshipInfo;

  constructor({ sudoValidator, apiKey, chainId, privateKeyAccount, getSponsorshipInfo }: ConstructorParams) {
    this.sudoValidator = sudoValidator;
    this.privateKeyAccount = privateKeyAccount;
    this.publicClient = createPublicClient({
      transport: createRPCTransport({ chainId }),
    });

    this.bundlerTransport = createPimlicoTransport({ chainId, pimlicoApiKey: apiKey });
    this.getSponsorshipInfo = getSponsorshipInfo;
  }

  // TODO: A need in calling init() after constructor can create errors. Can we
  // create a static build method and pass already inited objects into
  // constructor to just write down? This will also make sure constructor will
  // not throw (which is a preferable way)
  async init() {
    const aaAccount = await createKernelAccount(this.publicClient, {
      entryPoint,
      plugins: {
        sudo: this.sudoValidator,
      },
    });
    this._aaAccountClient = createKernelAccountClient({
      entryPoint,
      account: aaAccount,
      bundlerTransport: this.bundlerTransport,
      middleware: {
        sponsorUserOperation: async ({ userOperation }) => {
          const sponsorshipInfo = await this.getSponsorshipInfo(userOperation);
          return {
            ...userOperation,
            ...sponsorshipInfo,
          };
        },
      },
    });
  }

  get aaAddress(): Address {
    return this.aaAccountClient.account.address;
  }

  createAuthMessage(): WallchainAuthMessage {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    const expiresInt = Math.floor(expires.getTime() / 1000); // Convert to seconds
    return {
      info: 'Confirm Address for Wallchain Auto-Yield',
      aa_address: this.aaAddress,
      expires: expiresInt,
    };
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
    // we need more granular control over this
    return this.executeTxns([
      {
        to: SESSION_KEY_VALIDATOR_ADDRESS,
        value: 0n,
        data: encodeFunctionData({
          abi: SessionKeyValidatorAbi,
          functionName: 'disable',
          args: [sessionKeyAccountAddress],
        }),
      },
    ]);
  }

  async signSKA({ sessionKeyAccountAddress, activeStrategies }: PrepareSessionKeyAccountParams) {
    const emptySessionKeySigner = addressToEmptyAccount(sessionKeyAccountAddress);

    // TODO: @merlin remove permissions duplication
    const permissions = activeStrategies
      .map(activeStrategy => {
        const strategy = getDepositStrategyById(activeStrategy.strategyId);
        return strategy.permissions.map(permission =>
          AAManager.replacePlaceholdersInPermission(permission, {
            eoaAddress: activeStrategy.paramValuesByKey?.eoaAddress ?? null,
            aaAddress: this.aaAddress,
          }),
        );
      })
      .flat();

    const sessionKeyValidator = await signerToSessionKeyValidator(this.publicClient, {
      entryPoint,
      signer: emptySessionKeySigner,
      validatorData: {
        permissions,
      },
    });

    const sessionKeyAccount = await createKernelAccount(this.publicClient, {
      entryPoint,
      plugins: {
        sudo: this.sudoValidator,
        regular: sessionKeyValidator,
        action: {
          address: zeroAddress,
          selector: toFunctionSelector(getAbiItem({ abi: KernelAccountAbi, name: 'executeBatch' })),
        },
      },
    });

    return serializeSessionKeyAccount(sessionKeyAccount);
  }

  static replacePlaceholdersInPermission = (
    permission: Permission<Abi, string>,
    paramValuesByKey: ActiveStrategyParamValuesByKey,
  ): Permission<Abi, string> => {
    return mapValuesDeep(permission, valueToInterpolate => {
      if (typeof valueToInterpolate !== 'string') {
        return valueToInterpolate;
      }
      return Object.entries(paramValuesByKey).reduce((partiallyInterpolatedValue, [key, value]) => {
        const keyTemplate = `{{${key}}}`;

        if (partiallyInterpolatedValue.includes(keyTemplate) && value === undefined) {
          throw new Error(`Value is not provided for permissions - ${key}`);
        }
        return partiallyInterpolatedValue.replaceAll(keyTemplate, value as string);
      }, valueToInterpolate as string);
    }) as Permission<Abi, string>;
  };

  private async sendUserOp(txns: MinimumTxn[]) {
    return this.aaAccountClient.sendUserOperation({
      userOperation: {
        callData: await this.aaAccountClient.account.encodeCallData(txns),
      },
    });
  }

  private async getHasAllowance({ token, owner, spender, amount }: AllowanceParams): Promise<boolean> {
    const requestAllowanceTxn = createRequestAllowanceTxn({ owner, token, spender });
    const allowance: string = await this.publicClient.transport.request(requestAllowanceTxn);
    return BigInt(allowance) >= amount;
  }

  async deposit({ depositStrategyId, amount }: WithdrawOrDepositParams) {
    const depositStrategy = getDepositStrategyById(depositStrategyId);

    const isNativeStrategy = getIsNativeStrategy(depositStrategy);
    const addDepositFunctionName = isNativeStrategy
      ? NATIVE_ADD_DEPOSIT_FUNCTION_NAME
      : ERC20_ADD_DEPOSIT_FUNCTION_NAME;

    // TODO: Looks like depositStrategy better be a class with ability to lookup
    // permissions by type: addDeposit, allowance, and withdraw.
    const addDepositPermission = depositStrategy.permissions.find(
      permission => permission.functionName === addDepositFunctionName,
    );
    if (!addDepositPermission) {
      throw new Error('Add deposit permission is not found');
    }

    const txns = [];
    if (isNativeStrategy) {
      const nativeAddDepositTxn = createNativeAddDepositTxn({ addDepositPermission, amount });
      txns.push(nativeAddDepositTxn);
    } else {
      const { aaAddress } = this;
      const eoaAddress = this.privateKeyAccount.address;
      if (depositStrategy.type === DepositStrategyType.beefyEOA) {
        const transferFromPermission = depositStrategy.permissions.find(
          permission => permission.functionName === TRANSFER_FROM_FUNCTION_NAME,
        );

        if (!transferFromPermission) {
          throw new Error('Transfer from permission is not found on eoa strategy');
        }

        if (!eoaAddress) {
          throw new Error('EOA address is not provided in privateKeyAccount, but deposit for EOA is initiated');
        }

        const transferFromTxn = createTransferFromTxn({
          token: transferFromPermission.target,
          from: eoaAddress,
          to: aaAddress,
          value: amount,
        });
        txns.push(transferFromTxn);
      }

      const allowancePermission = depositStrategy.permissions.find(
        permission => permission.functionName === ERC20_ALLOWANCE_FUNCTION_NAME,
      );

      if (!allowancePermission) {
        throw new Error('Allowance permission is not found');
      }

      const allowanceParams = {
        spender: addDepositPermission.target,
        owner: aaAddress,
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

  async executeTxns(txns: MinimumTxn[]): Promise<GetUserOperationReceiptReturnType> {
    const userOpHash = await this.sendUserOp(txns);

    return this.aaAccountClient.extend(bundlerActions(entryPoint)).waitForUserOperationReceipt({
      hash: userOpHash,
    });
  }

  async withdraw({ depositStrategyId, amount }: WithdrawOrDepositParams) {
    const depositStrategy = getDepositStrategyById(depositStrategyId);
    const isNativeStrategy = getIsNativeStrategy(depositStrategy);
    const functionName = isNativeStrategy
      ? NATIVE_WITHDRAW_DEPOSIT_FUNCTION_NAME
      : ERC20_WITHDRAW_DEPOSIT_FUNCTION_NAME;
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
        functionName: withdrawDepositPermission.functionName,
        args: [amount],
      }),
    };
    const txns = [txn];

    if (depositStrategy.type === DepositStrategyType.beefyEOA) {
      const eoaAddress = this.privateKeyAccount.address;

      const transferPermission = depositStrategy.permissions.find(
        permission => permission.functionName === ERC20_TRANSFER_FUNCTION_NAME,
      );

      if (!transferPermission) {
        throw new Error('Transfer from permission is not found on eoa strategy');
      }

      if (!eoaAddress) {
        throw new Error('EOA address is not provided in privateKeyAccount, but withdraw for EOA is initiated');
      }

      const transferTxn = createERC20TransferTxn({
        token: transferPermission.target,
        to: eoaAddress,
        value: amount,
      });
      txns.push(transferTxn);
    }

    return this.executeTxns(txns);
  }
}
