// eslint-disable-next-line max-classes-per-file
import { ApiError, SharedError, UnauthenticatedError, ValidationError } from '../shared/errors';

import {
  ForbiddenApiError,
  ForbiddenApiErrorSchema,
  HTTPValidationErrorSchema,
  SkaAlreadyExistsApiError,
  SkaAlreadyExistsApiErrorSchema,
  SkaNotFoundApiError,
  SkaNotFoundApiErrorSchema,
  TxnFailedApiError,
  TxnFailedApiErrorSchema,
  UnauthenticatedApiErrorSchema,
} from './__generated__/createApiClient';

export class ForbiddenError extends ApiError<ForbiddenApiError> {
  readonly name = ForbiddenError.name;
}
export class SkaNotFoundError extends ApiError<SkaNotFoundApiError> {
  readonly name = SkaNotFoundError.name;
}
export class SkaAlreadyExistsError extends ApiError<SkaAlreadyExistsApiError> {
  readonly name = SkaAlreadyExistsError.name;
}
export class TxnFailedError extends ApiError<TxnFailedApiError> {
  readonly name = TxnFailedError.name;
}

type SkaOnlyError = ForbiddenError | SkaNotFoundError | SkaAlreadyExistsError | TxnFailedError;

// eslint-disable-next-line import/no-unused-modules
export type SkaError = SharedError | SkaOnlyError;

export const errorSchemaAndClasses = [
  {
    schema: HTTPValidationErrorSchema,
    ErrorClass: ValidationError,
  },
  {
    schema: ForbiddenApiErrorSchema,
    ErrorClass: ForbiddenError,
  },
  {
    schema: SkaAlreadyExistsApiErrorSchema,
    ErrorClass: SkaAlreadyExistsError,
  },
  {
    schema: SkaNotFoundApiErrorSchema,
    ErrorClass: SkaNotFoundError,
  },
  {
    schema: UnauthenticatedApiErrorSchema,
    ErrorClass: UnauthenticatedError,
  },
  {
    schema: TxnFailedApiErrorSchema,
    ErrorClass: TxnFailedError,
  },
];
