import {
  ADDRESS_ZERO,
  GasFeeValues,
  IBundler,
  SimulationType,
  StateOverrideSet,
  UserOpByHashResponse,
  UserOpGasResponse,
  UserOpReceipt,
  UserOpResponse,
  UserOpStatus,
  UserOperationStruct,
} from '@biconomy/account';
import { BundlerClient, ENTRYPOINT_ADDRESS_V06, createBundlerClient } from 'permissionless';
import { Address, Chain, Hash, PublicClient, createPublicClient, http } from 'viem';

import { biconomyUserOpStructToUserOp, ensureHex } from './common';

export class PimlicoBundler implements IBundler {
  private bundlerClient: BundlerClient<typeof ENTRYPOINT_ADDRESS_V06>;

  private publicClient: PublicClient;

  private bundlerUrl: string;

  constructor(bundlerUrl: string, chain: Chain) {
    this.bundlerUrl = bundlerUrl;
    this.publicClient = createPublicClient({ chain, transport: http() });
    this.bundlerClient = createBundlerClient({
      chain,
      transport: http(bundlerUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });
  }

  async estimateUserOpGas(
    _userOp: Partial<UserOperationStruct>,
    stateOverrideSet?: StateOverrideSet,
  ): Promise<UserOpGasResponse> {
    const res = await this.bundlerClient.estimateUserOperationGas(
      {
        userOperation: {
          ...biconomyUserOpStructToUserOp(_userOp),
          // Estimate requires non-zero gas fees
          maxFeePerGas: BigInt(_userOp.maxFeePerGas || 1),
          maxPriorityFeePerGas: BigInt(_userOp.maxPriorityFeePerGas || 1),
        },
      },
      // Struct is same, but a lot of string -> Hex casts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateOverrideSet as any,
    );

    const gasFees = await this.publicClient.estimateFeesPerGas();

    return {
      callGasLimit: ensureHex(res.callGasLimit),
      maxFeePerGas: ensureHex(gasFees.maxFeePerGas!),
      maxPriorityFeePerGas: ensureHex(gasFees.maxPriorityFeePerGas!),
      preVerificationGas: ensureHex(Math.min(Number(res.preVerificationGas), 300_000)),
      verificationGasLimit: ensureHex(res.verificationGasLimit),
    };
  }

  getBundlerUrl(): string {
    return this.bundlerUrl;
  }

  async getGasFeeValues(): Promise<GasFeeValues> {
    const gasFees = await this.publicClient.estimateFeesPerGas();
    return {
      maxFeePerGas: gasFees.maxFeePerGas!.toString(),
      maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas!.toString(),
    };
  }

  async getUserOpByHash(_userOpHash: string): Promise<UserOpByHashResponse> {
    const res = await this.bundlerClient.getUserOperationByHash({ hash: _userOpHash as Hash });
    if (!res) {
      throw new Error('User op not found');
    }
    return {
      blockHash: res.blockHash,
      blockNumber: Number(res.blockNumber),
      transactionHash: res.transactionHash,
      entryPoint: res.entryPoint,
      callData: res.userOperation.callData,
      callGasLimit: res.userOperation.callGasLimit,
      initCode: res.userOperation.initCode,
      maxFeePerGas: res.userOperation.maxFeePerGas,
      maxPriorityFeePerGas: res.userOperation.maxPriorityFeePerGas,
      nonce: res.userOperation.nonce,
      paymasterAndData: res.userOperation.paymasterAndData,
      preVerificationGas: res.userOperation.preVerificationGas,
      sender: res.userOperation.sender,
      signature: res.userOperation.signature,
      verificationGasLimit: res.userOperation.verificationGasLimit,
    };
  }

  async getUserOpReceipt(_userOpHash: string): Promise<UserOpReceipt> {
    const res = await this.bundlerClient.getUserOperationReceipt({ hash: _userOpHash as Hash });
    if (!res) {
      throw new Error('User op not found');
    }
    return {
      actualGasCost: ensureHex(res.actualGasCost),
      actualGasUsed: ensureHex(res.actualGasUsed),
      entryPoint: res.entryPoint,
      logs: res.logs,
      paymaster: res.paymaster ?? ADDRESS_ZERO,
      reason: res.reason ?? '',
      receipt: res.receipt,
      success: res.success ? 'true' : 'false',
      userOpHash: res.userOpHash,
    };
  }

  async getUserOpStatus(_userOpHash: string): Promise<UserOpStatus> {
    const res = await this.bundlerClient.getUserOperationReceipt({ hash: _userOpHash as Hash });
    if (!res) {
      return { state: 'PENDING' };
    }
    return {
      state: 'SUCCESS',
      transactionHash: res.receipt.transactionHash,
      userOperationReceipt: {
        userOpHash: res.userOpHash,
        entryPoint: res.entryPoint,
        paymaster: res.entryPoint,
        actualGasCost: ensureHex(res.actualGasCost),
        actualGasUsed: ensureHex(res.actualGasUsed),
        success: res.success ? 'true' : 'false',
        reason: res.reason ?? '',
        logs: res.logs,
        receipt: res.receipt,
      },
    };
  }

  async sendUserOp(_userOp: UserOperationStruct, _simulationType?: SimulationType): Promise<UserOpResponse> {
    const userOpHash = await this.bundlerClient.sendUserOperation({
      // Biconomy type is Partial for some reason, but structure is the same
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userOperation: {
        sender: _userOp.sender as Address,
        nonce: BigInt(_userOp.nonce),
        initCode: ensureHex(_userOp.initCode),
        callData: ensureHex(_userOp.callData),
        callGasLimit: BigInt(_userOp.callGasLimit ?? 0),
        verificationGasLimit: BigInt(_userOp.verificationGasLimit ?? 0),
        preVerificationGas: BigInt(_userOp.preVerificationGas ?? 0),
        maxFeePerGas: BigInt(_userOp.maxFeePerGas ?? 0),
        maxPriorityFeePerGas: BigInt(_userOp.maxPriorityFeePerGas ?? 0),
        paymasterAndData: ensureHex(_userOp.paymasterAndData),
        signature: ensureHex(_userOp.signature),
      },
    });

    const intervalMS = 500;
    const maxWaitMS = 30_000;

    function pauseFor(milliseconds: number) {
      return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
      });
    }

    return {
      userOpHash,
      wait: async () => {
        let waitedFor = 0;
        while (waitedFor < maxWaitMS) {
          // eslint-disable-next-line no-await-in-loop
          await pauseFor(intervalMS);
          waitedFor += intervalMS;
          try {
            // eslint-disable-next-line no-await-in-loop
            return await this.getUserOpReceipt(userOpHash);
          } catch (error) {
            // Just retry
          }
        }
        throw new Error('Wait limit exceeded');
      },
      waitForTxHash: async () => {
        let waitedFor = 0;
        while (waitedFor < maxWaitMS) {
          // eslint-disable-next-line no-await-in-loop
          await pauseFor(intervalMS);
          waitedFor += intervalMS;
          // eslint-disable-next-line no-await-in-loop
          const status = await this.getUserOpStatus(userOpHash);
          if (status.transactionHash) {
            return status;
          }
        }
        throw new Error('Wait limit exceeded');
      },
    };
  }
}
