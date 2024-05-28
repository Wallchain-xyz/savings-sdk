import { Address, isAddressEqual } from 'viem';

import { Permission } from '../AAProviders/shared/Permission';
import { Txn } from '../AAProviders/shared/Txn';
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
  protected config: DepositStrategyConfig;

  get id(): string {
    return this.config.id;
  }

  get chainId(): ChainId {
    return this.config.chainId;
  }

  get tokenAddress(): Address {
    return this.config.tokenAddress;
  }

  get bondTokenAddress(): Address {
    return this.config.bondTokenAddress;
  }

  get isNative(): boolean {
    return isAddressEqual(this.tokenAddress, NATIVE_TOKEN_ADDRESS);
  }

  abstract readonly isEOA: boolean;

  params: string[];

  protected constructor(config: DepositStrategyConfig) {
    this.config = config;
    this.params = [];
    mapStringValuesDeep(this.config.permissions, value => {
      if (value.startsWith('{{') && value.endsWith('}}')) {
        this.params.push(value.slice(2, -2));
      }
      return value;
    });
  }

  getPermissions(paramValuesByKey?: ParamsValuesByKey): Permission[] {
    return mapStringValuesDeep(this.config.permissions, value => {
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
