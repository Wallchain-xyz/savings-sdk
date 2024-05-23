import { encodeFunctionData, parseAbi } from 'viem';

import { Txn } from '../../AAProviders/types';

import { CreateDepositTxnsParams } from '../types';

import { BaseBeefyStrategy } from './BaseBeefyStrategy';

const nativeVaultABI = parseAbi([
  'function depositBNB() public payable',
  'function withdrawBNB(uint256 _shares) public',
]);

export class BeefyNativeStrategy extends BaseBeefyStrategy {
  get isEOA() {
    return false;
  }

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

  async createWithdrawTxns({ amount }: CreateDepositTxnsParams): Promise<Txn[]> {
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
