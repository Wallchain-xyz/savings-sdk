export class StrategyNotFoundError extends Error {
  constructor(strategyId: string) {
    super(`Deposit with id - ${strategyId} not found.`);
  }
}
