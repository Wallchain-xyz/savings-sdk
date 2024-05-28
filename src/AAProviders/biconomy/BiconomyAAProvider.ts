import {
  BatchedSessionRouterModule,
  DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
  createSessionKeyManagerModule,
  createSmartAccountClient,
} from '@biconomy/account';
import { SupportedSigner } from '@biconomy/account/dist/_types/account';
import { Address, Chain, PrivateKeyAccount, createWalletClient, http } from 'viem';

import { toAccount } from 'viem/accounts';

import { AAProvider, CreateSKAccountParams } from '../shared/AAProvider';
import { BundlerType } from '../shared/BundlerType';
import { PrimaryAAAccount } from '../shared/PrimaryAAAccount';

import { SKAccount } from '../shared/SKAccount';

import { BiconomyPrimaryAAAccount } from './BiconomyPrimaryAAAccount';
import { BiconomySKAccount } from './BiconomySKAccount';
import { PimlicoBundler } from './PimlicoBundler';
import { SessionMemoryStorage } from './SessionMemoryStorage';
import { BiconomySKAData } from './shared';

import type { IBundler } from '@biconomy/account/dist/_types/bundler';

interface BiconomyAAProviderParams {
  chain: Chain;
  bundlerUrl: string;
  rpcUrl?: string;
  bundlerType?: BundlerType;
}

export class BiconomyAAProvider implements AAProvider {
  private readonly chain: Chain;

  private readonly bundlerUrl: string;

  private readonly rpcUrl: string;

  private readonly bundlerType: BundlerType;

  constructor({ chain, rpcUrl, bundlerUrl, bundlerType }: BiconomyAAProviderParams) {
    this.chain = chain;
    this.rpcUrl = rpcUrl ?? chain.rpcUrls.default.http[0];
    this.bundlerUrl = bundlerUrl;
    this.bundlerType = bundlerType ?? BundlerType.biconomy;
  }

  async createAAAccount(signer: PrivateKeyAccount): Promise<PrimaryAAAccount> {
    const smartAccount = await createSmartAccountClient({
      signer,
      rpcUrl: this.rpcUrl,
      chainId: this.chain.id,
      ...this.createBundlerConfigPart(),
    });
    return new BiconomyPrimaryAAAccount({
      aaAddress: await smartAccount.getAccountAddress(),
      eoaOwnerAddress: signer.address,
      smartAccount,
    });
  }

  async createSKAccount({ skaSigner, serializedSKAData }: CreateSKAccountParams): Promise<SKAccount> {
    const skaData: BiconomySKAData = JSON.parse(serializedSKAData);
    const sessionModule = await createSessionKeyManagerModule({
      moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
      smartAccountAddress: skaData.aaAddress,
      sessionStorageClient: SessionMemoryStorage.fromString(skaData.storageData),
    });
    const sessionBatchModule = await BatchedSessionRouterModule.create({
      moduleAddress: DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
      sessionKeyManagerModule: sessionModule,
      smartAccountAddress: skaData.aaAddress,
    });
    const smartAccount = await createSmartAccountClient({
      signer: this.createFakeSigner(skaData.eoaOwnerAddress),
      rpcUrl: this.rpcUrl,
      chainId: this.chain.id,
      ...this.createBundlerConfigPart(),
    });
    smartAccount.setActiveValidationModule(sessionBatchModule);

    return new BiconomySKAccount({
      aaAddress: await smartAccount.getAccountAddress(),
      smartAccount,
      // We need walletClient as signer because biconomy wants rpcUrl inside signer for some reason
      skaSigner: createWalletClient({
        account: skaSigner,
        chain: this.chain,
        transport: http(this.rpcUrl),
      }),
      skaData,
    });
  }

  private createFakeSigner(eoaAddress: Address): SupportedSigner {
    return createWalletClient({
      account: toAccount({
        address: eoaAddress,
        signMessage: async _ => '0x1',
        signTransaction: async _ => '0x1',
        signTypedData: async _ => '0x1',
      }),
      chain: this.chain,
      transport: http(this.rpcUrl),
    });
  }

  private createBundlerConfigPart(): { bundler: IBundler } | { bundlerUrl: string } {
    if (this.bundlerType === BundlerType.pimlico) {
      return {
        bundler: new PimlicoBundler(this.bundlerUrl, this.chain),
      };
    }
    return { bundlerUrl: this.bundlerUrl };
  }
}
