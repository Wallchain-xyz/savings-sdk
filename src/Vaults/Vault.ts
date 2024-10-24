import { Address, Hash, getContract, parseAbi } from 'viem';

import { VaultConfig } from './VaultConfigs';
import { PublicClientWithChain, ViemDefinitions } from './ViemDefinitions';

interface VaultConstructorParams {
  publicClient: PublicClientWithChain;
  walletClient: ViemDefinitions;
  config: VaultConfig;
}

interface WithdrawInfo {
  pendingSharesAmount: bigint;
  claimableAssetsAmount: bigint;
}

const vaultAbi = parseAbi([
  'function totalAssets() public view returns (uint256)',
  'function convertToShares(uint256 assets) public view returns (uint256)',
  'function convertToAssets(uint256 assets) public view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function deposit(uint256 assets, address receiver) public returns (uint256)',
  'function pendingRedeemRequest(uint256, address controller) public view returns (uint256 shares)',
  'function claimableRedeemRequestAsAssets(uint256, address controller) public view returns (uint256 assets)',
  'function requestRedeem(uint256 shares, address controller, address owner) public returns (uint256 requestId)',
  'function withdraw(uint256 assets, address receiver, address owner) public returns (uint256)',
]);

export class Vault {
  private walletClient: ViemDefinitions;

  private vaultContract; // Type is inferred as it is very complex

  private config: VaultConfig;

  get address(): Address {
    return this.config.address;
  }

  get asset(): Address {
    return this.config.asset;
  }

  constructor({ walletClient, config, publicClient }: VaultConstructorParams) {
    this.walletClient = walletClient;
    this.config = config;
    this.vaultContract = getContract({
      address: config.address,
      abi: vaultAbi,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getTvl() {
    return this.vaultContract.read.totalAssets();
  }

  async shareAmountToAssetAmount(amount: bigint) {
    return this.vaultContract.read.convertToAssets([amount]);
  }

  async assetAmountToShareAmount(amount: bigint) {
    return this.vaultContract.read.convertToShares([amount]);
  }

  async getBalance(address: Address) {
    return this.vaultContract.read.balanceOf([address]);
  }

  async getOwnBalance() {
    return this.getBalance(this.walletClient.account.address);
  }

  async getActiveWithdraw(address: Address): Promise<WithdrawInfo> {
    return {
      pendingSharesAmount: await this.vaultContract.read.pendingRedeemRequest([0n, address]),
      claimableAssetsAmount: await this.vaultContract.read.claimableRedeemRequestAsAssets([0n, address]),
    };
  }

  async getOwnActiveWithdraw(): Promise<WithdrawInfo> {
    return this.getActiveWithdraw(this.walletClient.account.address);
  }

  async deposit(amount: bigint): Promise<Hash> {
    return this.vaultContract.write.deposit([amount, this.walletClient.account.address]);
  }

  async requestWithdraw(amount: bigint): Promise<Hash> {
    return this.vaultContract.write.requestRedeem([
      amount,
      this.walletClient.account.address,
      this.walletClient.account.address,
    ]);
  }

  async claimWithdraw(amount: bigint): Promise<Hash> {
    return this.vaultContract.write.withdraw([
      amount,
      this.walletClient.account.address,
      this.walletClient.account.address,
    ]);
  }
}
