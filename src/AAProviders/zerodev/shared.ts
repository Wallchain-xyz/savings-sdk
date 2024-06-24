import { KERNEL_V2_4 } from '@zerodev/sdk/_types/constants';
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

// We use 0.2.4 version of kernel - last V2 contract version
// https://docs.zerodev.app/sdk/core-api/create-account#picking-a-kernel-version
export const KERNEL_VERSION = KERNEL_V2_4;
