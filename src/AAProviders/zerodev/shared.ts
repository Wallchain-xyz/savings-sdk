import { KernelAccountClient } from '@zerodev/sdk/clients/kernelAccountClient';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { Chain, Transport } from 'viem';

import type { KernelSmartAccount } from '@zerodev/sdk/accounts';
import type { KernelValidator } from '@zerodev/sdk/types';

export type KernelClient = KernelAccountClient<
  typeof ENTRYPOINT_ADDRESS_V06,
  Transport,
  Chain,
  KernelSmartAccount<typeof ENTRYPOINT_ADDRESS_V06, Transport>
>;

export type ECDSAValidator = KernelValidator<typeof ENTRYPOINT_ADDRESS_V06, 'ECDSAValidator'>;
