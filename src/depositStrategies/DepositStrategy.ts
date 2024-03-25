import type { Abi, Address, Chain } from "viem";
import type { signerToSessionKeyValidator } from "@zerodev/session-key";
import type { Permission } from "@zerodev/session-key/types";

export type ValidatorData = Parameters<
  typeof signerToSessionKeyValidator
>[1]["validatorData"];

export type DepositStrategyId = string;
export interface DepositStrategy {
  id: DepositStrategyId;
  permissions: Permission<Abi, string>[];

  chain: Chain;
  tokenAddress: Address;
  bondTokenAddress: Address;
}

export class DepositStrategyNotFoundError extends Error {
  constructor(depositStrategyId: DepositStrategyId) {
    super(`Deposit with id - ${depositStrategyId} not found.`);
  }
}
