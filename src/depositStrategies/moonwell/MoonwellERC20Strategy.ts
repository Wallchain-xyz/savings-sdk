import { GetContractReturnType, PublicClient, encodeFunctionData, getContract, parseAbi } from 'viem';

import { Txn } from '../../AAProviders/shared/Txn';
import { erc20ABI } from '../../utils/erc20ABI';

import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategy,
  DepositStrategyConfig,
} from '../DepositStrategy';

const moonwellAbi = parseAbi([
  'function mint(uint256 mintAmount) public',
  'function redeem(uint256 redeemTokens) public',
  'function exchangeRateStored() public view returns (uint)',
]);

const MOONWELL_EXCHANGE_RATE_FACTOR = 10n ** 18n;

export class MoonwellERC20Strategy extends DepositStrategy {
  private moonwellContract: GetContractReturnType<typeof moonwellAbi, PublicClient>;

  constructor(config: DepositStrategyConfig, publicClient: PublicClient) {
    super(config);
    this.moonwellContract = getContract({
      address: this.bondTokenAddress,
      abi: moonwellAbi,
      client: publicClient,
    });
  }

  createDepositTxns({ amount }: CreateDepositTxnsParams): Txn[] {
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
          abi: moonwellAbi,
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
          abi: moonwellAbi,
          functionName: 'redeem',
          args: [amount],
        }),
      },
    ];
  }

  async bondTokenAmountToTokenAmount(amount: bigint): Promise<bigint> {
    const rate = await this.moonwellContract.read.exchangeRateStored();
    return (amount * rate) / MOONWELL_EXCHANGE_RATE_FACTOR;
  }

  async tokenAmountToBondTokenAmount(amount: bigint): Promise<bigint> {
    const rate = await this.moonwellContract.read.exchangeRateStored();
    return (amount * MOONWELL_EXCHANGE_RATE_FACTOR) / rate;
  }
}
