/* eslint-disable camelcase,import/no-unused-modules,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

const ActiveStrategyParamValuesByKey = z
  .object({ eoaAddress: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();

export const ActiveStrategyParamValuesByKeySchema = ActiveStrategyParamValuesByKey;
export type ActiveStrategyParamValuesByKey = TypeOf<typeof ActiveStrategyParamValuesByKeySchema>;

const ActiveStrategy = z
  .object({ strategyId: z.string(), paramValuesByKey: z.union([ActiveStrategyParamValuesByKey, z.null()]).optional() })
  .passthrough();

export const ActiveStrategySchema = ActiveStrategy;
export type ActiveStrategy = TypeOf<typeof ActiveStrategySchema>;

const SKA = z
  .object({
    userId: z.string(),
    aaAddress: z.address(),
    sessionKeyAccountAddress: z.address(),
    activeStrategies: z.array(ActiveStrategy),
  })
  .passthrough();

export const SKASchema = SKA;
export type SKA = TypeOf<typeof SKASchema>;

const ForbiddenApiError = z
  .object({
    code: z.literal('SHARED__FORBIDDEN').optional().default('SHARED__FORBIDDEN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const ForbiddenApiErrorSchema = ForbiddenApiError;
export type ForbiddenApiError = TypeOf<typeof ForbiddenApiErrorSchema>;

const CreateSKAData = z
  .object({
    aaAddress: z.address(),
    serializedSka: z.string(),
    activeStrategies: z.array(ActiveStrategy),
  })
  .passthrough();

export const CreateSKADataSchema = CreateSKAData;
export type CreateSKAData = TypeOf<typeof CreateSKADataSchema>;

const chain_id = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(84532), z.literal(42161)]);

export const chain_idSchema = chain_id;
export type chain_id = TypeOf<typeof chain_idSchema>;

const UnauthenticatedApiError = z
  .object({
    code: z.literal('SHARED__UNAUTHENTICATED').optional().default('SHARED__UNAUTHENTICATED'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const UnauthenticatedApiErrorSchema = UnauthenticatedApiError;
export type UnauthenticatedApiError = TypeOf<typeof UnauthenticatedApiErrorSchema>;

const SkaAlreadyExistsApiError = z
  .object({
    code: z.literal('SKA__SKA_ALREADY_EXISTS').optional().default('SKA__SKA_ALREADY_EXISTS'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const SkaAlreadyExistsApiErrorSchema = SkaAlreadyExistsApiError;
export type SkaAlreadyExistsApiError = TypeOf<typeof SkaAlreadyExistsApiErrorSchema>;

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

const aa_address = z.string();

export const aa_addressSchema = aa_address;
export type aa_address = TypeOf<typeof aa_addressSchema>;

const SkaNotFoundApiError = z
  .object({
    code: z.literal('SKA__SKA_NOT_FOUND').optional().default('SKA__SKA_NOT_FOUND'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const SkaNotFoundApiErrorSchema = SkaNotFoundApiError;
export type SkaNotFoundApiError = TypeOf<typeof SkaNotFoundApiErrorSchema>;

const MinimumExecutableTxn = z
  .object({
    to: z.address(),
    value: z.positiveHexString(),
    data: z.positiveHexString(),
  })
  .passthrough();

export const MinimumExecutableTxnSchema = MinimumExecutableTxn;
export type MinimumExecutableTxn = TypeOf<typeof MinimumExecutableTxnSchema>;

const executeUserOperation_Body = z.array(MinimumExecutableTxn);

export const executeUserOperation_BodySchema = executeUserOperation_Body;
export type executeUserOperation_Body = TypeOf<typeof executeUserOperation_BodySchema>;

const TxnFailedApiError = z
  .object({
    code: z.literal('SKA__TXN_FAILED').optional().default('SKA__TXN_FAILED'),
    detail: z.union([z.string(), z.null()]),
    txnHash: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const TxnFailedApiErrorSchema = TxnFailedApiError;
export type TxnFailedApiError = TypeOf<typeof TxnFailedApiErrorSchema>;

const IncorrectNonceTxnFailedApiError = z
  .object({
    code: z.literal('SKA__INCORRECT_NONCE_TXN_FAILED').optional().default('SKA__INCORRECT_NONCE_TXN_FAILED'),
    detail: z.union([z.string(), z.null()]),
    txnHash: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const IncorrectNonceTxnFailedApiErrorSchema = IncorrectNonceTxnFailedApiError;
export type IncorrectNonceTxnFailedApiError = TypeOf<typeof IncorrectNonceTxnFailedApiErrorSchema>;

const UserOperation = z
  .object({
    callData: z.positiveHexString(),
    sender: z.address(),
    nonce: z.positiveHexString(),
    signature: z.positiveHexString(),
    initCode: z.positiveHexString(),
    maxFeePerGas: z.positiveHexString(),
    maxPriorityFeePerGas: z.positiveHexString(),
  })
  .passthrough();

export const UserOperationSchema = UserOperation;
export type UserOperation = TypeOf<typeof UserOperationSchema>;

const SponsorshipInfo = z
  .object({
    callGasLimit: z.positiveHexString(),
    verificationGasLimit: z.positiveHexString(),
    preVerificationGas: z.positiveHexString(),
    paymasterAndData: z.positiveHexString(),
    maxFeePerGas: z.positiveHexString(),
    maxPriorityFeePerGas: z.positiveHexString(),
  })
  .passthrough();

export const SponsorshipInfoSchema = SponsorshipInfo;
export type SponsorshipInfo = TypeOf<typeof SponsorshipInfoSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'get',
        path: '/yield/ska/:chain_id/ska_address',
        alias: 'getSKAAddress',
        description: `Returns session key account address`,
        requestFormat: 'json',
        response: z.address(),
      },
      {
        method: 'get',
        path: '/yield/ska/:chain_id/skas',
        alias: 'listSKA',
        description: `Returns all session key accounts`,
        requestFormat: 'json',
        response: z.array(SKA),
        errors: [
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
        ],
      },
      {
        method: 'post',
        path: '/yield/ska/:chain_id/skas',
        alias: 'createSKA',
        description: `Create session key account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: CreateSKAData,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: SKA,
        errors: [
          {
            status: 401,
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 409,
            description: `Conflict`,
            schema: SkaAlreadyExistsApiError,
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
        path: '/yield/ska/:chain_id/skas/:aa_address',
        alias: 'getSKA',
        description: `Get session key account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'aa_address',
            type: 'Path',
            schema: aa_address,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: SKA,
        errors: [
          {
            status: 401,
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 404,
            description: `Not Found`,
            schema: SkaNotFoundApiError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'delete',
        path: '/yield/ska/:chain_id/skas/:aa_address',
        alias: 'deleteSKA',
        description: `Delete session key account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'aa_address',
            type: 'Path',
            schema: aa_address,
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
            status: 401,
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 404,
            description: `Not Found`,
            schema: SkaNotFoundApiError,
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
        path: '/yield/ska/:chain_id/skas/:aa_address/sponsor_user_operation',
        alias: 'sponsorUserOperation',
        description: `Sponsor transactions`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: UserOperation,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: SponsorshipInfo,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/yield/ska/:chain_id/skas/:aa_address/user_operation',
        alias: 'executeUserOperation',
        description: `Execute transactions`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: executeUserOperation_Body,
          },
          {
            name: 'aa_address',
            type: 'Path',
            schema: aa_address,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: z.string(),
        errors: [
          {
            status: 400,
            description: `Bad Request`,
            schema: TxnFailedApiError,
          },
          {
            status: 401,
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: ForbiddenApiError,
          },
          {
            status: 404,
            description: `Not Found`,
            schema: SkaNotFoundApiError,
          },
          {
            status: 409,
            description: `Conflict`,
            schema: IncorrectNonceTxnFailedApiError,
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
