import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';

import { deserializeSessionKeyAccount } from '@zerodev/session-key';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { createPimlicoBundlerClient } from 'permissionless/clients/pimlico';
import { Chain, PrivateKeyAccount, createPublicClient, http } from 'viem';

import { AAProvider, CreateSKAccountParams } from '../shared/AAProvider';
import { BundlerType } from '../shared/BundlerType';
import { PrimaryAAAccount } from '../shared/PrimaryAAAccount';

import { KERNEL_VERSION, KernelClient } from './shared';
import { ZerodevPrimaryAAAccount } from './ZerodevPrimaryAAAccount';
import { ZerodevSKAccount } from './ZerodevSKAccount';

interface ZerodevAAProviderParams {
  chain: Chain;
  bundlerUrl: string;
  rpcUrl?: string;
  bundlerType?: BundlerType;
}

export class ZerodevAAProvider implements AAProvider {
  private readonly chain: Chain;

  private readonly bundlerUrl: string;

  private readonly rpcUrl: string;

  private readonly bundlerType: BundlerType;

  constructor({ chain, rpcUrl, bundlerUrl, bundlerType }: ZerodevAAProviderParams) {
    this.chain = chain;
    this.rpcUrl = rpcUrl ?? chain.rpcUrls.default.http[0];
    this.bundlerUrl = bundlerUrl;
    this.bundlerType = bundlerType ?? BundlerType.pimlico;
  }

  async createAAAccount(signer: PrivateKeyAccount): Promise<PrimaryAAAccount> {
    const publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      kernelVersion: KERNEL_VERSION,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });
    const aaAccount = await createKernelAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      kernelVersion: KERNEL_VERSION,
      plugins: {
        sudo: ecdsaValidator,
      },
    });
    const aaAccountClient: KernelClient = createKernelAccountClient({
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      account: aaAccount,
      ...this.createBundlerConfigPart(),
    });
    return new ZerodevPrimaryAAAccount({ client: aaAccountClient, publicClient, ecdsaValidator });
  }

  async createSKAccount({ skaSigner, serializedSKAData }: CreateSKAccountParams): Promise<ZerodevSKAccount> {
    const publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
    const sessionKeyAccount = await deserializeSessionKeyAccount(
      publicClient,
      ENTRYPOINT_ADDRESS_V06,
      KERNEL_VERSION,
      serializedSKAData,
      skaSigner,
    );
    const kernelClient = createKernelAccountClient({
      account: sessionKeyAccount,
      chain: this.chain,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      ...this.createBundlerConfigPart(),
    });
    return new ZerodevSKAccount({ client: kernelClient });
  }

  private createBundlerConfigPart() {
    const bundlerTransport = http(this.bundlerUrl);
    const sharedBundlerConfigPart = {
      bundlerTransport,
    };

    if (this.bundlerType !== BundlerType.pimlico) {
      return sharedBundlerConfigPart;
    }

    const pimlicoBundlerClient = createPimlicoBundlerClient({
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      transport: bundlerTransport,
    });

    return {
      ...sharedBundlerConfigPart,
      middleware: {
        gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).standard,
      },
    };
  }
}
