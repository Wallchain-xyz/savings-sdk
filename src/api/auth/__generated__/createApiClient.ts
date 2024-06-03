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

const UnauthenticatedApiError = z
  .object({
    code: z.literal('SHARED__UNAUTHENTICATED').optional().default('SHARED__UNAUTHENTICATED'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const UnauthenticatedApiErrorSchema = UnauthenticatedApiError;
export type UnauthenticatedApiError = TypeOf<typeof UnauthenticatedApiErrorSchema>;

const NotAdminForbiddenApiError = z
  .object({
    code: z.literal('SHARED__NOT_ADMIN_FORBIDDEN').optional().default('SHARED__NOT_ADMIN_FORBIDDEN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const NotAdminForbiddenApiErrorSchema = NotAdminForbiddenApiError;
export type NotAdminForbiddenApiError = TypeOf<typeof NotAdminForbiddenApiErrorSchema>;

const NotAAOwnerForbiddenApiError = z
  .object({
    code: z.literal('SHARED__NOT_AA_OWNER_FORBIDDEN').optional().default('SHARED__NOT_AA_OWNER_FORBIDDEN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const NotAAOwnerForbiddenApiErrorSchema = NotAAOwnerForbiddenApiError;
export type NotAAOwnerForbiddenApiError = TypeOf<typeof NotAAOwnerForbiddenApiErrorSchema>;

const SignatureExpiredForbiddenApiError = z
  .object({
    code: z.literal('SHARED__SIGNATURE_EXPIRED_FORBIDDEN').optional().default('SHARED__SIGNATURE_EXPIRED_FORBIDDEN'),
    detail: z.union([z.string(), z.null()]),
  })
  .passthrough();

export const SignatureExpiredForbiddenApiErrorSchema = SignatureExpiredForbiddenApiError;
export type SignatureExpiredForbiddenApiError = TypeOf<typeof SignatureExpiredForbiddenApiErrorSchema>;

const UserNotFoundApiError = z
  .object({
    code: z.literal('AUTH__USER_NOT_FOUND').default('AUTH__USER_NOT_FOUND'),
    detail: z.string().default('User does not exist.'),
  })
  .partial()
  .passthrough();

export const UserNotFoundApiErrorSchema = UserNotFoundApiError;
export type UserNotFoundApiError = TypeOf<typeof UserNotFoundApiErrorSchema>;

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

const UserAlreadyExistsApiError = z
  .object({
    code: z.literal('AUTH__USER_ALREADY_EXISTS').default('AUTH__USER_ALREADY_EXISTS'),
    detail: z.string().default('User does not exist.'),
  })
  .partial()
  .passthrough();

export const UserAlreadyExistsApiErrorSchema = UserAlreadyExistsApiError;
export type UserAlreadyExistsApiError = TypeOf<typeof UserAlreadyExistsApiErrorSchema>;

const user_id = z.union([z.string(), z.literal('me')]);

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
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: z.union([
              NotAdminForbiddenApiError,
              NotAAOwnerForbiddenApiError,
              SignatureExpiredForbiddenApiError,
            ]),
          },
          {
            status: 404,
            description: `Not Found`,
            schema: UserNotFoundApiError,
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
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: z.union([
              NotAdminForbiddenApiError,
              NotAAOwnerForbiddenApiError,
              SignatureExpiredForbiddenApiError,
            ]),
          },
          {
            status: 409,
            description: `Conflict`,
            schema: UserAlreadyExistsApiError,
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
        description: `Get list of users`,
        requestFormat: 'json',
        response: z.array(User),
        errors: [
          {
            status: 403,
            description: `Forbidden`,
            schema: z.union([
              NotAdminForbiddenApiError,
              NotAAOwnerForbiddenApiError,
              SignatureExpiredForbiddenApiError,
            ]),
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
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: z.union([
              NotAdminForbiddenApiError,
              NotAAOwnerForbiddenApiError,
              SignatureExpiredForbiddenApiError,
            ]),
          },
          {
            status: 404,
            description: `Not Found`,
            schema: UserNotFoundApiError,
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
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: z.union([
              NotAdminForbiddenApiError,
              NotAAOwnerForbiddenApiError,
              SignatureExpiredForbiddenApiError,
            ]),
          },
          {
            status: 404,
            description: `Not Found`,
            schema: UserNotFoundApiError,
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
            description: `Unauthorized`,
            schema: UnauthenticatedApiError,
          },
          {
            status: 403,
            description: `Forbidden`,
            schema: z.union([
              NotAdminForbiddenApiError,
              NotAAOwnerForbiddenApiError,
              SignatureExpiredForbiddenApiError,
            ]),
          },
          {
            status: 404,
            description: `Not Found`,
            schema: UserNotFoundApiError,
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
