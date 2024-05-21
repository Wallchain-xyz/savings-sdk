import { getSupportedDepositStrategies } from '../../depositStrategies';
import { DepositStrategyType } from '../../depositStrategies/DepositStrategy';

import { USDC_TOKEN_ADDRESS } from './consts';

export function findUsdcEoaStrategy() {
  const supportedDepositStrategies = getSupportedDepositStrategies();
  const usdcEOAStrategy = supportedDepositStrategies.find(strategy => {
    return (
      strategy.tokenAddress.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase() &&
      strategy.type === DepositStrategyType.beefyEOA
    );
  });
  if (!usdcEOAStrategy) {
    throw new Error('Can not find usdcStrategy');
  }
  return usdcEOAStrategy;
}
