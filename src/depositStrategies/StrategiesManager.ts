import { Address, Chain, PublicClient, Transport, isAddressEqual } from 'viem';

import { base, baseSepolia, mainnet } from 'viem/chains';

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
import { aaveV3BondTokenActions } from './stategyActions/aaveV3BondTokenActions';
import { aaveV3ERC20DepositWithdrawActions } from './stategyActions/aaveV3ERC20DepositWithdrawActions';
import { beefyBondTokenActions } from './stategyActions/beefyBondTokenActions';
import { beefyERC20DepositWithdrawActions } from './stategyActions/beefyERC20DepositWithdrawActions';
import { beefyNativeDepositWithdrawActions } from './stategyActions/beefyNativeDepositWithdrawActions';
import { eoaActions } from './stategyActions/eoaActions';
import { moonwellBondTokenActions } from './stategyActions/moonwellBondTokenActions';
import { moonwellERC20DepositWithdrawActions } from './stategyActions/moonwellERC20DepositWithdrawActions';
import { vedaBondTokenActions } from './stategyActions/vedaBondTokenActions';
import { vedaERC20Actions } from './stategyActions/vedaERC20Actions';
import { zeroDepositWithdrawActions } from './stategyActions/zeroDepositWithdrawActions';
import {
  InstantWithdrawStrategyId,
  MultistepWithdrawStrategyId,
  StrategyConfigRaw,
  StrategyId,
  baseSepoliaStrategyConfigs,
  baseStrategyConfigs,
  mainnetStrategyConfigs,
} from './strategies';
import { StrategyNotFoundError } from './StrategyNotFoundError';

const fixBigIntMissingInJSON = (strategy: StrategyConfigRaw) =>
  ({
    ...strategy,
    permissions: strategy.permissions.map(permission => ({
      ...permission,
      valueLimit: BigInt(permission.valueLimit),
    })),
  } as unknown as DepositStrategyConfig);

const strategiesDataByChainId = {
  [base.id]: baseStrategyConfigs.map(fixBigIntMissingInJSON),
  [baseSepolia.id]: baseSepoliaStrategyConfigs.map(fixBigIntMissingInJSON),
  [mainnet.id]: mainnetStrategyConfigs.map(fixBigIntMissingInJSON),
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
        let strategy;
        switch (strategyConfig.protocolType) {
          case DepositStrategyProtocolType.beefy: {
            strategy = createDepositStrategy(strategyConfig);
            strategy = strategy.extend(beefyBondTokenActions(publicClient));
            if (strategy.isNative) {
              strategy = strategy.extend(beefyNativeDepositWithdrawActions);
            } else {
              strategy = strategy.extend(beefyERC20DepositWithdrawActions);
            }
            break;
          }
          case DepositStrategyProtocolType.moonwell: {
            strategy = createDepositStrategy(strategyConfig);
            strategy = strategy.extend(moonwellBondTokenActions(publicClient));
            strategy = strategy.extend(moonwellERC20DepositWithdrawActions);
            break;
          }
          case DepositStrategyProtocolType.aaveV3: {
            strategy = createDepositStrategy(strategyConfig);
            strategy = strategy.extend(aaveV3BondTokenActions(publicClient));
            strategy = strategy.extend(aaveV3ERC20DepositWithdrawActions);
            break;
          }
          case DepositStrategyProtocolType.veda: {
            strategy = createDepositStrategy(strategyConfig);
            strategy = strategy.extend(vedaBondTokenActions(publicClient));
            strategy = strategy.extend(
              vedaERC20Actions({
                publicClient,
              }),
            );
            break;
          }
          default:
            assertNever(strategyConfig);
        }
        if (strategyConfig.accountType === DepositStrategyAccountType.eoa) {
          strategy = strategy.extend(eoaActions(publicClient));
        }
        strategy = strategy.extend(zeroDepositWithdrawActions);
        return strategy as DepositStrategy;
      });
      this.strategiesById = Object.fromEntries(strategiesArray.map(strategy => [strategy.id, strategy]));
    } else {
      this.strategiesById = {};
    }
  }

  getStrategy<IdType extends InstantWithdrawStrategyId>(
    strategyId: IdType,
  ): DepositStrategy & { instantWithdraw: true; id: IdType };

  getStrategy<IdType extends MultistepWithdrawStrategyId>(
    strategyId: IdType,
  ): DepositStrategy & { instantWithdraw: false; id: IdType };

  getStrategy<IdType extends StrategyId>(strategyId: IdType): DepositStrategy & { id: IdType };

  getStrategy(strategyId: StrategyId): DepositStrategy {
    if (!(strategyId in this.strategiesById)) {
      throw new StrategyNotFoundError(strategyId);
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
