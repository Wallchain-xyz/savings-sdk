import { ChainId } from '../api/auth/__generated__/createApiClient';

import type { Permission } from '@zerodev/session-key';
import type { Abi, Address } from 'viem';

export type DepositStrategyId = string;

export enum DepositStrategyType {
  beefyAA = 'beefyAA',
  beefyEOA = 'beefyEOA',
}

export interface DepositStrategy {
  id: DepositStrategyId;
  type: DepositStrategyType;
  permissions: Permission<Abi, string>[];

  chainId: ChainId;
  tokenAddress: Address;
  bondTokenAddress: Address;
}

export class DepositStrategyNotFoundError extends Error {
  constructor(depositStrategyId: DepositStrategyId) {
    super(`Deposit with id - ${depositStrategyId} not found.`);
  }
}
