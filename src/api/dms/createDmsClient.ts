import { ZodiosOptions } from '@zodios/core';

import { AddApiListenersParams, addApiListeners } from '../shared/addApiListeners';

import { ErrorSchemaAndClasses, createHandleApiError } from '../shared/createHandleApiError';

import { createApiClient } from './__generated__/createApiClient';
import { errorSchemaAndClasses } from './errors';

type CreateApiClient = typeof createApiClient;

type ApiClient = ReturnType<CreateApiClient>;

interface CreateDmsClientParams {
  baseUrl: string;
  zodiosOptions?: ZodiosOptions;
  apiListeners?: AddApiListenersParams['apiListeners'];
}

export function createDmsClient({ baseUrl, zodiosOptions, apiListeners }: CreateDmsClientParams): ApiClient {
  const apiClient = createApiClient(baseUrl, zodiosOptions);
  addApiListeners({
    apiListeners,
    axios: apiClient.axios,
    handleApiError: createHandleApiError(errorSchemaAndClasses as ErrorSchemaAndClasses),
  });
  return apiClient;
}
