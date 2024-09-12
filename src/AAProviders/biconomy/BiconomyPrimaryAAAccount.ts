import {
  BiconomySmartAccountV2,
  DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
  Rule,
  createBatchedSessionRouterModule,
  createSessionKeyManagerModule,
  getABISVMSessionKeyData,
} from '@biconomy/account';
import { Address, Hex, getAbiItem, isHex, padHex, toHex } from 'viem';

import { notNull } from '../../utils/notNull';
import { Permission } from '../shared/Permission';
import { CreateSKAResult, CreateSessionKeyParams, PrimaryAAAccount } from '../shared/PrimaryAAAccount';
import { Txn } from '../shared/Txn';
import { UserOperationV06 } from '../shared/UserOperationV06';

import { BiconomyAAAccount } from './BiconomyAAAccount';
import { SessionIdManager } from './SessionIdManager';
import { SessionMemoryStorage } from './SessionMemoryStorage';
import { BiconomySKAData, abiSVMAddress, biconomyUserOpStructToUserOp, permissionToSelector } from './shared';

interface BiconomyPrimaryAAAccountParams {
  aaAddress: Address;
  eoaOwnerAddress: Address;
  smartAccount: BiconomySmartAccountV2;
}

type ABISessionData = Hex | Uint8Array;

export class BiconomyPrimaryAAAccount extends BiconomyAAAccount implements PrimaryAAAccount {
  private readonly eoaOwnerAddress: Hex;

  constructor({ aaAddress, eoaOwnerAddress, smartAccount }: BiconomyPrimaryAAAccountParams) {
    super({ smartAccount, aaAddress });
    this.eoaOwnerAddress = eoaOwnerAddress;
  }

  async getRevokeSessionKeyTxn(_: Address): Promise<Txn> {
    throw new Error("Biconomy doesn't support revoking of SKA");
  }

  async createSessionKey({ skaAddress, permissions }: CreateSessionKeyParams): Promise<CreateSKAResult> {
    const storage = new SessionMemoryStorage();
    const sessionModule = await createSessionKeyManagerModule({
      moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
      smartAccountAddress: this.aaAddress,
      sessionStorageClient: storage,
    });
    const sessionBatchModule = await createBatchedSessionRouterModule({
      moduleAddress: DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
      sessionKeyManagerModule: sessionModule,
      smartAccountAddress: this.aaAddress,
    });
    const abiSVMSessionKeyDatas = await Promise.all(
      permissions.map(permission => BiconomyPrimaryAAAccount.toABISVMSessionKeyData(skaAddress, permission)),
    );
    const { data: createSessionData, sessionIDInfo: perPermissionSessionIds } =
      await sessionBatchModule.createSessionData(
        abiSVMSessionKeyDatas.map(data => ({
          validUntil: 0,
          validAfter: 0,
          sessionValidationModule: abiSVMAddress,
          sessionPublicKey: skaAddress,
          sessionKeyData: data as Hex,
        })),
      );

    const sessionIdManager = new SessionIdManager();
    for (let idx = 0; idx < permissions.length; idx++) {
      const permission = permissions[idx];
      sessionIdManager.storeSessionIdForPermission(permission, perPermissionSessionIds[idx]);
    }
    const txnsToActivate: Txn[] = [
      ...(await this.createEnableModuleTxn(this.smartAccount, DEFAULT_SESSION_KEY_MANAGER_MODULE)),
      ...(await this.createEnableModuleTxn(this.smartAccount, DEFAULT_BATCHED_SESSION_ROUTER_MODULE)),
      {
        to: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        data: createSessionData as Hex,
        value: 0n,
      },
    ];
    const data: BiconomySKAData = {
      storageData: storage.serializeToString(),
      aaAddress: this.aaAddress,
      eoaOwnerAddress: this.eoaOwnerAddress,
      sessionIdMap: sessionIdManager.data,
    };
    return {
      serializedSKAData: JSON.stringify(data),
      txnsToActivate,
    };
  }

  async buildUserOp(txns: Txn[]): Promise<UserOperationV06> {
    const userOp = await this.smartAccount.buildUserOp(txns);
    return biconomyUserOpStructToUserOp(userOp);
  }

  private static async toABISVMSessionKeyData(skaAddress: Address, permission: Permission): Promise<ABISessionData> {
    return getABISVMSessionKeyData(skaAddress, {
      destContract: permission.target,
      functionSelector: permissionToSelector(permission),
      valueLimit: permission.valueLimit,
      rules: BiconomyPrimaryAAAccount.getPermissionRules(permission),
    });
  }

  private async createEnableModuleTxn(smartAccount: BiconomySmartAccountV2, moduleAddr: Address): Promise<Txn[]> {
    if ((await smartAccount.isAccountDeployed()) && (await smartAccount.isModuleEnabled(moduleAddr))) {
      return [];
    }
    const enableModuleData = await smartAccount.getEnableModuleData(moduleAddr);
    return [
      {
        to: enableModuleData.to as Address,
        data: enableModuleData.data! as Address,
        value: 0n,
      },
    ];
  }

  private static getPermissionRules({ abi, args, functionName }: Permission): Rule[] {
    // This function encodes arg rules into low-level rules.
    // The main goal is to generate proper `offset` and `referenceValue` values,
    // that represent exact bytes that should be compared by smart contract
    // with bytes inside call data
    const abiItem = getAbiItem({
      abi,
      args,
      name: functionName,
    });
    if (abiItem?.type !== 'function') {
      throw Error(`${functionName} not found in abi`);
    }

    return args
      .map(
        (arg, i) =>
          arg && {
            offset: i * 32,
            condition: arg.operator,
            referenceValue: padHex(isHex(arg.value) ? arg.value : toHex(arg.value as Parameters<typeof toHex>[0]), {
              size: 32,
            }),
          },
      )
      .filter(notNull);
  }
}
