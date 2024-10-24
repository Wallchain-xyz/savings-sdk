import { Vault } from './Vault';
import { VAULTS_MAP, VaultId } from './VaultConfigs';
import { PublicClientWithChain, WalletClientWithChain } from './ViemDefinitions';

interface ConstructorParams {
  publicClient: PublicClientWithChain;
  walletClient: WalletClientWithChain;
}

export class VaultManager {
  private publicClient: PublicClientWithChain;

  private walletClient: WalletClientWithChain;

  constructor({ publicClient, walletClient }: ConstructorParams) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  getVault(id: VaultId): Vault {
    const vaultConfig = VAULTS_MAP.get(id);
    if (!vaultConfig) {
      throw new Error('Vault not found');
    }

    return new Vault({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      config: vaultConfig,
    });
  }
}
