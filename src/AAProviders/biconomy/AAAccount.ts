import {
  BiconomySmartAccountV2,
  DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
  createBatchedSessionRouterModule,
  createSessionKeyManagerModule,
  getABISVMSessionKeyData,
} from '@biconomy/account';
import { Address, Hash, Hex, toFunctionSelector } from 'viem';

import { AAAccount, CreateSKAResult, Permission, Txn } from '../types';

import { BaseBiconomyAAAccount } from './baseAccount';
import { BiconomySKAData, abiSVMAddress } from './common';
import { SessionMemoryStorage } from './memoryStorage';
import { SessionIdManager } from './sessionIdManager';

interface BiconomyOwnedAAAccountParams {
  aaAddress: Address;
  eoaOwnerAddress: Address;
  smartAccount: BiconomySmartAccountV2;
}

type ABISessionData = Hex | Uint8Array;

export class BiconomyAAAccount extends BaseBiconomyAAAccount implements AAAccount {
  private readonly eoaOwnerAddress: Hex;

  constructor({ aaAddress, eoaOwnerAddress, smartAccount }: BiconomyOwnedAAAccountParams) {
    super({ smartAccount, aaAddress });
    this.eoaOwnerAddress = eoaOwnerAddress;
  }

  async createSessionKey(skaAddress: Address, permissions: Permission[]): Promise<CreateSKAResult> {
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
      permissions.map(permission => BiconomyAAAccount.toABISVMSessionKeyData(skaAddress, permission)),
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

  async sendTxns(txns: Txn[]): Promise<Hash> {
    const UserOpResp = await this.smartAccount.sendTransaction(txns);
    return UserOpResp.userOpHash as Hash;
  }

  private static async toABISVMSessionKeyData(skaAddress: Address, permission: Permission): Promise<ABISessionData> {
    return getABISVMSessionKeyData(skaAddress, {
      destContract: permission.target, // destination contract to call
      functionSelector: toFunctionSelector(permission.abi), // function selector allowed
      valueLimit: permission.valueLimit,
      rules: permission.rules.map(it => ({
        offset: 0, // TODO: implement it
        condition: 0,
        referenceValue: it.value,
      })),
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
}
