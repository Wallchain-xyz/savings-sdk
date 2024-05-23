import { encodeFunctionData, parseAbi } from 'viem';

import { Txn } from '../../AAProviders/types';

import { CreateDepositTxnsParams } from '../types';

import { BaseBeefyStrategy } from './BaseBeefyStrategy';

const erc20ABI = parseAbi(['function approve(address spender, uint256 amount) external returns (bool)']);
const erc20VaultABI = parseAbi(['function deposit(uint _amount) public', 'function withdraw(uint256 _shares) public']);

export class BeefyERC20Strategy extends BaseBeefyStrategy {
  get isEOA() {
    return false;
  }

  async createDepositTxns({ amount }: CreateDepositTxnsParams): Promise<Txn[]> {
    return [
      {
        to: this.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [this.bondTokenAddress, amount],
        }),
      },
      {
        to: this.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20VaultABI,
          functionName: 'deposit',
          args: [amount],
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
          abi: erc20VaultABI,
          functionName: 'withdraw',
          args: [amount],
        }),
      },
    ];
  }
}
