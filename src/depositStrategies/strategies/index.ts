import { baseStrategyConfigs } from './base/deposit_strategy_configs';
import { baseSepoliaStrategyConfigs } from './base-sepolia/deposit_strategy_configs';
import { mainnetStrategyConfigs } from './mainnet/deposit_strategy_configs';

export { baseStrategyConfigs, baseSepoliaStrategyConfigs, mainnetStrategyConfigs };

type StrategyConfigRaw = (typeof baseStrategyConfigs | typeof baseSepoliaStrategyConfigs | typeof mainnetStrategyConfigs)[number];

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

export type PendleStrategyId = (StrategyConfigRaw & { protocolType: 'pendle' })['id'];

export type FuelStrategyId = (StrategyConfigRaw & { protocolType: 'fuel' })['id'];

export type MezoStrategyId = (StrategyConfigRaw & { protocolType: 'mezo' })['id'];

export type SolvStrategyId = (StrategyConfigRaw & { protocolType: 'solv' })['id'];

export type DummyStrategyId = (StrategyConfigRaw & { protocolType: 'dummy' })['id'];
