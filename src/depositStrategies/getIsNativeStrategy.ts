import type { DepositStrategy } from './DepositStrategy';

const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export function getIsNativeStrategy(strategy: DepositStrategy) {
  return strategy.tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS;
}
