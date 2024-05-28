// TODO: @merlin - temp solution to avoid failing TS either in build or in tests
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import baseStrategyConfigsJson from './base/deposit_strategy_configs.json' with { type: 'json' };

export const baseStrategyConfigs = baseStrategyConfigsJson
