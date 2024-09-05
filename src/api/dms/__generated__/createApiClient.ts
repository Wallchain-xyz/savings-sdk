/* eslint-disable camelcase,import/no-unused-modules,no-use-before-define,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { z as realZod } from 'zod';

import { TypeOf, zod as z } from '../../zod';

type APIDistributionPercentage = {
  percent: number;
  distribution: APISimpleDistribution | APISplitDistribution | APISequenceDistribution;
};
type APISimpleDistribution = {
  kind: 'simple';
  strategyId: string;
};
type APISequenceDistribution = {
  kind: 'sequence';
  strategyId: string;
  bondTokenDistribution:
    | (APISimpleDistribution | APISplitDistribution | APISequenceDistribution)
    | Array<APISimpleDistribution | APISplitDistribution | APISequenceDistribution>;
};
type APISplitDistribution = {
  kind: 'split';
  percentages: Array<APIDistributionPercentage>;
};

const chain_id = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(84532), z.literal(42161)]);

export const chain_idSchema = chain_id;
export type chain_id = TypeOf<typeof chain_idSchema>;

const skip_rebalancing = z.boolean().optional().default(false);

export const skip_rebalancingSchema = skip_rebalancing;
export type skip_rebalancing = TypeOf<typeof skip_rebalancingSchema>;

const UnsupportedChainApiError = z
  .object({
    code: z.literal('SHARED__UNSUPPORTED_CHAIN').optional().default('SHARED__UNSUPPORTED_CHAIN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const UnsupportedChainApiErrorSchema = UnsupportedChainApiError;
export type UnsupportedChainApiError = TypeOf<typeof UnsupportedChainApiErrorSchema>;

const ForbiddenApiError = z
  .object({
    code: z.literal('SHARED__FORBIDDEN').optional().default('SHARED__FORBIDDEN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const ForbiddenApiErrorSchema = ForbiddenApiError;
export type ForbiddenApiError = TypeOf<typeof ForbiddenApiErrorSchema>;

const ValidationError = z
  .object({ loc: z.array(z.union([z.string(), z.number()])), msg: z.string(), type: z.string() })
  .passthrough();

export const ValidationErrorSchema = ValidationError;
export type ValidationError = TypeOf<typeof ValidationErrorSchema>;

const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();

export const HTTPValidationErrorSchema = HTTPValidationError;
export type HTTPValidationError = TypeOf<typeof HTTPValidationErrorSchema>;

const DepositTxnFailedApiError = z
  .object({
    code: z.literal('DMS__DEPOSIT_TXNS_FAILED').optional().default('DMS__DEPOSIT_TXNS_FAILED'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const DepositTxnFailedApiErrorSchema = DepositTxnFailedApiError;
export type DepositTxnFailedApiError = TypeOf<typeof DepositTxnFailedApiErrorSchema>;

const UnauthenticatedApiError = z
  .object({
    code: z.literal('SHARED__UNAUTHENTICATED').optional().default('SHARED__UNAUTHENTICATED'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const UnauthenticatedApiErrorSchema = UnauthenticatedApiError;
export type UnauthenticatedApiError = TypeOf<typeof UnauthenticatedApiErrorSchema>;

const APISimpleDistribution = z.object({ kind: z.literal('simple'), strategyId: z.string() }).passthrough();

export const APISimpleDistributionSchema = APISimpleDistribution;

const APISequenceDistribution: realZod.ZodType<APISequenceDistribution> = z.lazy(() =>
  z
    .object({
      kind: z.literal('sequence'),
      strategyId: z.string(),
      bondTokenDistribution: z.union([APISimpleDistribution, APISplitDistribution, APISequenceDistribution]),
    })
    .passthrough(),
);

export const APISequenceDistributionSchema = APISequenceDistribution;

const APIDistributionPercentage: realZod.ZodType<APIDistributionPercentage> = z.lazy(() =>
  z
    .object({
      percent: z.number().int(),
      distribution: z.union([APISimpleDistribution, APISplitDistribution, APISequenceDistribution]),
    })
    .passthrough(),
);

export const APIDistributionPercentageSchema = APIDistributionPercentage;

const APISplitDistribution: realZod.ZodType<APISplitDistribution> = z.lazy(() =>
  z.object({ kind: z.literal('split'), percentages: z.array(APIDistributionPercentage) }).passthrough(),
);

export const APISplitDistributionSchema = APISplitDistribution;

const DepositDistributionRequest = z
  .object({
    distribution: z.union([APISimpleDistribution, APISplitDistribution, APISequenceDistribution]),
  })
  .passthrough();

export const DepositDistributionRequestSchema = DepositDistributionRequest;
export type DepositDistributionRequest = TypeOf<typeof DepositDistributionRequestSchema>;

const APITokenInfo = z.object({ name: z.string(), address: z.address(), iconUrl: z.string() }).passthrough();

export const APITokenInfoSchema = APITokenInfo;
export type APITokenInfo = TypeOf<typeof APITokenInfoSchema>;

const APIProtocolInfo = z.object({ name: z.string(), iconUrl: z.string() }).passthrough();

export const APIProtocolInfoSchema = APIProtocolInfo;
export type APIProtocolInfo = TypeOf<typeof APIProtocolInfoSchema>;

const APIApyInfo = z.object({ current: z.number(), week: z.number(), month: z.number() }).passthrough();

export const APIApyInfoSchema = APIApyInfo;
export type APIApyInfo = TypeOf<typeof APIApyInfoSchema>;

const SafetyRating = z.enum(['safe', 'risky']);

export const SafetyRatingSchema = SafetyRating;
export type SafetyRating = TypeOf<typeof SafetyRatingSchema>;

const APIPointsInfo = z.object({ name: z.string(), iconUrl: z.string(), multiplier: z.number() }).passthrough();

export const APIPointsInfoSchema = APIPointsInfo;
export type APIPointsInfo = TypeOf<typeof APIPointsInfoSchema>;

const APIStrategyDetailedInfo = z
  .object({
    id: z.string(),
    name: z.string(),
    tokenInfo: APITokenInfo,
    protocolInfo: APIProtocolInfo,
    apy: APIApyInfo,
    tvl: z.number(),
    safetyRating: SafetyRating,
    points: z.array(APIPointsInfo),
  })
  .passthrough();

export const APIStrategyDetailedInfoSchema = APIStrategyDetailedInfo;
export type APIStrategyDetailedInfo = TypeOf<typeof APIStrategyDetailedInfoSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'post',
        path: '/yield/deposits/:chain_id/auto_deposit_poller',
        alias: 'auto_deposit_poller_yield_deposits__chain_id__auto_deposit_poller_post',
        description: `Do deposit where needed for all users`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
          {
            name: 'skip_rebalancing',
            type: 'Query',
            schema: skip_rebalancing,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 400,
            description: `Bad Request`,
            schema: UnsupportedChainApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/yield/deposits/:chain_id/continue_withdrawals_poller',
        alias: 'continue_withdrawals_poller_yield_deposits__chain_id__continue_withdrawals_poller_post',
        description: `Continue withdrawals for all users`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 400,
            description: `Bad Request`,
            schema: UnsupportedChainApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/yield/deposits/:chain_id/deposit_distribution',
        alias: 'depositDistribution',
        description: `Check active strategies and do distribution depositing for authorized user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: DepositDistributionRequest,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 400,
            description: `Bad Request`,
            schema: DepositTxnFailedApiError,
          },
          {
            status: 401,
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'get',
        path: '/yield/deposits/:chain_id/deposit_strategy_infos',
        alias: 'getStrategiesDetails',
        requestFormat: 'json',
        response: z.array(APIStrategyDetailedInfo),
      },
      {
        method: 'post',
        path: '/yield/deposits/:chain_id/detailed_info_poller',
        alias: 'detailed_info_poller_yield_deposits__chain_id__detailed_info_poller_post',
        description: `Update detailed infos for all strategies`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 400,
            description: `Bad Request`,
            schema: DepositTxnFailedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/yield/deposits/:chain_id/run_depositing',
        alias: 'runDepositing',
        description: `Check active strategies and do depositing if needed for authorized user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 400,
            description: `Bad Request`,
            schema: DepositTxnFailedApiError,
          },
          {
            status: 401,
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
    ],
    options,
  );
}
