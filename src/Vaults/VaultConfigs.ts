const VAULTS = [
  {
    id: 'crypto-cove-2-v0',
    address: '0xd2A1640cB7DE3cdd1c2f97dDa2d4C4c034edC878',
    asset: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  },
] as const;

export type VaultConfig = (typeof VAULTS)[number];

export type VaultId = VaultConfig['id'];

export const VAULTS_MAP: Map<VaultId, VaultConfig> = new Map(VAULTS.map(vault => [vault.id, vault]));
