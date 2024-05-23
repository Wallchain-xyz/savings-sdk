import { Address, encodeFunctionData } from 'viem';

import { Txn } from '../../AAProviders/types';

import { erc20ABI } from '../../utils/erc20ABI';

import { CreateDepositTxnsParams, CreateWithdrawTxnsParams, ParamsValuesByKey } from '../DepositStrategy';

import { BeefyERC20Strategy } from './BeefyERC20Strategy';

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

  async createWithdrawTxns({ amount, paramValuesByKey }: CreateWithdrawTxnsParams): Promise<Txn[]> {
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
