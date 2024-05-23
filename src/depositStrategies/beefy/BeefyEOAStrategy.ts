import { Address, encodeFunctionData, parseAbi } from 'viem';

import { Txn } from '../../AAProviders/types';

import { CreateDepositTxnsParams, ParamsValuesByKey } from '../types';

import { BeefyERC20Strategy } from './BeefyERC20Strategy';

const erc20ABI = parseAbi([
  'function transferFrom(address src, address dst, uint wad) public returns (bool)',
  'function transfer(address to, uint256 value) external returns (bool)',
]);

export class BeefyEOAStrategy extends BeefyERC20Strategy {
  get isEOA() {
    return true;
  }

  async createDepositTxns({ amount, paramValuesByKey }: CreateDepositTxnsParams): Promise<Txn[]> {
    return [
      {
        to: this.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'transferFrom',
          args: [
            this.ensureAddress(paramValuesByKey, 'eoaAddress'),
            this.ensureAddress(paramValuesByKey, 'aaAddress'),
            amount,
          ],
        }),
      },
      ...(await super.createDepositTxns({ amount, paramValuesByKey })),
    ];
  }

  async createWithdrawTxns({ amount, paramValuesByKey }: CreateDepositTxnsParams): Promise<Txn[]> {
    return [
      ...(await super.createDepositTxns({ amount, paramValuesByKey })),
      {
        to: this.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'transfer',
          args: [this.ensureAddress(paramValuesByKey, 'eoaAddress'), await this.bondTokenAmountToTokenAmount(amount)],
        }),
      },
    ];
  }

  ensureAddress(params: ParamsValuesByKey, key: string): Address {
    const value = params[key];
    if (!value) {
      throw new Error(`Parameter ${key} is required!`);
    }
    if (!value.startsWith('0x')) {
      throw new Error(`Parameter ${key} value ${value} is not valid address`);
    }
    return value as Address;
  }
}
