import { Address } from 'viem';

export const LOCAL_CHAIN_RPC_URL = `http://localhost:8545`;
export const LOCAL_BUNDLER_URL = 'http://localhost:4337';
export const LOCAL_PAYMASTER_RPC_URL = `http://localhost:4330`;

export const USDC_TOKEN_ADDRESS: Address = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_SOURCE_ACCOUNT_ADDRESS = '0x3304E22DDaa22bCdC5fCa2269b418046aE7b566A';

export const WETH_TOKEN_ADDRESS: Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const WETH_SOURCE_ACCOUNT_ADDRESS = '0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E';

export const ALLOWED_DECREASE_DURING_DEPOSIT = 10n;
