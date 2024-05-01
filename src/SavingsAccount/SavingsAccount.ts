import { KernelAccountClient } from '@zerodev/sdk/clients/kernelAccountClient';

import { Address, Chain, Transport } from 'viem';

import { AAManager, WithdrawOrDepositParams } from '../AAManager/AAManager';
import { ChainId } from '../api/auth/__generated__/createApiClient';
import { PauseDepositingParams, SavingsBackendClient } from '../api/SavingsBackendClient';

import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import { createAuthMessage } from './createAuthMessage';

import type { DepositStrategy, DepositStrategyId } from '../depositStrategies/DepositStrategy';
import type { KernelSmartAccount } from '@zerodev/sdk/accounts';

interface ConstructorParams {
  aaManager: AAManager;
  savingsBackendClient: SavingsBackendClient;
  chainId: ChainId;
}

interface WithdrawParams extends WithdrawOrDepositParams, Omit<PauseDepositingParams, 'chainId'> {}

export class SavingsAccount {
  private savingsBackendClient: SavingsBackendClient;

  private aaManager: AAManager;

  chainId: ChainId;

  constructor({ aaManager, savingsBackendClient, chainId }: ConstructorParams) {
    this.savingsBackendClient = savingsBackendClient;
    this.aaManager = aaManager;
    this.chainId = chainId;
  }

  get aaAddress(): Address {
    return this.aaManager.aaAddress;
  }

  // TODO: @melrin not sure we want to expose this
  get aaAccountClient() {
    // TODO: @merlin find better typing here
    return this.aaManager.aaAccountClient as KernelAccountClient<Transport, Chain, KernelSmartAccount>;
  }

  async auth() {
    const authMessage = createAuthMessage(this.aaAddress);
    const signedMessage = await this.aaManager.signMessage(authMessage);
    return this.savingsBackendClient.auth({
      signedMessage,
      message: authMessage,
      chainId: this.chainId,
    });
  }

  async activateStrategies(strategyIds: DepositStrategyId[]): Promise<void> {
    const skaAddressPromise = this.savingsBackendClient.getSKAPublicKey(this.chainId);
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    if (walletSKA) {
      // TODO: @merlin think about transactions here, what if chain fails in the middle
      await this.aaManager.revokeSKA(walletSKA.sessionKeyAccountAddress);
      await this.savingsBackendClient.deleteWalletSKA(this.aaAddress, this.chainId);
    }

    const newStrategyIds = await this.mergeWithActiveStrategyIds(strategyIds);

    const skaAddress = await skaAddressPromise;
    const serializedSKA = await this.aaManager.signSKA({
      sessionKeyAccountAddress: skaAddress,
      depositStrategyIds: newStrategyIds,
    });

    await this.savingsBackendClient.createWalletSKA({
      userAddress: this.aaAddress,
      depositStrategyIds: newStrategyIds,
      serializedSKA,
      chainId: this.chainId,
    });
  }

  private async mergeWithActiveStrategyIds(strategyIds: DepositStrategyId[]) {
    const activeStrategyIds = (await this.getActiveStrategies()).map(strategy => strategy.id);
    return Array.from(new Set([...activeStrategyIds, ...strategyIds]));
  }

  async getActiveStrategies(): Promise<DepositStrategy[]> {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    return walletSKA?.depositStrategyIds.map(getDepositStrategyById) ?? [];
  }

  async deactivateAllStrategies() {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    if (!walletSKA) {
      return;
    }
    await this.aaManager.revokeSKA(walletSKA.sessionKeyAccountAddress);
    await this.savingsBackendClient.deleteWalletSKA(this.aaAddress, this.chainId);
  }

  async withdraw(params: WithdrawParams) {
    const { depositStrategyId } = params;
    const depositStrategy = getDepositStrategyById(depositStrategyId);

    await this.savingsBackendClient.pauseDepositing({
      chainId: depositStrategy.chainId,
      ...params,
    });
    return this.aaManager.withdraw(params);
  }

  async deposit(params: WithdrawOrDepositParams) {
    return this.aaManager.deposit(params);
  }
}
