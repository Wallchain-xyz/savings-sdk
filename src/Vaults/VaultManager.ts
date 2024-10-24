import { Vault } from './Vault';
import { VAULTS_MAP, VaultId } from './VaultConfigs';
import { PublicClientWithChain, WalletClientWithChain } from './ViemDefinitions';

interface ConstructorParams {
  publicClient: PublicClientWithChain;
  walletClient: WalletClientWithChain;
}

/**
 * Represents a store of all wallchain vaults
 */
export class VaultManager {
  private publicClient: PublicClientWithChain;

  private walletClient: WalletClientWithChain;

  constructor({ publicClient, walletClient }: ConstructorParams) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  /**
   * Get a vault instance for a given id
   */
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
