import { Address } from 'viem';

import { ParamsValuesByKey } from '../../DepositStrategy';

export function ensureAddress(params: ParamsValuesByKey, key: string): Address {
  const value = params[key];
  if (!value) {
    throw new Error(`Parameter ${key} is required!`);
  }
  if (!value.startsWith('0x')) {
    throw new Error(`Parameter ${key} value ${value} is not valid address`);
  }
  return value as Address;
}
