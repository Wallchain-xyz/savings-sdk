import { GetContractReturnType, PublicClient, getContract, parseAbi } from 'viem';

import { BaseDepositStrategy } from '../BaseStrategy';

import { DepositStrategyData } from '../types';

const vaultAbi = parseAbi([
  'function getPricePerFullShare() public view returns (uint256)',
  'function decimals() public view returns (uint8)',
]);

export abstract class BaseBeefyStrategy extends BaseDepositStrategy {
  private baseVaultContract: GetContractReturnType<typeof vaultAbi, PublicClient>;

  constructor(data: DepositStrategyData, publicClient: PublicClient) {
    super(data);
    this.baseVaultContract = getContract({
      address: this.bondTokenAddress,
      abi: vaultAbi,
      client: publicClient,
    });
  }

  async bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint> {
    const factor = await this.baseVaultContract.read.getPricePerFullShare();
    const decimals = await this.baseVaultContract.read.decimals();
    return (amount * factor) / 10n ** BigInt(decimals);
  }

  async tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint> {
    const factor = await this.baseVaultContract.read.getPricePerFullShare();
    const decimals = await this.baseVaultContract.read.decimals();
    return (amount * 10n ** BigInt(decimals)) / factor;
  }
}
