import { Address, PublicClient, createPublicClient, http, parseAbi } from 'viem';

import { SupportedChain } from '../AAManager/SupportedChain';

interface ChainParams {
  chain: SupportedChain;
  rpcURL?: string;
}
interface GetERC20TokenAmountParams {
  tokenAddress: Address;
  accountAddress: Address;
}

export class ChainHelper {
  public chain: SupportedChain;

  private publicClient: PublicClient;

  constructor({ chain, rpcURL }: ChainParams) {
    this.chain = chain;
    // @ts-expect-error @merlin check TS
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcURL),
    });
  }

  async getERC20TokenAmount({ tokenAddress, accountAddress }: GetERC20TokenAmountParams) {
    return this.publicClient.readContract({
      address: tokenAddress,
      abi: parseAbi(['function balanceOf(address owner) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [accountAddress],
    });
  }

  async getNativeTokenAmount(address: Address) {
    return this.publicClient.getBalance({
      address,
    });
  }
}
