import { Address, isAddressEqual } from 'viem';

import { SupportedChainId } from '../AAProviders/shared/chains';
import { Permission } from '../AAProviders/shared/Permission';
import { Txn } from '../AAProviders/shared/Txn';

import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { mapStringValuesDeep } from '../utils/mapValuesDeep';

import { interpolatePermissions } from './InterpolatePermissions';
import { AaveV3StrategyId, BeefyStrategyId, MoonwellStrategyId, StrategyId, VedaStrategyId } from './strategies';

export interface ParamsValuesByKey {
  [key: string]: string | null;
}

export interface CreateDepositTxnsParams {
  amount: bigint;
  paramValuesByKey: ParamsValuesByKey;
}

export interface CreateWithdrawTxnsParams {
  amount: bigint;
  paramValuesByKey: ParamsValuesByKey;
}

export type DepositStrategyId = StrategyId;

export enum DepositStrategyProtocolType {
  beefy = 'beefy',
  moonwell = 'moonwell',
  aaveV3 = 'aaveV3',
  veda = 'veda',
}

export enum DepositStrategyAccountType {
  aa = 'aa',
  eoa = 'eoa',
}

interface DepositStrategyConfig_Base {
  name: string;

  accountType: DepositStrategyAccountType;
  permissions: Permission[];
  chainId: SupportedChainId;
  tokenAddress: Address;
  tokenName: string;
  tokenImageURL: string;
  protocolName: string;
  protocolImageURL: string;
  bondTokenAddress: Address;
}

export interface BeefyDepositStrategyConfig extends DepositStrategyConfig_Base {
  id: BeefyStrategyId;
  protocolType: DepositStrategyProtocolType.beefy;
  isSingleStepWithdraw: true;
}

export interface MoonwellDepositStrategyConfig extends DepositStrategyConfig_Base {
  id: MoonwellStrategyId;
  protocolType: DepositStrategyProtocolType.moonwell;
  isSingleStepWithdraw: true;
}

export interface AaveV3DepositStrategyConfig extends DepositStrategyConfig_Base {
  id: AaveV3StrategyId;
  protocolType: DepositStrategyProtocolType.aaveV3;
  poolAddress: Address;
  isSingleStepWithdraw: true;
}

export interface VedaDepositStrategyConfig extends DepositStrategyConfig_Base {
  id: VedaStrategyId;
  protocolType: DepositStrategyProtocolType.veda;
  tellerAddress: Address;
  accountantAddress: Address;
  atomicQueueAddress: Address;
  isSingleStepWithdraw: false;
}

export type DepositStrategyConfig =
  | BeefyDepositStrategyConfig
  | MoonwellDepositStrategyConfig
  | AaveV3DepositStrategyConfig
  | VedaDepositStrategyConfig;

interface TokenInfo {
  name: string;
  address: Address;
  imageUrl: string;
}

interface ProtocolInfo {
  name: string;
  imageUrl: string;
}

interface DepositStrategy_Base<config extends DepositStrategyConfig = DepositStrategyConfig> {
  id: config['id'];
  config: config;
  isSingleStepWithdraw: config['isSingleStepWithdraw'];
  name: string;
  chainId: SupportedChainId;
  tokenAddress: Address;
  bondTokenAddress: Address;
  tokenInfo: TokenInfo;
  protocolInfo: ProtocolInfo;
  isNative: boolean;
  isEOA: boolean;
  params: string[];
  getPermissions: (paramValuesByKey?: ParamsValuesByKey) => Permission[];
}

// disallow redefining base properties
type DepositStrategyActions = { [_ in keyof DepositStrategy_Base]?: undefined } & {
  [key: string]: unknown;
};

export type DepositStrategyWithActions<
  config extends DepositStrategyConfig = DepositStrategyConfig,
  actions extends DepositStrategyActions | unknown = unknown,
> = DepositStrategy_Base<config> &
  actions & {
    extend: <newActions extends DepositStrategyActions>(
      extender: (strategy: DepositStrategyWithActions<config, actions>) => newActions,
    ) => DepositStrategyWithActions<config, actions & newActions>;
  };

export type BondTokenActions = {
  bondTokenAmountToTokenAmount: (amount: bigint) => Promise<bigint>;
  tokenAmountToBondTokenAmount: (amount: bigint) => Promise<bigint>;
  getBondTokenBalance: (address: Address) => Promise<bigint>;
};

export type DepositActions = {
  createDepositTxns: (params: CreateDepositTxnsParams) => Txn[];
};

export type SingleStepWithdrawActions<config extends DepositStrategyConfig> =
  config['isSingleStepWithdraw'] extends true
    ? {
        createWithdrawTxns: (params: CreateWithdrawTxnsParams) => Promise<Txn[]>;
      }
    : never;

export interface PendingWithdrawal {
  amount: bigint;
  canBeCompleted: boolean;
}

export type MultiStepWithdrawActions<config extends DepositStrategyConfig> =
  config['isSingleStepWithdraw'] extends false
    ? {
        createInitiateWithdrawTxns: (params: CreateWithdrawTxnsParams) => Promise<Txn[]>;
        getPendingWithdrawal: (aaAddress: Address) => Promise<PendingWithdrawal>;
        createCompleteWithdrawTxns: (params: CreateWithdrawTxnsParams) => Promise<Txn[]>;
      }
    : never;

export type DepositSingleStepWithdrawActions<config extends DepositStrategyConfig> = SingleStepWithdrawActions<config> &
  DepositActions;

export type DepositMultiStepWithdrawActions<config extends DepositStrategyConfig> = MultiStepWithdrawActions<config> &
  DepositActions;

export type DepositStrategy<config extends DepositStrategyConfig = DepositStrategyConfig> =
  | (config extends { isSingleStepWithdraw: true }
      ? DepositStrategyWithActions<config, BondTokenActions & DepositSingleStepWithdrawActions<config>>
      : never)
  | (config extends { isSingleStepWithdraw: false }
      ? DepositStrategyWithActions<config, BondTokenActions & DepositMultiStepWithdrawActions<config>>
      : never);

export function createDepositStrategy<config extends DepositStrategyConfig = DepositStrategyConfig>(
  config: config,
): DepositStrategyWithActions<config> {
  const params: string[] = [];
  mapStringValuesDeep(config.permissions, value => {
    if (value.startsWith('{{') && value.endsWith('}}')) {
      params.push(value.slice(2, -2));
    }
    return value;
  });

  const strategy = {
    config,
    id: config.id,
    isSingleStepWithdraw: config.isSingleStepWithdraw,
    name: config.name,
    chainId: config.chainId,
    tokenAddress: config.tokenAddress,
    bondTokenAddress: config.bondTokenAddress,
    tokenInfo: {
      name: config.tokenName,
      address: config.tokenAddress,
      imageUrl: config.tokenImageURL,
    },
    protocolInfo: {
      name: config.protocolName,
      imageUrl: config.protocolImageURL,
    },
    isNative: isAddressEqual(config.tokenAddress, NATIVE_TOKEN_ADDRESS),
    isEOA: config.accountType === DepositStrategyAccountType.eoa,
    params,
    getPermissions: (paramValuesByKey?: ParamsValuesByKey) => {
      return interpolatePermissions(config.permissions, paramValuesByKey);
    },
  };

  function extend(base: typeof strategy) {
    type ExtendFn = (base: typeof strategy) => unknown;
    return (extendFn: ExtendFn) => {
      const extended = extendFn(base) as DepositStrategyActions;
      const combined = { ...base, ...extended };
      return Object.assign(combined, { extend: extend(combined as typeof strategy) });
    };
  }

  return Object.assign(strategy, { extend: extend(strategy) }) as DepositStrategyWithActions<config>;
}
