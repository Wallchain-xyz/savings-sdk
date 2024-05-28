import { UserOperationV06 } from './UserOperationV06';

export interface Paymaster {
  addPaymasterIntoUserOp: (userOp: UserOperationV06) => Promise<UserOperationV06>;
}
