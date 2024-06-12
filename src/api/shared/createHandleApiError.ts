import { AxiosError } from 'axios';

import { ZodSchema } from 'zod';

import { ApiError, ServerAPIError, UnknownAPIError } from './errors';

type ErrorSchemaAndClass = {
  schema: ZodSchema;
  ErrorClass: typeof ApiError;
};

export type ErrorSchemaAndClasses = ErrorSchemaAndClass[];

export const createHandleApiError = (errorSchemaAndClasses: ErrorSchemaAndClasses) => (unknownError: unknown) => {
  if (!(unknownError instanceof AxiosError)) {
    // TODO: @merlin log to sentry, unexpected error

    throw new UnknownAPIError(unknownError);
  }
  const { response } = unknownError;
  if (!response) {
    // TODO: @merlin log to sentry, unexpected error
    throw new UnknownAPIError(unknownError);
  }

  if (response.status >= 500 && response.status <= 504) {
    throw new ServerAPIError();
  }

  errorSchemaAndClasses.forEach(({ schema, ErrorClass }) => {
    const { success, data } = schema.safeParse(response.data);
    if (success) {
      throw new ErrorClass(data.detail ?? data.code ?? JSON.stringify(data));
    }
  });

  // TODO: @merlin log to sentry, unexpected error
  throw new UnknownAPIError(response.data);
};
