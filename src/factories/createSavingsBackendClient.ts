import { createAuthClient } from '../api/auth/createAuthClient';
import { createDmsClient } from '../api/dms/createDmsClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { AddApiListenersParams } from '../api/shared/addApiListeners';
import { createSKAClient } from '../api/ska/createSKAClient';
import { DEFAULT_BACKEND_URL } from '../consts';

import type { ZodiosOptions } from '@zodios/core';

export interface CreateSavingsBackendClientParams {
  savingsBackendUrl?: string;
  zodiosOptions?: Partial<ZodiosOptions>;
  apiListeners?: AddApiListenersParams['apiListeners'];
}

export function createSavingsBackendClient({
  savingsBackendUrl,
  zodiosOptions,
  apiListeners,
}: CreateSavingsBackendClientParams): SavingsBackendClient {
  const apiClientParams = {
    baseUrl: savingsBackendUrl ?? DEFAULT_BACKEND_URL,
    zodiosOptions,
    apiListeners,
  };
  const authClient = createAuthClient(apiClientParams);
  const skaClient = createSKAClient(apiClientParams);
  const dmsClient = createDmsClient(apiClientParams);
  return new SavingsBackendClient({
    skaClient,
    authClient,
    dmsClient,
  });
}
