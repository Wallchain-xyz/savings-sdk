/* eslint-disable camelcase,import/no-unused-modules,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

const APISKA = z
  .object({
    userAddress: z.address(),
    sessionKeyAccountAddress: z.address(),
    depositStrategyIds: z.array(z.string()),
  })
  .passthrough();

export const APISKASchema = APISKA;
export type APISKA = TypeOf<typeof APISKASchema>;

const user_address = z.string();

export const user_addressSchema = user_address;
export type user_address = TypeOf<typeof user_addressSchema>;

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

const CreateSKAData = z.object({ serializedSka: z.string(), depositStrategyIds: z.array(z.string()) }).passthrough();

export const CreateSKADataSchema = CreateSKAData;
export type CreateSKAData = TypeOf<typeof CreateSKADataSchema>;

const MinimumExecutableTxn = z
  .object({
    to: z.address(),
    value: z.positiveHexString(),
    data: z.positiveHexString(),
  })
  .passthrough();

export const MinimumExecutableTxnSchema = MinimumExecutableTxn;
export type MinimumExecutableTxn = TypeOf<typeof MinimumExecutableTxnSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'get',
        path: '/yield/ska/:chain_id/:user_address',
        alias: 'getSKA',
        description: `Creates session key account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_address',
            type: 'Path',
            schema: user_address,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: APISKA,
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
        path: '/yield/ska/:chain_id/:user_address',
        alias: 'createSKA',
        description: `Updates session key for account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: CreateSKAData,
          },
          {
            name: 'user_address',
            type: 'Path',
            schema: user_address,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: APISKA,
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
        path: '/yield/ska/:chain_id/:user_address',
        alias: 'deleteSKA',
        description: `Delete session key account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_address',
            type: 'Path',
            schema: user_address,
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
        path: '/yield/ska/:chain_id/:user_address/user_operation',
        alias: 'execute_user_operation_using_ska_yield_ska__chain_id___user_address__user_operation_post',
        description: `Executes transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: MinimumExecutableTxn,
          },
          {
            name: 'user_address',
            type: 'Path',
            schema: user_address,
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
      {
        method: 'get',
        path: '/yield/ska/:chain_id/list',
        alias: 'list_session_key_accounts_yield_ska__chain_id__list_get',
        description: `Returns all session key accounts`,
        requestFormat: 'json',
        response: z.array(APISKA),
      },
      {
        method: 'get',
        path: '/yield/ska/:chain_id/ska_address',
        alias: 'getSKAAddress',
        description: `Returns session key account address`,
        requestFormat: 'json',
        response: z.address(),
      },
    ],
    options,
  );
}
