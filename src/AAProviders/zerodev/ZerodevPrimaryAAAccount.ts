import { KernelAccountAbi, addressToEmptyAccount, createKernelAccount } from '@zerodev/sdk';
import {
  SESSION_KEY_VALIDATOR_ADDRESS,
  SessionKeyValidatorAbi,
  Permission as ZerodevPermission,
  serializeSessionKeyAccount,
  signerToSessionKeyValidator,
} from '@zerodev/session-key';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { type Abi, Address, PublicClient, encodeFunctionData, getAbiItem, toFunctionSelector, zeroAddress } from 'viem';

import { CreateSKAResult, CreateSessionKeyParams, PrimaryAAAccount } from '../shared/PrimaryAAAccount';
import { Txn } from '../shared/Txn';

import { ECDSAValidator } from './shared';
import { ZerodevAAAccount, ZerodevAAAccountParams } from './ZerodevAAAccount';

interface ZerodevPrimaryAAAccountParams extends ZerodevAAAccountParams {
  publicClient: PublicClient;
  ecdsaValidator: ECDSAValidator;
}

export class ZerodevPrimaryAAAccount extends ZerodevAAAccount implements PrimaryAAAccount {
  private readonly publicClient: PublicClient;

  private readonly ecdsaValidator: ECDSAValidator;

  constructor({ client, publicClient, ecdsaValidator }: ZerodevPrimaryAAAccountParams) {
    super({ client });
    this.publicClient = publicClient;
    this.ecdsaValidator = ecdsaValidator;
  }

  async getRevokeSessionKeyTxn(skaAddress: Address): Promise<Txn> {
    // we need more granular control over this
    return {
      to: SESSION_KEY_VALIDATOR_ADDRESS,
      value: 0n,
      data: encodeFunctionData({
        abi: SessionKeyValidatorAbi,
        functionName: 'disable',
        args: [skaAddress],
      }),
    };
  }

  async createSessionKey({ skaAddress, permissions }: CreateSessionKeyParams): Promise<CreateSKAResult> {
    const sessionKeyValidator = await signerToSessionKeyValidator(this.publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      signer: addressToEmptyAccount(skaAddress),
      validatorData: {
        // Next cast requires casting compatible enum, but typescript is not happy about this cast
        permissions: permissions as unknown as ZerodevPermission<Abi, string>[],
      },
    });
    const sessionKeyAccount = await createKernelAccount(this.publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V06,
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
