import { Address, Chain, PublicClient, Transport, isAddressEqual } from 'viem';

import { base } from 'viem/chains';

import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { BeefyEOAStrategy } from './beefy/BeefyEOAStrategy';
import { BeefyERC20Strategy } from './beefy/BeefyERC20Strategy';
import { BeefyNativeStrategy } from './beefy/BeefyNativeStrategy';
import baseStrategies from './strategies/base/deposit_strategies.json';
import { DepositStrategy, DepositStrategyData } from './types';

const fixBigIntMissingInJSON = (strategy: (typeof baseStrategies)[number]) =>
  ({
    ...strategy,
    permissions: strategy.permissions.map(permission => ({
      ...permission,
      valueLimit: BigInt(permission.valueLimit),
    })),
  } as DepositStrategyData);

const strategiesDataByChainId = {
  [base.id]: baseStrategies.map(fixBigIntMissingInJSON),
};

interface StrategiesFilter {
  tokenAddress?: Address;
  bondTokenAddress?: Address;
  isNative?: boolean;
  isEOA: boolean; // TODO: this field should be probably renamed to `supportsExternalAddress`;
}

export class StrategiesManager {
  private publicClient: PublicClient<Transport, Chain>;

  private strategies: { [key: string]: DepositStrategy };

  constructor(publicClient: PublicClient<Transport, Chain>) {
    this.publicClient = publicClient;

    const chainId = publicClient.chain.id;
    if (!(chainId in strategiesDataByChainId)) {
      this.strategies = {};
    } else {
      const rawData = strategiesDataByChainId[chainId as keyof typeof strategiesDataByChainId];

      const strategiesArray = rawData.map(strategyData => {
        if (strategyData.type === 'beefyAA') {
          if (strategyData.tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS) {
            return new BeefyNativeStrategy(strategyData, this.publicClient);
          }
          return new BeefyERC20Strategy(strategyData, this.publicClient);
        }
        return new BeefyEOAStrategy(strategyData, this.publicClient);
      });
      this.strategies = Object.fromEntries(strategiesArray.map(strategy => [strategy.id, strategy]));
    }
  }

  getStrategy(strategyId: string): DepositStrategy {
    if (!(strategyId in this.strategies)) {
      throw new Error(`Deposit with id - ${strategyId} not found.`);
    }
    return this.strategies[strategyId];
  }

  getStrategies(): DepositStrategy[] {
    return Object.values(this.strategies);
  }

  findStrategy(filter: StrategiesFilter): DepositStrategy {
    const listResult = this.findAllStrategies(filter);
    if (listResult.length === 0) {
      throw new Error(`Deposit strategy for given filter ${filter} not found.`);
    }
    return listResult[0];
  }

  findAllStrategies(filter: StrategiesFilter): DepositStrategy[] {
    return this.getStrategies().filter(strategy => {
      return (
        (filter.tokenAddress === undefined || isAddressEqual(strategy.tokenAddress, filter.tokenAddress)) &&
        (filter.bondTokenAddress === undefined || isAddressEqual(strategy.bondTokenAddress, filter.bondTokenAddress)) &&
        (filter.isNative === undefined || strategy.isNative === filter.isNative) &&
        (filter.isEOA === undefined || strategy.isEOA === filter.isEOA)
      );
    });
  }
}
