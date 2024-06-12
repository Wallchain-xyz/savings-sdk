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
  UnauthenticatedApiErrorSchema,
  UserOpsFailedApiError,
  UserOpsFailedApiErrorSchema,
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
export class UserOpsFailedError extends ApiError<UserOpsFailedApiError> {
  readonly name = UserOpsFailedError.name;
}

type SkaOnlyError = ForbiddenError | SkaNotFoundError | SkaAlreadyExistsError | UserOpsFailedError;

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
    schema: UserOpsFailedApiErrorSchema,
    ErrorClass: UserOpsFailedError,
  },
];
