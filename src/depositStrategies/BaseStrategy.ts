import { Permission, Txn } from '../AAProviders/types';
import { ChainId } from '../api/auth/__generated__/createApiClient';

import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { mapStringValuesDeep } from '../utils/mapValuesDeep';

import { CreateDepositTxnsParams, CreateWithdrawTxnsParams, DepositStrategy, DepositStrategyData } from './types';

import type { Address } from 'viem';

export abstract class BaseDepositStrategy implements DepositStrategy {
  protected data: DepositStrategyData;

  get id(): string {
    return this.data.id;
  }

  get chainId(): ChainId {
    return this.data.chainId;
  }

  get tokenAddress(): Address {
    return this.data.tokenAddress;
  }

  get bondTokenAddress(): Address {
    return this.data.bondTokenAddress;
  }

  get isNative(): boolean {
    return this.tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS;
  }

  abstract readonly isEOA: boolean;

  templateParams: string[];

  protected constructor(data: DepositStrategyData) {
    this.data = data;
    // Setup template params
    this.templateParams = [];
    mapStringValuesDeep(this.data.permissions, value => {
      if (value.startsWith('{{') && value.endsWith('}}')) {
        this.templateParams.push(value.slice(2, -2));
      }
      return value;
    });
  }

  buildPermissions(paramValuesByKey: { [p: string]: string }): Permission[] {
    return mapStringValuesDeep(this.data.permissions, value => {
      if (value.startsWith('{{') && value.endsWith('}}')) {
        const paramKey = value.slice(2, -2);
        if (!(paramKey in paramValuesByKey)) {
          throw new Error(`Value is not provided for permissions - ${paramKey}`);
        }
        return paramValuesByKey[paramKey];
      }
      return value;
    });
  }

  abstract createDepositTxns(params: CreateDepositTxnsParams): Promise<Txn[]>;

  abstract createWithdrawTxns(params: CreateWithdrawTxnsParams): Promise<Txn[]>;

  abstract bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint>;

  abstract tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint>;
}
