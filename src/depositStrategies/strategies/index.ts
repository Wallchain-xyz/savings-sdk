import { baseStrategyConfigs } from './base/deposit_strategy_configs';
import { baseSepoliaStrategyConfigs } from './base-sepolia/deposit_strategy_configs';
import { mainnetStrategyConfigs } from './mainnet/deposit_strategy_configs';

export { baseStrategyConfigs, baseSepoliaStrategyConfigs, mainnetStrategyConfigs };

export type StrategyConfigRaw = (typeof baseStrategyConfigs | typeof baseSepoliaStrategyConfigs | typeof mainnetStrategyConfigs)[number];

export type StrategyId = StrategyConfigRaw['id'];

export type SingleStepWithdrawStrategyId = (StrategyConfigRaw & { id: string, isSingleStepWithdraw: true })['id'];

export type MultiStepWithdrawStrategyId = (StrategyConfigRaw & { id: string, isSingleStepWithdraw: false })['id'];

export type BeefyStrategyId =  (StrategyConfigRaw & { protocolType: 'beefy'  })['id'];

export type MoonwellStrategyId =  (StrategyConfigRaw & { protocolType: 'moonwell'  })['id'];

export type AaveV3StrategyId =  (StrategyConfigRaw & { protocolType: 'aaveV3'  })['id'];

export type VedaStrategyId = (StrategyConfigRaw & { protocolType: 'veda' })['id'];
