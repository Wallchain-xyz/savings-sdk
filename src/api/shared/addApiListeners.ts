import { AxiosInstance, AxiosResponse } from 'axios';

import { SkaError } from '../ska/errors';

import { UnknownAPIError } from './errors';

interface OnFailedParams {
  error: SkaError | UnknownAPIError;
  retry: () => Promise<AxiosResponse>;
}

export interface AddApiListenersParams {
  axios: AxiosInstance;
  apiListeners?: {
    onSuccess?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
    onFailed?: (params: OnFailedParams) => AxiosResponse | Promise<AxiosResponse>;
  };
}

export function addApiListeners({ axios, apiListeners }: AddApiListenersParams) {
  if (apiListeners) {
    const { onSuccess, onFailed } = apiListeners;
    axios.interceptors.response.use(
      response => onSuccess?.(response) ?? response,
      async error => {
        const retry = () => axios.request(error.config);
        return onFailed?.({ error, retry });
      },
    );
  }
}
