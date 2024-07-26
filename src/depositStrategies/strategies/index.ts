import { baseStrategyConfigs } from './base/deposit_strategy_configs';
import { baseSepoliaStrategyConfigs } from './base-sepolia/deposit_strategy_configs';
import { mainnetStrategyConfigs } from './mainnet/deposit_strategy_configs';

export { baseStrategyConfigs, baseSepoliaStrategyConfigs, mainnetStrategyConfigs };

export type StrategyConfigRaw = (typeof baseStrategyConfigs | typeof baseSepoliaStrategyConfigs | typeof mainnetStrategyConfigs)[number];

export type StrategyId = StrategyConfigRaw['id'];

type SingleStepWithdrawStrategyConfigRaw = StrategyConfigRaw & { isSingleStepWithdraw: true };

export type SingleStepWithdrawStrategyId = SingleStepWithdrawStrategyConfigRaw['id'];

type MultiStepWithdrawStrategyConfigRaw = StrategyConfigRaw & { isSingleStepWithdraw: false };

export type MultiStepWithdrawStrategyId = MultiStepWithdrawStrategyConfigRaw['id'];

export type BeefyStrategyId =  (StrategyConfigRaw & { protocolType: 'beefy'  })['id'];

export type MoonwellStrategyId =  (StrategyConfigRaw & { protocolType: 'moonwell'  })['id'];

export type AaveV3StrategyId =  (StrategyConfigRaw & { protocolType: 'aaveV3'  })['id'];

export type VedaStrategyId = (StrategyConfigRaw & { protocolType: 'veda' })['id'];

export type MellowStrategyId = (StrategyConfigRaw & { protocolType: 'mellow' })['id'];
