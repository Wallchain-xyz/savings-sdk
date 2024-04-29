/* eslint-disable camelcase,import/no-unused-modules,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

const SKA = z
  .object({
    userId: z.string(),
    aaAddress: z.address(),
    sessionKeyAccountAddress: z.address(),
    depositStrategyIds: z.array(z.string()),
  })
  .passthrough();

export const SKASchema = SKA;
export type SKA = TypeOf<typeof SKASchema>;

const CreateSKAData = z
  .object({
    aaAddress: z.address(),
    serializedSka: z.string(),
    depositStrategyIds: z.array(z.string()),
  })
  .passthrough();

export const CreateSKADataSchema = CreateSKAData;
export type CreateSKAData = TypeOf<typeof CreateSKADataSchema>;

const chain_id = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(42161)]);

export const chain_idSchema = chain_id;
export type chain_id = TypeOf<typeof chain_idSchema>;

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

const MinimumExecutableTxn = z
  .object({
    to: z.address(),
    value: z.positiveHexString(),
    data: z.positiveHexString(),
  })
  .passthrough();

export const MinimumExecutableTxnSchema = MinimumExecutableTxn;
export type MinimumExecutableTxn = TypeOf<typeof MinimumExecutableTxnSchema>;

const execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post_Body =
  z.array(MinimumExecutableTxn);

export const execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post_BodySchema =
  execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post_Body;
export type execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post_Body = TypeOf<
  typeof execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post_BodySchema
>;

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
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/yield/ska/:chain_id/skas/:aa_address/user_operation',
        alias: 'execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post',
        description: `Execute transactions`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: execute_user_operation_using_ska_yield_ska__chain_id__skas__aa_address__user_operation_post_Body,
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
