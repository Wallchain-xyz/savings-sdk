import { Chain } from 'viem';
import { base, baseSepolia, mainnet } from 'viem/chains';

const supportedChainsById: { [key: number]: Chain } = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
};

export type SupportedChain = typeof base | typeof mainnet | typeof baseSepolia;

export type SupportedChainId = SupportedChain['id'];

export function getChainById(chainId: number): Chain {
  if (!(chainId in supportedChainsById)) {
    throw new Error(`Chain with id ${chainId} is not supported`);
  }
  return supportedChainsById[chainId];
}
