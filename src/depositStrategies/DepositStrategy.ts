import { NetworkEnum } from '../api/thecat/__generated__/createApiClient';

import type { Permission } from '@zerodev/session-key';
import type { Abi, Address } from 'viem';

export type DepositStrategyId = string;
export interface DepositStrategy {
  id: DepositStrategyId;
  permissions: Permission<Abi, string>[];

  chainId: NetworkEnum;
  tokenAddress: Address;
  bondTokenAddress: Address;
}

export class DepositStrategyNotFoundError extends Error {
  constructor(depositStrategyId: DepositStrategyId) {
    super(`Deposit with id - ${depositStrategyId} not found.`);
  }
}
