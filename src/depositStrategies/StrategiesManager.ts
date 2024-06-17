import { Address, Chain, PublicClient, Transport, isAddressEqual } from 'viem';

import { base, baseSepolia } from 'viem/chains';

import { SupportedChainId } from '../AAProviders/shared/chains';
import { DepositStrategyDetailedInfo, SavingsBackendClient } from '../api/SavingsBackendClient';

import { assertNever } from '../utils/assertNever';

import {
  DepositStrategy,
  DepositStrategyAccountType,
  DepositStrategyConfig,
  DepositStrategyProtocolType,
  createDepositStrategy,
} from './DepositStrategy';
import { beefyBondTokenActions } from './stategyActions/beefyBondTokenActions';
import { beefyERC20Actions } from './stategyActions/beefyERC20Actions';
import { beefyNativeActions } from './stategyActions/beefyNativeActions';
import { eoaActions } from './stategyActions/eoaActions';
import { moonwellBondTokenActions } from './stategyActions/moonwellBondTokenActions';
import { moonwellERC20Actions } from './stategyActions/moonwellERC20Actions';
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
  private savingsBackendClient: SavingsBackendClient;

  private chainId: SupportedChainId;

  private strategiesById: { [key: string]: DepositStrategy };

  constructor({ publicClient, savingsBackendClient, chainId }: ConstructorParams) {
    this.savingsBackendClient = savingsBackendClient;
    this.chainId = chainId;

    if (chainId in strategiesDataByChainId) {
      const strategyConfigs = strategiesDataByChainId[chainId as keyof typeof strategiesDataByChainId];

      const strategiesArray = strategyConfigs.map(strategyConfig => {
        let strategy = createDepositStrategy(strategyConfig);
        switch (strategyConfig.protocolType) {
          case DepositStrategyProtocolType.beefy: {
            strategy = strategy.extend(beefyBondTokenActions(publicClient));
            if (strategy.isNative) {
              strategy = strategy.extend(beefyNativeActions);
            } else {
              strategy = strategy.extend(beefyERC20Actions);
            }
            break;
          }
          case DepositStrategyProtocolType.moonwell: {
            strategy = strategy.extend(moonwellBondTokenActions(publicClient));
            strategy = strategy.extend(moonwellERC20Actions);
            break;
          }
          default:
            assertNever(strategyConfig.protocolType);
        }
        if (strategyConfig.accountType === DepositStrategyAccountType.eoa) {
          strategy = (strategy as DepositStrategy).extend(eoaActions);
        }
        return strategy as DepositStrategy;
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

  static checkFilter(strategy: DepositStrategy, filter?: StrategiesFilter): boolean {
    return (
      !filter ||
      ((filter.tokenAddress === undefined || isAddressEqual(strategy.tokenAddress, filter.tokenAddress)) &&
        (filter.bondTokenAddress === undefined || isAddressEqual(strategy.bondTokenAddress, filter.bondTokenAddress)) &&
        (filter.isNative === undefined || strategy.isNative === filter.isNative) &&
        (filter.isEOA === undefined || strategy.isEOA === filter.isEOA))
    );
  }
}
