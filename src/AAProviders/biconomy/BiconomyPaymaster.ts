import { BiconomyPaymaster as LibBiconomyPaymaster, PaymasterMode, createPaymaster } from '@biconomy/account';

import { Paymaster } from '../shared/Paymaster';

import { UserOperationV06 } from '../shared/UserOperationV06';

import { biconomyUserOpStructToUserOp, userOpToBiconomyUserOpStruct } from './shared';

export class BiconomyPaymaster implements Paymaster {
  private paymaster: LibBiconomyPaymaster;

  constructor(paymaster: LibBiconomyPaymaster) {
    this.paymaster = paymaster;
  }

  static async create(paymasterUrl: string): Promise<BiconomyPaymaster> {
    const paymaster = await createPaymaster({
      paymasterUrl,
      strictMode: true,
    });
    return new BiconomyPaymaster(paymaster);
  }

  async addPaymasterIntoUserOp(userOp: UserOperationV06): Promise<UserOperationV06> {
    const getPaymasterAndDataResponse = await this.paymaster.getPaymasterAndData(userOpToBiconomyUserOpStruct(userOp), {
      mode: PaymasterMode.SPONSORED,
    });
    return biconomyUserOpStructToUserOp({
      ...userOp,
      ...getPaymasterAndDataResponse,
    });
  }
}
