// eslint-disable-next-line max-classes-per-file
import { HTTPValidationError, UnauthenticatedApiError } from '../auth/__generated__/createApiClient';

export class ApiError<OriginalError = unknown> extends Error {
  originalError?: OriginalError;

  constructor(originalError?: OriginalError) {
    super();
    this.originalError = originalError;
  }
}

export class UnknownAPIError extends ApiError<unknown> {}

export class ServerAPIError extends ApiError<unknown> {}

export class ValidationError extends ApiError<HTTPValidationError> {}

export class UnauthenticatedError extends ApiError<UnauthenticatedApiError> {}

export type SharedError = UnauthenticatedError | ValidationError;
