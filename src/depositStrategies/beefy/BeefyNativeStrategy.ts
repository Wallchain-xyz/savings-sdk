import { encodeFunctionData, parseAbi } from 'viem';

import { Txn } from '../../AAProviders/shared/Txn';
import { CreateDepositTxnsParams, CreateWithdrawTxnsParams } from '../DepositStrategy';

import { BeefyStrategy } from './BeefyStrategy';

const nativeVaultABI = parseAbi([
  'function depositBNB() public payable',
  'function withdrawBNB(uint256 _shares) public',
]);

export class BeefyNativeStrategy extends BeefyStrategy {
  async createDepositTxns({ amount }: CreateDepositTxnsParams): Promise<Txn[]> {
    return [
      {
        to: this.bondTokenAddress,
        value: amount,
        data: encodeFunctionData({
          abi: nativeVaultABI,
          functionName: 'depositBNB',
          args: [],
        }),
      },
    ];
  }

  async createWithdrawTxns({ amount }: CreateWithdrawTxnsParams): Promise<Txn[]> {
    return [
      {
        to: this.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: nativeVaultABI,
          functionName: 'withdrawBNB',
          args: [amount],
        }),
      },
    ];
  }
}
