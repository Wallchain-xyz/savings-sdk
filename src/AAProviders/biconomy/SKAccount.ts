import { BiconomySmartAccountV2 } from '@biconomy/account';
import { Address, Hash, decodeFunctionData } from 'viem';

import { SKAccount, Txn, UserOperationV06 } from '../types';

import { BiconomyAccountAbi } from './abi';
import { BaseBiconomyAAAccount } from './baseAccount';
import { BiconomySKAData, abiSVMAddress, denormalizeUserOp, normalizeUserOp } from './common';

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

  async buildUserOp(txns: Txn[]): Promise<UserOperationV06> {
    const userOp = await this.smartAccount.buildUserOp(txns, { params: this.makeParamsForTxns(txns) });
    userOp.verificationGasLimit = '0xfffff'; // Hack because estimate is not correct ATM.
    return normalizeUserOp(userOp);
  }

  async sendUserOp(userOp: UserOperationV06): Promise<Hash> {
    const txns = this.decodeTxnsFromUserOp(userOp);
    const { userOpHash } = await this.smartAccount.sendUserOp(denormalizeUserOp(userOp), this.makeParamsForTxns(txns));
    return userOpHash as Hash;
  }

  private makeParamsForTxns(txns: Txn[]) {
    return {
      batchSessionParams: txns.map(txn => ({
        sessionSigner: this.skaSigner,
        sessionValidationModule: abiSVMAddress,
        sessionID: this.sessionIdManager.getSessionIdForTxn(txn),
      })),
    };
  }

  private decodeTxnsFromUserOp(userOp: UserOperationV06): Txn[] {
    const decodeResult = decodeFunctionData({
      abi: BiconomyAccountAbi,
      data: userOp.callData,
    });
    if (decodeResult.functionName === 'executeBatch_y6U' || decodeResult.functionName === 'executeBatch') {
      const txns = [];
      const [toAddresses, values, datas] = decodeResult.args;
      for (let index = 0; index < toAddresses.length; index++) {
        txns.push({
          to: toAddresses[index],
          value: values[index],
          data: datas[index],
        });
      }
      return txns;
    }
    if (decodeResult.functionName === 'execute' || decodeResult.functionName === 'execute_ncC') {
      const [to, value, data] = decodeResult.args;
      return [
        {
          to,
          value,
          data,
        },
      ];
    }
    throw new Error('UserOp callData is invalid');
  }
}
