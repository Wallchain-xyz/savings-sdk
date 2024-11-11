const VAULTS = [
  {
    id: 'crypto-cove-2--dev',
    address: '0xACAE2184D4c60993A2e415EAe885478CE8266802',
    asset: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  },
] as const;

export type VaultConfig = (typeof VAULTS)[number];

export type VaultId = VaultConfig['id'];

export const VAULTS_MAP: Map<VaultId, VaultConfig> = new Map(VAULTS.map(vault => [vault.id, vault]));
