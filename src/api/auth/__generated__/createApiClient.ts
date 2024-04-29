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

const ChainId = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(42161)]);

export const ChainIdSchema = ChainId;
export type ChainId = TypeOf<typeof ChainIdSchema>;

const chain_id = ChainId;

export const chain_idSchema = chain_id;
export type chain_id = TypeOf<typeof chain_idSchema>;

const AAOwnership = z
  .object({
    signer_address: z.address(),
    aa_address: z.address(),
    chain_id: ChainId,
  })
  .passthrough();

export const AAOwnershipSchema = AAOwnership;
export type AAOwnership = TypeOf<typeof AAOwnershipSchema>;

const User = z
  .object({
    id: z.string(),
    created_at: z.string().datetime({ offset: true }).optional(),
    ownerships: z.array(AAOwnership),
    paused_until: z.union([z.string(), z.null()]),
    signer_address: z.address(),
    aa_address: z.address(),
    chain_id: ChainId,
  })
  .passthrough();

export const UserSchema = User;
export type User = TypeOf<typeof UserSchema>;

const LoginResponse = z.object({ token: z.string(), user: User }).passthrough();

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

const user_id = z.union([z.string(), z.unknown()]);

export const user_idSchema = user_id;
export type user_id = TypeOf<typeof user_idSchema>;

const PauseRequest = z.object({ pause_until: z.union([z.string(), z.null()]) }).passthrough();

export const PauseRequestSchema = PauseRequest;
export type PauseRequest = TypeOf<typeof PauseRequestSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'post',
        path: '/yield/auth/:chain_id/login',
        alias: 'login',
        description: `Retrieve auth token for existing user.`,
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
            status: 401,
            description: `Invalid signature or other auth data`,
            schema: z.void(),
          },
          {
            status: 404,
            description: `User doesn&#x27;t exits found`,
            schema: z.void(),
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
        path: '/yield/auth/:chain_id/register',
        alias: 'register',
        description: `Create new user`,
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
            status: 401,
            description: `Invalid signature or other auth data`,
            schema: z.void(),
          },
          {
            status: 409,
            description: `User for provided AA already exists`,
            schema: z.void(),
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
        path: '/yield/auth/:chain_id/users',
        alias: 'listUsers',
        description: `Get information about user`,
        requestFormat: 'json',
        response: z.array(User),
        errors: [
          {
            status: 403,
            description: `Operation forbidden`,
            schema: z.void(),
          },
        ],
      },
      {
        method: 'get',
        path: '/yield/auth/:chain_id/users/:user_id',
        alias: 'getUser',
        description: `Get information about user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
          },
        ],
        response: User,
        errors: [
          {
            status: 401,
            description: `User token invalid`,
            schema: z.void(),
          },
          {
            status: 403,
            description: `Reading of given user is forbidden`,
            schema: z.void(),
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
        path: '/yield/auth/:chain_id/users/:user_id/add_ownership',
        alias: 'addOwnership',
        description: `Add additional Account Abstraction wallet to user`,
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
        response: z.unknown(),
        errors: [
          {
            status: 401,
            description: `User token invalid or invalid signature or other auth data`,
            schema: z.void(),
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
        path: '/yield/auth/:chain_id/users/:user_id/pause',
        alias: 'pauseDepositing',
        description: `Pause auto-depositing for given user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: PauseRequest,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 401,
            description: `User token invalid or invalid signature or other auth data`,
            schema: z.void(),
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
