import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';

import { CreatePimlicoPaymasterUrlParams, createPimlicoPaymasterUrl } from './utils/createPimlicoPaymasterUrl';

interface CreatePimlicoPaymasterByParams extends CreatePimlicoPaymasterUrlParams {
  paymasterUrl: never;
}

interface CreatePimlicoPaymasterByUrl {
  paymasterUrl: string;
  chainId: never;
  apiKey: never;
}

type CreatePimlicoPaymasterParams = CreatePimlicoPaymasterByParams | CreatePimlicoPaymasterByUrl;

export function createPimlicoPaymaster(params: CreatePimlicoPaymasterParams): PimlicoPaymaster {
  return new PimlicoPaymaster(params.paymasterUrl ?? createPimlicoPaymasterUrl(params));
}
