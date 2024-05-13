import { BiconomySmartAccountV2 } from '@biconomy/account';
import { Address, Hash, Hex } from 'viem';

import { SKAccount, Txn } from '../types';

import { BaseBiconomyAAAccount } from './baseAccount';
import { BiconomySKAData, abiSVMAddress } from './common';

import { SessionIdManager } from './sessionIdManager';

import type { SupportedSigner } from '@biconomy/account/dist/_types/account';

interface BiconomySKAccountParams {
  aaAddress: Address;
  smartAccount: BiconomySmartAccountV2;
  skaSigner: SupportedSigner;
  skaData: BiconomySKAData;
}

export class BiconomySKAccount extends BaseBiconomyAAAccount implements SKAccount {
  private readonly skaSigner: SupportedSigner;

  private readonly sessionIdManager: SessionIdManager;

  constructor({ aaAddress, smartAccount, skaSigner, skaData }: BiconomySKAccountParams) {
    super({ smartAccount, aaAddress });
    this.skaSigner = skaSigner;
    this.sessionIdManager = new SessionIdManager(skaData.sessionIdMap);
  }

  async sendTxns(txns: Txn[]): Promise<Hash> {
    const params = {
      batchSessionParams: txns.map(txn => ({
        sessionSigner: this.skaSigner,
        sessionValidationModule: abiSVMAddress,
        sessionID: this.sessionIdManager.getSessionIdForTxn(txn),
      })),
    };
    const userOpStruct = await this.smartAccount.buildUserOp(txns, { params });
    userOpStruct.verificationGasLimit = '0xfffff'; // Hack because estimate is not correct ATM.
    const UserOpResp = await this.smartAccount.sendUserOp(userOpStruct, params);
    return UserOpResp.userOpHash as Hex;
  }
}
