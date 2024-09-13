import { Address, Hex, isAddressEqual } from 'viem';

import { SupportedChainId } from '../AAProviders/shared/chains';
import { Permission } from '../AAProviders/shared/Permission';
import { Txn } from '../AAProviders/shared/Txn';

import { NATIVE_TOKEN_ADDRESS } from '../consts';

import { mapStringValuesDeep } from '../utils/mapValuesDeep';

import { interpolatePermissions } from './InterpolatePermissions';
import {
  AaveV3StrategyId,
  BeefyStrategyId,
  FuelStrategyId,
  MellowStrategyId,
  MezoStrategyId,
  MoonwellStrategyId,
  NoOpStrategyId,
  PendleStrategyId,
  SolvStrategyId,
  StrategyId,
  VedaStrategyId,
} from './strategies';

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
  mellow = 'mellow',
  pendle = 'pendle',
  fuel = 'fuel',
  mezo = 'mezo',
  solv = 'solv',
  noop = 'noop',
}

export enum DepositStrategyAccountType {
  aa = 'aa',
  eoa = 'eoa',
}

interface DepositStrategyConfig_Base<
  TIsSingleStepWithdraw extends boolean = boolean,
  HasBondToken extends boolean = true,
> {
  name: string;

  accountType: DepositStrategyAccountType;
  permissions: Permission[];
  chainId: SupportedChainId;
  tokenAddress: Address;
  tokenName: string;
  tokenImageURL: string;
  protocolName: string;
  protocolImageURL: string;
  bondTokenAddress: HasBondToken extends true ? Address : null;
  isSingleStepWithdraw: TIsSingleStepWithdraw;
}

export interface BeefyDepositStrategyConfig extends DepositStrategyConfig_Base<true> {
  id: BeefyStrategyId;
  protocolType: DepositStrategyProtocolType.beefy;
}

export interface MoonwellDepositStrategyConfig extends DepositStrategyConfig_Base<true> {
  id: MoonwellStrategyId;
  protocolType: DepositStrategyProtocolType.moonwell;
}

export interface AaveV3DepositStrategyConfig extends DepositStrategyConfig_Base<true> {
  id: AaveV3StrategyId;
  protocolType: DepositStrategyProtocolType.aaveV3;
  poolAddress: Address;
}

export interface VedaDepositStrategyConfig extends DepositStrategyConfig_Base<false> {
  id: VedaStrategyId;
  protocolType: DepositStrategyProtocolType.veda;
  tellerAddress: Address;
  accountantAddress: Address;
  atomicQueueAddress: Address;
}

export interface MellowDepositStrategyConfig extends DepositStrategyConfig_Base<false> {
  id: MellowStrategyId;
  protocolType: DepositStrategyProtocolType.mellow;
  depositWrapperAddress: Address;
  collectorAddress: Address;
}
export interface PendleDepositStrategyConfig extends DepositStrategyConfig_Base<false> {
  id: PendleStrategyId;
  protocolType: DepositStrategyProtocolType.pendle;
  marketAddr: Address;
  routerStaticAddr: Address;
}

export interface FuelDepositStrategyConfig extends DepositStrategyConfig_Base<true, false> {
  id: FuelStrategyId;
  protocolType: DepositStrategyProtocolType.fuel;
  vaultAddress: Address;
}

export interface MezoDepositStrategyConfig extends DepositStrategyConfig_Base<true, false> {
  id: MezoStrategyId;
  protocolType: DepositStrategyProtocolType.mezo;
  vaultAddress: Address;
}

export interface SolvDepositStrategyConfig extends DepositStrategyConfig_Base<false> {
  id: SolvStrategyId;
  protocolType: DepositStrategyProtocolType.solv;
  routerAddress: Address;
  poolId: Hex;
  tokenDecimals: number;
  bondTokenDecimals: number;
}

export interface NoOpDepositStrategyConfig extends DepositStrategyConfig_Base<true> {
  id: NoOpStrategyId;
  protocolType: DepositStrategyProtocolType.noop;
}

export type DepositStrategyConfig =
  | BeefyDepositStrategyConfig
  | MoonwellDepositStrategyConfig
  | AaveV3DepositStrategyConfig
  | VedaDepositStrategyConfig
  | MellowDepositStrategyConfig
  | PendleDepositStrategyConfig
  | FuelDepositStrategyConfig
  | MezoDepositStrategyConfig
  | SolvDepositStrategyConfig
  | NoOpDepositStrategyConfig;

// TODO:@merlin make more robust solution
// this won't fail if not all ids are accounted
type IdBasedStrategyConfig<TStrategyId extends StrategyId> = TStrategyId extends BeefyStrategyId
  ? BeefyDepositStrategyConfig
  : TStrategyId extends MoonwellStrategyId
  ? MoonwellDepositStrategyConfig
  : TStrategyId extends AaveV3StrategyId
  ? AaveV3DepositStrategyConfig
  : TStrategyId extends VedaStrategyId
  ? VedaDepositStrategyConfig
  : TStrategyId extends PendleStrategyId
  ? PendleDepositStrategyConfig
  : TStrategyId extends FuelStrategyId
  ? FuelDepositStrategyConfig
  : TStrategyId extends MezoStrategyId
  ? MezoDepositStrategyConfig
  : TStrategyId extends SolvStrategyId
  ? SolvDepositStrategyConfig
  : TStrategyId extends NoOpStrategyId
  ? NoOpDepositStrategyConfig
  : never;

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
  createDepositTxns: (params: CreateDepositTxnsParams) => Promise<Txn[]>;
};

export type SingleStepWithdrawActions<config extends DepositStrategyConfig> =
  config['isSingleStepWithdraw'] extends true
    ? {
        createWithdrawTxns: (params: CreateWithdrawTxnsParams) => Promise<Txn[]>;
      }
    : never;

export interface PendingWithdrawal {
  amount: bigint;
  currentStep: number;
  isStepCanBeExecuted: boolean;
}

export type MultiStepWithdrawActions<config extends DepositStrategyConfig> =
  config['isSingleStepWithdraw'] extends false
    ? {
        createWithdrawStepTxns: (step: number, params: CreateWithdrawTxnsParams) => Promise<Txn[]>;
        withdrawStepsCount: number;
        getPendingWithdrawal: (aaAddress: Address) => Promise<PendingWithdrawal>;
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

export type IdBasedDepositStrategy<TStrategyId extends StrategyId> = DepositStrategy<
  IdBasedStrategyConfig<TStrategyId>
>;

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
