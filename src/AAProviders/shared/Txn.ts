import { Address, Hex } from 'viem';

export interface Txn {
  to: Address;
  data: Hex;
  value: bigint;
}
