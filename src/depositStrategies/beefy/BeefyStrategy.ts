import { GetContractReturnType, PublicClient, getContract, parseAbi } from 'viem';

import { DepositStrategy, DepositStrategyConfig } from '../DepositStrategy';

const vaultAbi = parseAbi([
  'function getPricePerFullShare() public view returns (uint256)',
  'function decimals() public view returns (uint8)',
]);

export abstract class BeefyStrategy extends DepositStrategy {
  private vaultContract: GetContractReturnType<typeof vaultAbi, PublicClient>;

  constructor(config: DepositStrategyConfig, publicClient: PublicClient) {
    super(config);
    this.vaultContract = getContract({
      address: this.bondTokenAddress,
      abi: vaultAbi,
      client: publicClient,
    });
  }

  async bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint> {
    const pricePerFullShare = await this.vaultContract.read.getPricePerFullShare();
    const decimals = await this.vaultContract.read.decimals();
    return (amount * pricePerFullShare) / 10n ** BigInt(decimals);
  }

  async tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint> {
    const pricePerFullShare = await this.vaultContract.read.getPricePerFullShare();
    const decimals = await this.vaultContract.read.decimals();
    return (amount * 10n ** BigInt(decimals)) / pricePerFullShare;
  }
}
