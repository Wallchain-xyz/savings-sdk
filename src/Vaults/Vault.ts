import { Address, Hash, getContract, parseAbi } from 'viem';

import { VaultConfig } from './VaultConfigs';
import { PublicClientWithChain, WalletClientWithChain } from './ViemDefinitions';

interface VaultConstructorParams {
  publicClient: PublicClientWithChain;
  walletClient: WalletClientWithChain;
  config: VaultConfig;
}

interface WithdrawInfo {
  pendingSharesAmount: bigint;
  claimableAssetsAmount: bigint;
}

const vaultAbi = parseAbi([
  'function totalAssets() public view returns (uint256)',
  'function depositCap() public view returns (uint256)',
  'function convertToShares(uint256 assets) public view returns (uint256)',
  'function convertToAssets(uint256 assets) public view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function deposit(uint256 assets, address receiver) public returns (uint256)',
  'function pendingRedeemRequest(uint256, address controller) public view returns (uint256 shares)',
  'function claimableRedeemRequestAsAssets(uint256, address controller) public view returns (uint256 assets)',
  'function requestRedeem(uint256 shares, address controller, address owner) public returns (uint256 requestId)',
  'function withdraw(uint256 assets, address receiver, address owner) public returns (uint256)',
]);

/**
 * Represents a single vault instance for user perspective
 *
 * Provides all methods needed to interact with Wallchain's vault contract.
 * Note this class stores 'walletClient', that allows to identify user (e.g. get his on-chain address)
 * and send transactions on user behalf.
 */
export class Vault {
  private walletClient: WalletClientWithChain;

  private vaultContract; // Type is inferred as it is very complex

  private config: VaultConfig;

  /**
   * Vault contract address
   */
  get address(): Address {
    return this.config.address;
  }

  /**
   * Vault asset token address
   *
   * Asset is a token used to deposit/withdraw funds, e.g. it is underlying token that
   * is used by this vault. You can think about it as a vault's currency.
   */
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

  /**
   * Get total assets this vault holds
   *
   * Uses vault.asset token as a currency
   */
  async getTvl() {
    return this.vaultContract.read.totalAssets();
  }

  /**
   * Get maximum assets this vault can hold
   *
   * Uses vault.asset token as a currency
   */
  async getDepositCap() {
    return this.vaultContract.read.depositCap();
  }

  /**
   * Convert given amount of vault shares into assets amount
   */
  async shareAmountToAssetAmount(shares: bigint) {
    return this.vaultContract.read.convertToAssets([shares]);
  }

  /**
   * Convert given amount of vault assets into shares
   */
  async assetAmountToShareAmount(assets: bigint) {
    return this.vaultContract.read.convertToShares([assets]);
  }

  /**
   * Get amount of shares that belong to given address
   *
   * Note: use shareAmountToAssetAmount() to get amount of assets.
   */
  async getBalance(address: Address) {
    return this.vaultContract.read.balanceOf([address]);
  }

  /**
   * Get amount of shares that belong to the current user address
   *
   * Note: use shareAmountToAssetAmount() to get amount of assets.
   */
  async getOwnBalance() {
    return this.getBalance(this.walletClient.account.address);
  }

  /**
   * Get status of withdraw of given address
   */
  async getActiveWithdraw(address: Address): Promise<WithdrawInfo> {
    return {
      pendingSharesAmount: await this.vaultContract.read.pendingRedeemRequest([0n, address]),
      claimableAssetsAmount: await this.vaultContract.read.claimableRedeemRequestAsAssets([0n, address]),
    };
  }

  /**
   * Get status of withdraw of the current user address
   */
  async getOwnActiveWithdraw(): Promise<WithdrawInfo> {
    return this.getActiveWithdraw(this.walletClient.account.address);
  }

  /**
   * Deposit given amount of assets into the vault
   *
   * This method will send transaction using user's walletClient.
   * Before executing this function, make sure ERC20 approval
   * for asset transfer was given. Use vault's address as spender address.
   */
  async deposit(assets: bigint): Promise<Hash> {
    return this.vaultContract.write.deposit([assets, this.walletClient.account.address]);
  }

  /**
   * Request withdrawal of given shares amount
   *
   * This method will send transaction using user's walletClient.
   * This will add withdrawal request to the queue. To check withdrawal status
   * after executing this method, use getActiveWithdraw() or getOwnActiveWithdraw()
   */
  async requestWithdraw(shares: bigint): Promise<Hash> {
    return this.vaultContract.write.requestRedeem([
      shares,
      this.walletClient.account.address,
      this.walletClient.account.address,
    ]);
  }

  /**
   * Finalize withdrawal of given assets amount
   *
   * This method will send transaction using user's walletClient.
   * Note that you request withdraw using shares amount, but finalize it using
   * assets amount. This is because when admin approves withdrawal, the froze
   * exchange rate by settings fixed amount assets that can be withdrawn.
   */
  async claimWithdraw(assets: bigint): Promise<Hash> {
    return this.vaultContract.write.withdraw([
      assets,
      this.walletClient.account.address,
      this.walletClient.account.address,
    ]);
  }
}
