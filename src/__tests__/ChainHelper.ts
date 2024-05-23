import { Address, Hash, PublicClient, createPublicClient, http, parseAbi } from 'viem';

import { SupportedChain } from '../factories/chains';

interface ChainParams {
  chain: SupportedChain;
  rpcURL?: string;
}
interface GetERC20TokenAmountParams {
  tokenAddress: Address;
  accountAddress: Address;
}

interface GetERC20TokenAllowanceParams {
  tokenAddress: Address;
  tokenSpenderAddress: Address;
  tokenOwnerAddress: Address;
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

  async getERC20TokenAllowance({ tokenAddress, tokenSpenderAddress, tokenOwnerAddress }: GetERC20TokenAllowanceParams) {
    return this.publicClient.readContract({
      address: tokenAddress,
      abi: parseAbi(['function allowance(address owner, address spender) external view returns (uint256)']),
      functionName: 'allowance',
      args: [tokenOwnerAddress, tokenSpenderAddress],
    });
  }

  async getNativeTokenAmount(address: Address) {
    return this.publicClient.getBalance({
      address,
    });
  }

  async waitForTransactionReceipt(txnHash: Hash) {
    return this.publicClient.waitForTransactionReceipt({
      hash: txnHash,
    });
  }
}
