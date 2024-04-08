import { beefyBaseNativeStrategy } from './strategies/beefy/beefyBaseNativeStrategy';
import { beefyBscNativeStrategy } from './strategies/beefy/beefyBscNativeStrategy';

import type { DepositStrategy } from './DepositStrategy';

export function getSupportedDepositStrategies(): DepositStrategy[] {
  return [beefyBscNativeStrategy, beefyBaseNativeStrategy];
}
