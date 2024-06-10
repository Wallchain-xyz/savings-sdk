import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';

import { CreatePimlicoPaymasterUrlParams, createPimlicoPaymasterUrl } from './utils/createPimlicoPaymasterUrl';

type CreatePimlicoPaymasterParams = CreatePimlicoPaymasterUrlParams;

export function createPimlicoPaymaster(params: CreatePimlicoPaymasterParams): PimlicoPaymaster {
  return new PimlicoPaymaster(createPimlicoPaymasterUrl(params));
}
