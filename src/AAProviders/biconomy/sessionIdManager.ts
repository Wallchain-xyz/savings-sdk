import { toFunctionSelector } from 'viem';

import { Permission, Txn } from '../types';

import { SessionIdMap } from './common';

export class SessionIdManager {
  readonly data: SessionIdMap;

  constructor(data?: SessionIdMap) {
    this.data = data || {};
  }

  storeSessionIdForPermission(permission: Permission, sessionId: string): void {
    this.data[(permission.target + toFunctionSelector(permission.abi)).toLowerCase()] = sessionId;
  }

  getSessionIdForTxn(txn: Txn): string {
    const functionSelector = txn.data.substring(0, 10);
    return this.data[(txn.to + functionSelector).toLowerCase()];
  }
}
