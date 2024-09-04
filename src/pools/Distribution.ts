import { Txn } from '../AAProviders/shared/Txn';
import { ParamsValuesByKey } from '../depositStrategies/DepositStrategy';
import { StrategyId } from '../depositStrategies/strategies';
import { StrategiesManager } from '../depositStrategies/StrategiesManager';
import { assertNever } from '../utils/assertNever';

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

interface MakeDistributionTxnsParams {
  distribution: Distribution;
  amount: bigint;
  paramValuesByKey: ParamsValuesByKey;
  strategies: StrategiesManager;
}

export async function createDepositDistributionTxns(params: MakeDistributionTxnsParams): Promise<Txn[]> {
  const { distribution, amount, paramValuesByKey, strategies } = params;
  switch (distribution.kind) {
    case 'simple': {
      return strategies.getStrategy(distribution.strategyId).createDepositTxns({
        amount,
        paramValuesByKey,
      });
    }
    case 'sequence': {
      const promiseResults = await Promise.all([
        strategies.getStrategy(distribution.strategyId).createDepositTxns({
          amount,
          paramValuesByKey,
        }),
        createDepositDistributionTxns({
          ...params,
          distribution: distribution.bondTokenDistribution,
        }),
      ]);
      return promiseResults.flatMap(it => it);
    }
    case 'split': {
      const res = await Promise.all(
        distribution.percentages.map(percentage => {
          return createDepositDistributionTxns({
            ...params,
            distribution: percentage.distribution,
            amount: (amount * BigInt(percentage.percent)) / 100n,
          });
        }),
      );
      return res.flatMap(it => it);
    }
    default: {
      assertNever(distribution);
    }
  }
  throw new Error('Unreachable');
}
