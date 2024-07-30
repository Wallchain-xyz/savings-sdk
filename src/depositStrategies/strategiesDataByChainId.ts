import { base, baseSepolia, mainnet } from 'viem/chains';

import { DepositStrategyConfig } from './DepositStrategy';
import { baseSepoliaStrategyConfigs, baseStrategyConfigs, mainnetStrategyConfigs } from './strategies';

export const strategiesDataByChainId: { [key: string]: DepositStrategyConfig[] } = {
  [base.id]: baseStrategyConfigs as unknown as DepositStrategyConfig[],
  [baseSepolia.id]: baseSepoliaStrategyConfigs as unknown as DepositStrategyConfig[],
  [mainnet.id]: mainnetStrategyConfigs as unknown as DepositStrategyConfig[],
};
