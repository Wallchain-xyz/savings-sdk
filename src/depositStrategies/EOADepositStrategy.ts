import { Address, encodeFunctionData } from 'viem';

import { Txn } from '../AAProviders/shared/Txn';
import { erc20ABI } from '../utils/erc20ABI';

import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategy,
  DepositStrategyConfig,
  ParamsValuesByKey,
} from './DepositStrategy';

export class EOADepositStrategy extends DepositStrategy {
  private innerStrategy: DepositStrategy;

  get isEOA() {
    return true;
  }

  constructor(config: DepositStrategyConfig, erc20Strategy: DepositStrategy) {
    super(config);
    this.innerStrategy = erc20Strategy;
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
      ...(await this.innerStrategy.createDepositTxns({ amount, paramValuesByKey })),
    ];
  }

  async createWithdrawTxns({ amount, paramValuesByKey }: CreateWithdrawTxnsParams): Promise<Txn[]> {
    return [
      ...(await this.innerStrategy.createWithdrawTxns({ amount, paramValuesByKey })),
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

  bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint> {
    return this.innerStrategy.bondTokenAmountToTokenAmount(amount);
  }

  tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint> {
    return this.innerStrategy.tokenAmountToBondTokenAmount(amount);
  }
}
