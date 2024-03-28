import type { Permission, signerToSessionKeyValidator } from '@zerodev/session-key';
import type { Abi, Address } from 'viem';

export type ValidatorData = Parameters<typeof signerToSessionKeyValidator>[1]['validatorData'];

export type DepositStrategyId = string;
export interface DepositStrategy {
  id: DepositStrategyId;
  permissions: Permission<Abi, string>[];

  chainId: number;
  tokenAddress: Address;
  bondTokenAddress: Address;
}

export class DepositStrategyNotFoundError extends Error {
  constructor(depositStrategyId: DepositStrategyId) {
    super(`Deposit with id - ${depositStrategyId} not found.`);
  }
}
