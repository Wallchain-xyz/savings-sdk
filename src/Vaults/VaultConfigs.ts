const VAULTS = [
  {
    id: 'crypto-cove-2--dev',
    address: '0x45CD6C6F8AfF6F3F92011B6099c1690d8C9B3Ea2',
    asset: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  },
] as const;

export type VaultConfig = (typeof VAULTS)[number];

export type VaultId = VaultConfig['id'];

export const VAULTS_MAP: Map<VaultId, VaultConfig> = new Map(VAULTS.map(vault => [vault.id, vault]));
