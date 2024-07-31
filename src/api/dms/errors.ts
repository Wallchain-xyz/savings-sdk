// eslint-disable-next-line max-classes-per-file
import { ApiError, SharedError, UnauthenticatedError, ValidationError } from '../shared/errors';

import {
  DepositTxnFailedApiError,
  DepositTxnFailedApiErrorSchema,
  HTTPValidationErrorSchema,
  UnauthenticatedApiErrorSchema,
  UnsupportedChainApiError,
  UnsupportedChainApiErrorSchema,
} from './__generated__/createApiClient';

export class UnsupportedChainError extends ApiError<UnsupportedChainApiError> {
  readonly name = UnsupportedChainError.name;
}

export class DepositTxnFailedError extends ApiError<DepositTxnFailedApiError> {
  readonly name = DepositTxnFailedError.name;
}

type DmsOnlyError = UnsupportedChainError | DepositTxnFailedApiError;

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
  {
    schema: DepositTxnFailedApiErrorSchema,
    ErrorClass: DepositTxnFailedError,
  },
];
