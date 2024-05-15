import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { PimlicoPaymasterClient, createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { http } from 'viem';

import { Paymaster, UserOperationV06 } from '../types';

export class PimlicoPaymaster implements Paymaster {
  private client: PimlicoPaymasterClient<typeof ENTRYPOINT_ADDRESS_V06>;

  constructor(paymasterUrl: string) {
    const pimlicoTransport = http(paymasterUrl);
    this.client = createPimlicoPaymasterClient({
      transport: pimlicoTransport,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });
  }

  async addPaymasterIntoUserOp(userOp: UserOperationV06): Promise<UserOperationV06> {
    const res = await this.client.sponsorUserOperation({ userOperation: userOp });
    return {
      ...userOp,
      ...res,
    };
  }
}
