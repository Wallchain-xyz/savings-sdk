import { beefyBaseNativeStrategy } from './strategies/beefy/beefyBaseNativeStrategy';
// import { beefyBscNativeStrategy } from './strategies/beefy/beefyBscNativeStrategy';

import type { DepositStrategy } from './DepositStrategy';

export function getSupportedDepositStrategies(): DepositStrategy[] {
  return [
    // commented out for now, since gas on BNB is higher than on BASE
    // beefyBscNativeStrategy,
    beefyBaseNativeStrategy,
  ];
}
