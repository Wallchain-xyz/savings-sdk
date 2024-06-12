// eslint-disable-next-line max-classes-per-file
import { HTTPValidationError, UnauthenticatedApiError } from '../auth/__generated__/createApiClient';

export class ApiError<OriginalError = unknown> extends Error {
  readonly name = ApiError.name;

  originalError?: OriginalError;

  constructor(originalError?: OriginalError) {
    super();
    this.originalError = originalError;
  }
}

export class UnknownAPIError extends ApiError<unknown> {
  readonly name = UnknownAPIError.name;
}

export class ServerAPIError extends ApiError<unknown> {
  readonly name = ServerAPIError.name;
}

export class ValidationError extends ApiError<HTTPValidationError> {
  readonly name = ValidationError.name;
}

export class UnauthenticatedError extends ApiError<UnauthenticatedApiError> {
  readonly name = UnauthenticatedError.name;
}

export type SharedError = UnauthenticatedError | ValidationError;
