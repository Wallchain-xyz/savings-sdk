import { DepositStrategyNotFoundError } from './DepositStrategy';
import { getSupportedDepositStrategies } from './getSupportedStrategies';

import type { DepositStrategy, DepositStrategyId } from './DepositStrategy';

export function getDepositStrategyById(strategyId: DepositStrategyId): DepositStrategy {
  const supportedStrategies = getSupportedDepositStrategies();
  const strategy = supportedStrategies.find(strategy => strategy.id === strategyId);

  if (!strategy) {
    throw new DepositStrategyNotFoundError(strategyId);
  }

  return strategy;
}
