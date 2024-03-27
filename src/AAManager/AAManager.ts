import { KernelValidator, addressToEmptyAccount, createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import { revokeSessionKey, serializeSessionKeyAccount, signerToSessionKeyValidator } from '@zerodev/session-key';

import { Address, type Transport, createPublicClient, http } from 'viem';

import type { ValidatorData } from '../depositStrategies/DepositStrategy';

interface ConstructorParams {
  sudoValidator: KernelValidator;
  bundlerAPIKey: string;
}

interface PrepareSessionKeyAccountParams {
  sessionKeyAccountAddress: Address;
  validatorData: ValidatorData;
}

export class AAManager {
  private _aaAccountClient: ReturnType<typeof createKernelAccountClient> | undefined;

  private readonly sudoValidator: KernelValidator;

  private readonly publicClient: ReturnType<typeof createPublicClient>;

  private readonly transport: Transport;

  constructor({ sudoValidator, bundlerAPIKey }: ConstructorParams) {
    this.sudoValidator = sudoValidator;
    this.transport = http(`https://rpc.zerodev.app/api/v2/bundler/${bundlerAPIKey}`);
    this.publicClient = createPublicClient({
      transport: this.transport,
    });
  }

  async init() {
    const aaAccount = await createKernelAccount(this.publicClient, {
      plugins: {
        sudo: this.sudoValidator,
      },
    });
    this._aaAccountClient = createKernelAccountClient({
      account: aaAccount,
      transport: this.transport,
    });
  }

  get aaAddress(): Address {
    if (!this._aaAccountClient) {
      throw new Error('Call init() before using aaAccountClient');
    }
    // TODO: @merlin fix typing
    // @ts-expect-error it doesn't know here that we have account inside
    return this._aaAccountClient.account.address;
  }

  get aaAccountClient() {
    if (!this._aaAccountClient) {
      throw new Error('Call init() before using aaAccountClient');
    }
    return this._aaAccountClient;
  }

  async revokeSKA(sessionKeyAccountAddress: Address) {
    if (!this._aaAccountClient) {
      throw new Error('Call init() before using aaAccountClient');
    }

    // TODO: @merlin fix typing
    // @ts-expect-error it doesn't know here that we have account inside
    await revokeSessionKey(this._aaAccountClient, sessionKeyAccountAddress);
  }

  async signSKA({ sessionKeyAccountAddress, validatorData }: PrepareSessionKeyAccountParams) {
    const emptySessionKeySigner = addressToEmptyAccount(sessionKeyAccountAddress);

    const sessionKeyValidator = await signerToSessionKeyValidator(this.publicClient, {
      signer: emptySessionKeySigner,
      validatorData,
    });

    const sessionKeyAccount = await createKernelAccount(this.publicClient, {
      plugins: {
        sudo: this.sudoValidator,
        regular: sessionKeyValidator,
      },
    });

    return serializeSessionKeyAccount(sessionKeyAccount);
  }
}
