import { AxiosInstance, AxiosResponse } from 'axios';

import { util } from 'zod';

import { ApiError, UnauthenticatedError } from './errors';

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
      try {
        const unexpectedValue = await handleApiError(error);
        return assertNever(unexpectedValue);
      } catch (handledApiError) {
        const onFailed = apiListeners?.onFailed;
        if (onFailed) {
          if (handledApiError instanceof UnauthenticatedError) {
            // eslint-disable-next-line no-param-reassign
            delete error.config.headers.Authorization;
          }
          const retry = () => axios.request(error.config);
          return onFailed?.({ error: handledApiError as ApiError, retry });
        }
        throw handledApiError;
      }
    },
  );
}
