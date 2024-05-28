import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';

import { CreatePimlicoPaymasterUrlParams, createPimlicoPaymasterUrl } from './utils/createPimlicoPaymasterUrl';

type CreatePimlicoPaymasterParams =
  | {
      paymasterUrl: string;
    }
  | CreatePimlicoPaymasterUrlParams;

export function createPimlicoPaymaster(params: CreatePimlicoPaymasterParams): PimlicoPaymaster {
  return new PimlicoPaymaster('paymasterUrl' in params ? params.paymasterUrl : createPimlicoPaymasterUrl(params));
}
