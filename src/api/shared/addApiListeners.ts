import { AxiosInstance, AxiosResponse } from 'axios';

import { util } from 'zod';

import { ApiError } from './errors';

import assertNever = util.assertNever;

interface OnFailedParams {
  error: ApiError;
  retry: () => Promise<AxiosResponse>;
}

export interface AddApiListenersParams {
  axios: AxiosInstance;
  apiListeners?: {
    onSuccess?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
    onFailed?: (params: OnFailedParams) => AxiosResponse | Promise<AxiosResponse>;
  };
  handleApiError: (unknownError: unknown) => Promise<never>;
}

export function addApiListeners({ axios, apiListeners, handleApiError }: AddApiListenersParams) {
  axios.interceptors.response.use(
    response => apiListeners?.onSuccess?.(response) ?? response,
    async error => {
      const retry = () => axios.request(error.config);
      try {
        const unexpectedValue = await handleApiError(error);
        return assertNever(unexpectedValue);
      } catch (handledApiError) {
        const onFailed = apiListeners?.onFailed;
        if (onFailed) {
          return onFailed?.({ error: handledApiError as ApiError, retry });
        }
        throw handledApiError;
      }
    },
  );
}
