// eslint-disable-next-line max-classes-per-file
import { ApiError, SharedError, UnauthenticatedError, ValidationError } from '../shared/errors';

import {
  HTTPValidationErrorSchema,
  UnauthenticatedApiErrorSchema,
  UnsupportedChainApiError,
  UnsupportedChainApiErrorSchema,
} from './__generated__/createApiClient';

class UnsupportedChainError extends ApiError<UnsupportedChainApiError> {}

type DmsOnlyError = UnsupportedChainError;

// eslint-disable-next-line import/no-unused-modules
export type DmsError = SharedError | DmsOnlyError;

export const errorSchemaAndClasses = [
  {
    schema: HTTPValidationErrorSchema,
    ErrorClass: ValidationError,
  },
  {
    schema: UnauthenticatedApiErrorSchema,
    ErrorClass: UnauthenticatedError,
  },
  {
    schema: UnsupportedChainApiErrorSchema,
    ErrorClass: UnsupportedChainError,
  },
];
