import { Address } from 'viem';

export interface WallchainAuthMessage {
  info: string;
  aa_address: Address;
  expires: number;
}

export function createAuthMessage(userAddress: Address): WallchainAuthMessage {
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in milliseconds
  const expiresInt = Math.floor(expires.getTime() / 1000); // Convert to seconds
  return {
    info: 'Enable auto yield',
    aa_address: userAddress,
    expires: expiresInt,
  };
}
