/* eslint-disable camelcase,import/no-unused-modules,@typescript-eslint/naming-convention */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

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

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
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
