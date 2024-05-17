import { KernelAccountAbi, addressToEmptyAccount, createKernelAccount } from '@zerodev/sdk';
import {
  Permission as ZerodevPermission,
  serializeSessionKeyAccount,
  signerToSessionKeyValidator,
} from '@zerodev/session-key';
import { type Abi, Address, PublicClient, getAbiItem, toFunctionSelector, zeroAddress } from 'viem';

import { entryPoint } from '../../AAManager/EntryPoint';
import { AAAccount, CreateSKAResult, Permission } from '../types';

import { BaseZerodevAAAccount, BaseZerodevAAAccountParams } from './BaseAAccount';
import { ECDSAValidator } from './common';

interface ZerodevAAAccountParams extends BaseZerodevAAAccountParams {
  publicClient: PublicClient;
  ecdsaValidator: ECDSAValidator;
}

export class ZerodevAAAccount extends BaseZerodevAAAccount implements AAAccount {
  private readonly publicClient: PublicClient;

  private readonly ecdsaValidator: ECDSAValidator;

  constructor({ client, publicClient, ecdsaValidator }: ZerodevAAAccountParams) {
    super({ client });
    this.publicClient = publicClient;
    this.ecdsaValidator = ecdsaValidator;
  }

  async createSessionKey(skaAddress: Address, permissions: Permission[]): Promise<CreateSKAResult> {
    const sessionKeyValidator = await signerToSessionKeyValidator(this.publicClient, {
      entryPoint,
      signer: addressToEmptyAccount(skaAddress),
      validatorData: {
        // Next cast requires casting compatible enum, but typescript is not happy about this cast
        permissions: permissions as unknown as ZerodevPermission<Abi, string>[],
      },
    });
    const sessionKeyAccount = await createKernelAccount(this.publicClient, {
      entryPoint,
      plugins: {
        sudo: this.ecdsaValidator,
        regular: sessionKeyValidator,
        action: {
          address: zeroAddress,
          selector: toFunctionSelector(getAbiItem({ abi: KernelAccountAbi, name: 'executeBatch' })),
        },
      },
    });
    return {
      txnsToActivate: [],
      serializedSKAData: await serializeSessionKeyAccount(sessionKeyAccount),
    };
  }
}
