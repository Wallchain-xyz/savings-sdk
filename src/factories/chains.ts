import { Chain } from 'viem';
import { arbitrum, base, bsc, mainnet } from 'viem/chains';

const supportedChainsById: { [key: number]: Chain } = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [bsc.id]: bsc,
  [arbitrum.id]: arbitrum,
};

export type SupportedChain = typeof base | typeof bsc | typeof arbitrum | typeof mainnet;

export type SupportedChainId = SupportedChain['id'];

export function getChainById(chainId: number): Chain {
  if (!(chainId in supportedChainsById)) {
    throw new Error(`Chain with id ${chainId} is not supported`);
  }
  return supportedChainsById[chainId];
}
