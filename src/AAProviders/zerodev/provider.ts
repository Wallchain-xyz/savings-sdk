import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';

import { deserializeSessionKeyAccount } from '@zerodev/session-key';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { Chain, PrivateKeyAccount, createPublicClient, http } from 'viem';

import { AAAccount, AAProvider } from '../types';

import { ZerodevAAAccount } from './AAAccount';
import { KernelClient } from './common';
import { ZerodevSKAccount } from './SKAccount';

interface ZerodevAAProviderParams {
  chain: Chain;
  bundlerUrl: string;
  rpcUrl?: string;
}

export class ZerodevProvider implements AAProvider {
  private readonly chain: Chain;

  private readonly bundlerUrl: string;

  private readonly rpcUrl: string;

  constructor({ chain, rpcUrl, bundlerUrl }: ZerodevAAProviderParams) {
    this.chain = chain;
    this.rpcUrl = rpcUrl ?? chain.rpcUrls.default.http[0];
    this.bundlerUrl = bundlerUrl;
  }

  async createAAAccount(signer: PrivateKeyAccount): Promise<AAAccount> {
    const publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });
    const aaAccount = await createKernelAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      plugins: {
        sudo: ecdsaValidator,
      },
    });
    const aaAccountClient: KernelClient = createKernelAccountClient({
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      account: aaAccount,
      bundlerTransport: http(this.bundlerUrl),
    });
    return new ZerodevAAAccount({ client: aaAccountClient, publicClient, ecdsaValidator });
  }

  async createSKAccount(skaSigner: PrivateKeyAccount, serializedSKAData: string): Promise<ZerodevSKAccount> {
    const publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
    const sessionKeyAccount = await deserializeSessionKeyAccount(
      publicClient,
      ENTRYPOINT_ADDRESS_V06,
      serializedSKAData,
      skaSigner,
    );
    const kernelClient = createKernelAccountClient({
      account: sessionKeyAccount,
      chain: this.chain,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      bundlerTransport: http(this.bundlerUrl),
    });
    return new ZerodevSKAccount({ client: kernelClient });
  }
}
