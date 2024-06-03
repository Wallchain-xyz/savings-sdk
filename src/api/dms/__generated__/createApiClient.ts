/* eslint-disable camelcase,import/no-unused-modules,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

const chain_id = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(42161)]);

export const chain_idSchema = chain_id;
export type chain_id = TypeOf<typeof chain_idSchema>;

const UnsupportedChainApiError = z
  .object({
    code: z.literal('SHARED__UNSUPPORTED_CHAIN').optional().default('SHARED__UNSUPPORTED_CHAIN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const UnsupportedChainApiErrorSchema = UnsupportedChainApiError;
export type UnsupportedChainApiError = TypeOf<typeof UnsupportedChainApiErrorSchema>;

const UnauthenticatedApiError = z
  .object({
    code: z.literal('SHARED__UNAUTHENTICATED').optional().default('SHARED__UNAUTHENTICATED'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const UnauthenticatedApiErrorSchema = UnauthenticatedApiError;
export type UnauthenticatedApiError = TypeOf<typeof UnauthenticatedApiErrorSchema>;

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

const APIStrategyDetailedInfo = z
  .object({
    id: z.string(),
    name: z.string(),
    tokenInfo: APITokenInfo,
    protocolInfo: APIProtocolInfo,
    apy: APIApyInfo,
    tvl: z.number(),
    safetyRating: SafetyRating,
  })
  .passthrough();

export const APIStrategyDetailedInfoSchema = APIStrategyDetailedInfo;
export type APIStrategyDetailedInfo = TypeOf<typeof APIStrategyDetailedInfoSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'get',
        path: '/yield/deposits/:chain_id/deposit_strategy_infos',
        alias: 'getStrategiesDetails',
        requestFormat: 'json',
        response: z.array(APIStrategyDetailedInfo),
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
            schema: UnsupportedChainApiError,
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
