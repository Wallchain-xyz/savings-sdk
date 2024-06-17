import { Address, isAddressEqual } from 'viem';

import { SupportedChainId } from '../AAProviders/shared/chains';
import { Permission } from '../AAProviders/shared/Permission';
import { Txn } from '../AAProviders/shared/Txn';

import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { mapStringValuesDeep } from '../utils/mapValuesDeep';

import { interpolatePermissions } from './InterpolatePermissions';

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

export type DepositStrategyId = string;

export enum DepositStrategyProtocolType {
  beefy = 'beefy',
  moonwell = 'moonwell',
}

export enum DepositStrategyAccountType {
  aa = 'aa',
  eoa = 'eoa',
}

export interface DepositStrategyConfig {
  id: DepositStrategyId;
  name: string;
  protocolType: DepositStrategyProtocolType;
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

interface TokenInfo {
  name: string;
  address: Address;
  imageUrl: string;
}

interface ProtocolInfo {
  name: string;
  imageUrl: string;
}

interface DepositStrategy_Base {
  config: DepositStrategyConfig;
  id: string;
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

export type DepositStrategyWithActions<actions extends DepositStrategyActions | unknown = unknown> =
  DepositStrategy_Base &
    Omit<actions, keyof DepositStrategy_Base> & {
      extend: <newActions extends DepositStrategyActions>(
        extender: (strategy: DepositStrategyWithActions<actions>) => newActions,
      ) => DepositStrategyWithActions<actions & newActions>;
    };

export type BondTokenActions = {
  bondTokenAmountToTokenAmount: (amount: bigint) => Promise<bigint>;
  tokenAmountToBondTokenAmount: (amount: bigint) => Promise<bigint>;
};

export type DepositWithdrawActions = {
  createDepositTxns: ({ amount }: CreateDepositTxnsParams) => Txn[];
  createWithdrawTxns: ({ amount }: CreateWithdrawTxnsParams) => Promise<Txn[]>;
};

export type DepositStrategy = DepositStrategyWithActions<BondTokenActions & DepositWithdrawActions>;

export function createDepositStrategy(config: DepositStrategyConfig): DepositStrategyWithActions {
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

  return Object.assign(strategy, { extend: extend(strategy) }) as DepositStrategyWithActions;
}
