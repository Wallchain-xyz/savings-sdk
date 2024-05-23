import { Permission, Txn } from '../AAProviders/types';
import { ChainId } from '../api/auth/__generated__/createApiClient';

import type { Address } from 'viem';

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

export interface DepositStrategyData {
  id: DepositStrategyId;
  type: DepositStrategyType;
  permissions: Permission[];

  chainId: ChainId;
  tokenAddress: Address;
  bondTokenAddress: Address;
}

export interface DepositStrategy {
  readonly id: DepositStrategyId;
  readonly chainId: ChainId;
  readonly tokenAddress: Address;
  readonly bondTokenAddress: Address;
  readonly isNative: boolean;
  readonly isEOA: boolean;
  readonly templateParams: string[];

  createDepositTxns(params: CreateDepositTxnsParams): Promise<Txn[]>;
  createWithdrawTxns(params: CreateWithdrawTxnsParams): Promise<Txn[]>;

  buildPermissions(paramValuesByKey: { [key: string]: string | null }): Permission[];
  bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint>;
  tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint>;
}
