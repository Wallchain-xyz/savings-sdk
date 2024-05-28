import { Address } from 'viem';

import { AAAccount } from './AAAccount';
import { Permission } from './Permission';
import { Txn } from './Txn';

export type SerializedSKAData = string;

export interface CreateSKAResult {
  serializedSKAData: SerializedSKAData;
  txnsToActivate: Txn[];
}

export interface CreateSessionKeyParams {
  skaAddress: Address;
  permissions: Permission[];
}

export interface PrimaryAAAccount extends AAAccount {
  createSessionKey: (params: CreateSessionKeyParams) => Promise<CreateSKAResult>;
  getRevokeSessionKeyTxn: (skaAddress: Address) => Promise<Txn>;
}
