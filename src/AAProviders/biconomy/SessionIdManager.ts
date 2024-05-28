import { Permission } from '../shared/Permission';
import { Txn } from '../shared/Txn';

import { SessionIdMap, permissionToSelector } from './shared';

export class SessionIdManager {
  readonly data: SessionIdMap;

  constructor(data?: SessionIdMap) {
    this.data = data ?? {};
  }

  storeSessionIdForPermission(permission: Permission, sessionId: string): void {
    this.data[(permission.target + permissionToSelector(permission)).toLowerCase()] = sessionId;
  }

  getSessionIdForTxn(txn: Txn): string {
    const functionSelector = txn.data.substring(0, 10);
    return this.data[(txn.to + functionSelector).toLowerCase()];
  }
}
