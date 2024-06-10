import { Address, Chain, PublicClient, Transport, isAddressEqual } from 'viem';

import { base, baseSepolia } from 'viem/chains';

import { SupportedChainId } from '../AAProviders/shared/chains';
import { DepositStrategyDetailedInfo, SavingsBackendClient } from '../api/SavingsBackendClient';
import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { AccountDepositStrategy } from './AccountDepositStrategy';
import { BeefyEOAStrategy } from './beefy/BeefyEOAStrategy';
import { BeefyERC20Strategy } from './beefy/BeefyERC20Strategy';
import { BeefyNativeStrategy } from './beefy/BeefyNativeStrategy';
import { DepositStrategy, DepositStrategyConfig } from './DepositStrategy';
import { baseSepoliaStrategyConfigs, baseStrategyConfigs } from './strategies';

const fixBigIntMissingInJSON = (strategy: (typeof baseStrategyConfigs)[number]) =>
  ({
    ...strategy,
    permissions: strategy.permissions.map(permission => ({
      ...permission,
      valueLimit: BigInt(permission.valueLimit),
    })),
  } as DepositStrategyConfig);

const strategiesDataByChainId = {
  [base.id]: baseStrategyConfigs.map(fixBigIntMissingInJSON),
  [baseSepolia.id]: baseSepoliaStrategyConfigs.map(fixBigIntMissingInJSON),
};

export interface StrategiesFilter {
  tokenAddress?: Address;
  bondTokenAddress?: Address;
  isNative?: boolean;
  isEOA?: boolean; // TODO: this field should be probably renamed to `supportsExternalAddress`;
}

interface ConstructorParams {
  publicClient: PublicClient<Transport, Chain>;
  savingsBackendClient: SavingsBackendClient;
  chainId: SupportedChainId;
}

export class StrategiesManager {
  private publicClient: PublicClient<Transport, Chain>;

  private savingsBackendClient: SavingsBackendClient;

  private chainId: SupportedChainId;

  private strategiesById: { [key: string]: DepositStrategy };

  constructor({ publicClient, savingsBackendClient, chainId }: ConstructorParams) {
    this.publicClient = publicClient;
    this.savingsBackendClient = savingsBackendClient;
    this.chainId = chainId;

    if (chainId in strategiesDataByChainId) {
      const strategyConfigs = strategiesDataByChainId[chainId as keyof typeof strategiesDataByChainId];

      const strategiesArray = strategyConfigs.map(strategyConfig => {
        if (strategyConfig.type === 'beefyAA') {
          if (strategyConfig.tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS) {
            return new BeefyNativeStrategy(strategyConfig, this.publicClient);
          }
          return new BeefyERC20Strategy(strategyConfig, this.publicClient);
        }
        return new BeefyEOAStrategy(strategyConfig, this.publicClient);
      });
      this.strategiesById = Object.fromEntries(strategiesArray.map(strategy => [strategy.id, strategy]));
    } else {
      this.strategiesById = {};
    }
  }

  getStrategy(strategyId: string): DepositStrategy {
    if (!(strategyId in this.strategiesById)) {
      throw new Error(`Deposit with id - ${strategyId} not found.`);
    }
    return this.strategiesById[strategyId];
  }

  getAccountStrategy(strategyId: string, aaAddress: Address, eoaAddress: Address): AccountDepositStrategy {
    if (!(strategyId in this.strategiesById)) {
      throw new Error(`Deposit with id - ${strategyId} not found.`);
    }
    return new AccountDepositStrategy({
      strategy: this.getStrategy(strategyId),
      publicClient: this.publicClient,
      aaAddress,
      eoaAddress,
    });
  }

  getStrategies(): DepositStrategy[] {
    return Object.values(this.strategiesById);
  }

  findStrategy(filter?: StrategiesFilter): DepositStrategy {
    const listResult = this.findAllStrategies(filter);
    if (listResult.length === 0) {
      throw new Error(`Deposit strategy for given filter ${filter} not found.`);
    }
    return listResult[0];
  }

  findAllStrategies(filter?: StrategiesFilter): DepositStrategy[] {
    return this.getStrategies().filter(strategy => StrategiesManager.checkFilter(strategy, filter));
  }

  async getStrategiesDetails(): Promise<DepositStrategyDetailedInfo[]> {
    return this.savingsBackendClient.getDepositStrategyDetailedInfo({
      chainId: this.chainId,
    });
  }

  static checkFilter(strategy: DepositStrategy | AccountDepositStrategy, filter?: StrategiesFilter): boolean {
    return (
      !filter ||
      ((filter.tokenAddress === undefined || isAddressEqual(strategy.tokenAddress, filter.tokenAddress)) &&
        (filter.bondTokenAddress === undefined || isAddressEqual(strategy.bondTokenAddress, filter.bondTokenAddress)) &&
        (filter.isNative === undefined || strategy.isNative === filter.isNative) &&
        (filter.isEOA === undefined || strategy.isEOA === filter.isEOA))
    );
  }
}
