import { BiconomySmartAccountV2 } from '@biconomy/account';
import { Address, Hash, decodeFunctionData } from 'viem';

import { SKAccount } from '../shared/SKAccount';
import { Txn } from '../shared/Txn';
import { UserOperationV06 } from '../shared/UserOperationV06';

import { biconomyAccountAbi } from './abi';
import { BiconomyAAAccount } from './BiconomyAAAccount';
import { SessionIdManager } from './SessionIdManager';
import { BiconomySKAData, abiSVMAddress, biconomyUserOpStructToUserOp, userOpToBiconomyUserOpStruct } from './shared';

import type { SupportedSigner } from '@biconomy/account/dist/_types/account';

interface BiconomySKAccountParams {
  aaAddress: Address;
  smartAccount: BiconomySmartAccountV2;
  skaSigner: SupportedSigner;
  skaData: BiconomySKAData;
}

export class BiconomySKAccount extends BiconomyAAAccount implements SKAccount {
  private readonly skaSigner: SupportedSigner;

  private readonly sessionIdManager: SessionIdManager;

  constructor({ aaAddress, smartAccount, skaSigner, skaData }: BiconomySKAccountParams) {
    super({ smartAccount, aaAddress });
    this.skaSigner = skaSigner;
    this.sessionIdManager = new SessionIdManager(skaData.sessionIdMap);
  }

  async buildUserOp(txns: Txn[]): Promise<UserOperationV06> {
    const userOp = await this.smartAccount.buildUserOp(txns, { params: this.createParamsForTxns(txns) });
    userOp.verificationGasLimit = '0xfffff'; // Hack because estimate is not correct ATM.
    return biconomyUserOpStructToUserOp(userOp);
  }

  async sendUserOp(userOp: UserOperationV06): Promise<Hash> {
    const txns = this.decodeTxnsFromUserOp(userOp);
    const { userOpHash } = await this.smartAccount.sendUserOp(
      userOpToBiconomyUserOpStruct(userOp),
      this.createParamsForTxns(txns),
    );
    return userOpHash as Hash;
  }

  private createParamsForTxns(txns: Txn[]) {
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
      abi: biconomyAccountAbi,
      data: userOp.callData,
    });
    const { args, functionName } = decodeResult;
    switch (functionName) {
      case 'executeBatch':
      case 'executeBatch_y6U': {
        const [addresses, values, datas] = args;
        return addresses.map((address, index) => ({
          to: address,
          value: values[index],
          data: datas[index],
        }));
      }
      case 'execute':
      case 'execute_ncC': {
        const [to, value, data] = decodeResult.args;
        return [
          {
            to,
            value,
            data,
          },
        ];
      }
      default:
        throw new Error('UserOp callData is invalid');
    }
  }
}
