import { PrivateKeyAccount } from 'viem';

import { PrimaryAAAccount, SerializedSKAData } from './PrimaryAAAccount';
import { SKAccount } from './SKAccount';

export interface CreateSKAccountParams {
  skaSigner: PrivateKeyAccount;
  serializedSKAData: SerializedSKAData;
}

export interface AAProvider {
  createAAAccount: (signer: PrivateKeyAccount) => Promise<PrimaryAAAccount>;
  createSKAccount: (params: CreateSKAccountParams) => Promise<SKAccount>;
}
