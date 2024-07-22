import { base, baseSepolia, mainnet } from 'viem/chains';

import { DepositStrategyConfig } from './DepositStrategy';
import {
  StrategyConfigRaw,
  baseSepoliaStrategyConfigs,
  baseStrategyConfigs,
  mainnetStrategyConfigs,
} from './strategies';

const fixBigIntMissingInJSON = (strategy: StrategyConfigRaw) =>
  ({
    ...strategy,
    permissions: strategy.permissions.map(permission => ({
      ...permission,
      valueLimit: BigInt(permission.valueLimit),
    })),
  } as unknown as DepositStrategyConfig);

export const strategiesDataByChainId = {
  [base.id]: baseStrategyConfigs.map(fixBigIntMissingInJSON),
  [baseSepolia.id]: baseSepoliaStrategyConfigs.map(fixBigIntMissingInJSON),
  [mainnet.id]: mainnetStrategyConfigs.map(fixBigIntMissingInJSON),
};
