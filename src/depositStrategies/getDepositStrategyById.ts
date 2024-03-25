import type { DepositStrategy, DepositStrategyId } from "./DepositStrategy";
import { DepositStrategyNotFoundError } from "./DepositStrategy";
import { getSupportedDepositStrategies } from "./getSupportedStrategies";

export function getDepositStrategyById(
  depositStrategyId: DepositStrategyId
): DepositStrategy {
  const supportedDepositStrategies = getSupportedDepositStrategies();
  const depositStrategy = supportedDepositStrategies.find(
    (depositStrategy) => depositStrategy.id === depositStrategyId
  );

  if (!depositStrategy) {
    throw new DepositStrategyNotFoundError(depositStrategyId);
  }

  return depositStrategy;
}
