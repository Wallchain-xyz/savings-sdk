import beefyBaseStrategies from './strategies/base/deposit_strategies.json';
// commented out for now, since gas on BNB is higher than on BASE
// import beefyBscNativeStrategies from './strategies/bsc/deposit_strategies.json';

import type { DepositStrategy } from './DepositStrategy';

const prepareBeefyStrategy = (strategy: (typeof beefyBaseStrategies)[number]) =>
  ({
    ...strategy,
    permissions: strategy.permissions.map(permission => ({
      ...permission,
      valueLimit: BigInt(permission.valueLimit),
    })),
  } as DepositStrategy);

export function getSupportedDepositStrategies(): DepositStrategy[] {
  return [
    ...beefyBaseStrategies,
    // ...beefyBscNativeStrategies
  ].map(prepareBeefyStrategy);
}
