// eslint-disable-next-line max-classes-per-file
import { ApiError, SharedError, UnauthenticatedError, ValidationError } from '../shared/errors';

import {
  HTTPValidationErrorSchema,
  NotAdminForbiddenApiError,
  NotAdminForbiddenApiErrorSchema,
  SignatureExpiredForbiddenApiError,
  SignatureExpiredForbiddenApiErrorSchema,
  UnauthenticatedApiErrorSchema,
  UserAlreadyExistsApiError,
  UserAlreadyExistsApiErrorSchema,
  UserNotFoundApiError,
  UserNotFoundApiErrorSchema,
} from './__generated__/createApiClient';

export class UserAlreadyExistsError extends ApiError<UserAlreadyExistsApiError> {
  readonly name = UserAlreadyExistsError.name;
}
export class UserNotFoundError extends ApiError<UserNotFoundApiError> {
  readonly name = UserNotFoundError.name;
}
export class SignatureExpiredForbiddenError extends ApiError<SignatureExpiredForbiddenApiError> {
  readonly name = SignatureExpiredForbiddenError.name;
}
export class NotAdminForbiddenError extends ApiError<NotAdminForbiddenApiError> {
  readonly name = NotAdminForbiddenError.name;
}

type AuthOnlyError =
  | UserAlreadyExistsError
  | UserNotFoundError
  | SignatureExpiredForbiddenError
  | NotAdminForbiddenError;

// eslint-disable-next-line import/no-unused-modules
export type AuthError = SharedError | AuthOnlyError;

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
    schema: UserAlreadyExistsApiErrorSchema,
    ErrorClass: UserAlreadyExistsError,
  },
  {
    schema: UserNotFoundApiErrorSchema,
    ErrorClass: UserNotFoundError,
  },
  {
    schema: SignatureExpiredForbiddenApiErrorSchema,
    ErrorClass: SignatureExpiredForbiddenError,
  },
  {
    schema: NotAdminForbiddenApiErrorSchema,
    ErrorClass: NotAdminForbiddenError,
  },
];
