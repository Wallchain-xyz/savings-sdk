import { StrategyId } from '../depositStrategies/strategies';

type SimpleDistributionKind = 'simple';

export interface SimpleDistribution {
  kind: SimpleDistributionKind;
  strategyId: StrategyId;
}

export interface Percentage {
  percent: number;
  // eslint-disable-next-line no-use-before-define
  distribution: Distribution;
}

type SplitDistributionKind = 'split';

export interface SplitDistribution {
  kind: SplitDistributionKind;
  percentages: Percentage[];
}

type SequenceDistributionKind = 'sequence';

export interface SequenceDistribution {
  kind: SequenceDistributionKind;
  strategyId: StrategyId;
  // eslint-disable-next-line no-use-before-define
  bondTokenDistribution: Distribution;
}

export type Distribution = SimpleDistribution | SplitDistribution | SequenceDistribution;
