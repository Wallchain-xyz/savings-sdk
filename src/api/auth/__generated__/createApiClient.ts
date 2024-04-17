/* eslint-disable camelcase,import/no-unused-modules,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

const LoginData = z
  .object({
    info: z.string(),
    aa_address: z.address(),
    expires: z.number().int(),
    signature: z.positiveHexString(),
  })
  .passthrough();

export const LoginDataSchema = LoginData;
export type LoginData = TypeOf<typeof LoginDataSchema>;

const chain_id = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(42161)]);

export const chain_idSchema = chain_id;
export type chain_id = TypeOf<typeof chain_idSchema>;

const LoginResponse = z.object({ token: z.string() }).passthrough();

export const LoginResponseSchema = LoginResponse;
export type LoginResponse = TypeOf<typeof LoginResponseSchema>;

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

const ChainId = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(42161)]);

export const ChainIdSchema = ChainId;
export type ChainId = TypeOf<typeof ChainIdSchema>;

const User = z
  .object({
    signer_address: z.address(),
    aa_address: z.address(),
    chain_id: ChainId,
  })
  .passthrough();

export const UserSchema = User;
export type User = TypeOf<typeof UserSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'post',
        path: '/yield/auth/:chain_id/login',
        alias: 'login',
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: LoginData,
          },
          {
            name: 'chain_id',
            type: 'Path',
            schema: chain_id,
          },
        ],
        response: LoginResponse,
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
        path: '/yield/auth/:chain_id/me',
        alias: 'getMe',
        requestFormat: 'json',
        response: User,
      },
    ],
    options,
  );
}
