import { ZodiosOptions } from '@zodios/core';

import { AddApiListenersParams, addApiListeners } from '../shared/addApiListeners';
import { ErrorSchemaAndClasses, createHandleApiError } from '../shared/createHandleApiError';

import { createApiClient } from './__generated__/createApiClient';
import { errorSchemaAndClasses } from './errors';

type CreateApiClient = typeof createApiClient;

type ApiClient = ReturnType<CreateApiClient>;

export interface CreateSKAClientParams {
  baseUrl: string;
  zodiosOptions?: ZodiosOptions;
  apiListeners?: AddApiListenersParams['apiListeners'];
}

export function createSKAClient({ baseUrl, zodiosOptions, apiListeners }: CreateSKAClientParams): ApiClient {
  const apiClient = createApiClient(baseUrl, zodiosOptions);
  apiClient.axios.interceptors.response.use(
    undefined,
    // TODO: @merlin improve typing
    createHandleApiError(errorSchemaAndClasses as ErrorSchemaAndClasses),
  );
  addApiListeners({ apiListeners, axios: apiClient.axios });
  return apiClient;
}
