import { baseStrategyConfigs } from './base/deposit_strategy_configs';
import { baseSepoliaStrategyConfigs } from './base-sepolia/deposit_strategy_configs';
import { mainnetStrategyConfigs } from './mainnet/deposit_strategy_configs';

export { baseStrategyConfigs, baseSepoliaStrategyConfigs, mainnetStrategyConfigs };

export type StrategyConfigRaw = (typeof baseStrategyConfigs | typeof baseSepoliaStrategyConfigs | typeof mainnetStrategyConfigs)[number];

export type StrategyId = StrategyConfigRaw['id'];

export type MultistepWithdrawStrategyId = (StrategyConfigRaw & { id: string, protocolType: 'veda' })['id'];

export type InstantWithdrawStrategyId = Exclude<StrategyId, MultistepWithdrawStrategyId>;
