import { arbitrum, base, bsc, mainnet } from 'viem/chains';

export type SupportedChain = typeof base | typeof bsc | typeof arbitrum | typeof mainnet;

export type SupportedChainId = SupportedChain['id'];
