import { Address, GetContractReturnType, PublicClient, erc20Abi, getContract } from 'viem';

import { SupportedChainId } from '../AAProviders/shared/chains';

import { DepositStrategy } from './DepositStrategy';

interface AccountDepositStrategyParams {
  strategy: DepositStrategy;
  aaAddress: Address;
  eoaAddress: Address;
  publicClient: PublicClient;
}

export class AccountDepositStrategy {
  private strategy: DepositStrategy;

  private aaAddress: Address;

  private eoaAddress: Address;

  public tokenContract: GetContractReturnType<typeof erc20Abi, PublicClient>;

  public bondTokenContract: GetContractReturnType<typeof erc20Abi, PublicClient>;

  constructor({ strategy, aaAddress, eoaAddress, publicClient }: AccountDepositStrategyParams) {
    this.strategy = strategy;
    this.aaAddress = aaAddress;
    this.eoaAddress = eoaAddress;

    this.tokenContract = getContract({
      abi: erc20Abi,
      address: strategy.tokenAddress,
      client: publicClient,
    });

    this.bondTokenContract = getContract({
      abi: erc20Abi,
      address: strategy.bondTokenAddress,
      client: publicClient,
    });
  }

  get id(): string {
    return this.strategy.id;
  }

  get chainId(): SupportedChainId {
    return this.strategy.chainId;
  }

  get tokenAddress(): Address {
    return this.strategy.tokenAddress;
  }

  get bondTokenAddress(): Address {
    return this.strategy.bondTokenAddress;
  }

  get isNative(): boolean {
    return this.strategy.isNative;
  }

  get isEOA(): boolean {
    return this.strategy.isEOA;
  }

  bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint> {
    return this.strategy.bondTokenAmountToTokenAmount(amount);
  }

  tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint> {
    return this.strategy.tokenAmountToBondTokenAmount(amount);
  }

  async getTokenBalance(): Promise<bigint> {
    const ownerAddress = this.isEOA ? this.eoaAddress : this.aaAddress;
    return this.tokenContract.read.balanceOf([ownerAddress]);
  }

  async getBondTokenBalance(): Promise<bigint> {
    return this.bondTokenContract.read.balanceOf([this.aaAddress]);
  }

  async getDepositedAmount(): Promise<bigint> {
    return this.bondTokenAmountToTokenAmount(await this.getBondTokenBalance());
  }
}
