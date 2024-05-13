import { Address } from 'viem';

export const abiSVMAddress: Address = '0x000006bC2eCdAe38113929293d241Cf252D91861';

export interface SessionIdMap {
  [key: string]: string;
}

export interface BiconomySKAData {
  storageData: string;
  eoaOwnerAddress: Address;
  aaAddress: Address;
  sessionIdMap: SessionIdMap;
}
