import { GetContractReturnType, PublicClient, encodeFunctionData, getContract, parseAbi } from 'viem';

import { Txn } from '../../AAProviders/shared/Txn';
import { erc20ABI } from '../../utils/erc20ABI';

import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategy,
  DepositStrategyConfig,
} from '../DepositStrategy';

const moonwellABI = parseAbi([
  'function mint(uint256 mintAmount) public',
  'function redeem(uint256 redeemTokens) public',
  'function exchangeRateStored() public view returns (uint)',
]);

export class MoonwellERC20Strategy extends DepositStrategy {
  private moonwellContract: GetContractReturnType<typeof moonwellABI, PublicClient>;

  get isEOA() {
    return false;
  }

  constructor(config: DepositStrategyConfig, publicClient: PublicClient) {
    super(config);
    this.moonwellContract = getContract({
      address: this.bondTokenAddress,
      abi: moonwellABI,
      client: publicClient,
    });
  }

  async createDepositTxns({ amount }: CreateDepositTxnsParams): Promise<Txn[]> {
    return [
      {
        to: this.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [this.bondTokenAddress, amount],
        }),
      },
      {
        to: this.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: moonwellABI,
          functionName: 'mint',
          args: [amount],
        }),
      },
    ];
  }

  async createWithdrawTxns({ amount }: CreateWithdrawTxnsParams): Promise<Txn[]> {
    return [
      {
        to: this.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: moonwellABI,
          functionName: 'redeem',
          args: [amount],
        }),
      },
    ];
  }

  async bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint> {
    const rate = await this.moonwellContract.read.exchangeRateStored();
    return (amount * rate) / 10n ** BigInt(18);
  }

  async tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint> {
    const rate = await this.moonwellContract.read.exchangeRateStored();
    return (amount * 10n ** BigInt(18)) / rate;
  }
}
