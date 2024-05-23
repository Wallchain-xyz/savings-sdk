import { Address, isAddressEqual } from 'viem';

import { Permission, Txn } from '../AAProviders/types';
import { ChainId } from '../api/auth/__generated__/createApiClient';

import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { mapStringValuesDeep } from '../utils/mapValuesDeep';

export interface ParamsValuesByKey {
  [key: string]: string | null;
}

export interface CreateDepositTxnsParams {
  amount: bigint;
  paramValuesByKey: ParamsValuesByKey;
}

export interface CreateWithdrawTxnsParams {
  amount: bigint;
  paramValuesByKey: ParamsValuesByKey;
}

export type DepositStrategyId = string;

export enum DepositStrategyType {
  beefyAA = 'beefyAA',
  beefyEOA = 'beefyEOA',
}

export interface DepositStrategyConfig {
  id: DepositStrategyId;
  type: DepositStrategyType;
  permissions: Permission[];

  chainId: ChainId;
  tokenAddress: Address;
  bondTokenAddress: Address;
}

export abstract class DepositStrategy {
  protected data: DepositStrategyConfig;

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
    return isAddressEqual(this.tokenAddress, NATIVE_TOKEN_ADDRESS);
  }

  abstract readonly isEOA: boolean;

  params: string[];

  protected constructor(data: DepositStrategyConfig) {
    this.data = data;
    this.params = [];
    mapStringValuesDeep(this.data.permissions, value => {
      if (value.startsWith('{{') && value.endsWith('}}')) {
        this.params.push(value.slice(2, -2));
      }
      return value;
    });
  }

  getPermissions(paramValuesByKey?: ParamsValuesByKey): Permission[] {
    return mapStringValuesDeep(this.data.permissions, value => {
      if (value.startsWith('{{') && value.endsWith('}}')) {
        const paramKey = value.slice(2, -2);
        const paramValue = (paramValuesByKey ?? {})[paramKey];
        if (!paramValue) {
          throw new Error(`Value is not provided for permissions - ${paramKey}`);
        }
        return paramValue;
      }
      return value;
    });
  }

  abstract createDepositTxns(params: CreateDepositTxnsParams): Promise<Txn[]>;

  abstract createWithdrawTxns(params: CreateWithdrawTxnsParams): Promise<Txn[]>;

  abstract bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint>;

  abstract tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint>;
}
