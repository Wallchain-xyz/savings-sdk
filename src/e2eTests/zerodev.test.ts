import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { KernelAccountAbi, addressToEmptyAccount, createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import {
  ParamOperator,
  deserializeSessionKeyAccount,
  serializeSessionKeyAccount,
  signerToSessionKeyValidator,
} from '@zerodev/session-key';
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import {
  AbiFunction,
  createPublicClient,
  encodeFunctionData,
  getAbiItem,
  http,
  toFunctionSelector,
  zeroAddress,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

import { IntegrationTestConfig, getTestConfig } from './helper';

import type { UserOperation } from 'permissionless/types/userOperation';

const DEPOSIT_BEEFY_ABI: AbiFunction = {
  inputs: [
    {
      internalType: 'uint256',
      name: '_amount',
      type: 'uint256',
    },
  ],
  name: 'deposit',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};

const APPROVE_ERC20_ABI: AbiFunction = {
  name: 'approve',
  type: 'function',
  inputs: [
    {
      type: 'address',
      name: 'spender',
    },
    {
      type: 'uint256',
      name: 'value',
    },
  ],
  outputs: [
    {
      name: '',
      type: 'bool',
    },
  ],
  stateMutability: 'nonpayable',
};

describe('E2E zerodev API tests', () => {
  const config: IntegrationTestConfig = getTestConfig();

  const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${config.apiKey}`;

  const chain = base;
  const entryPoint = ENTRYPOINT_ADDRESS_V06;

  function createSponsorUserOperation() {
    const pimlicoPaymasterURL = `https://api.pimlico.io/v2/base/rpc?apikey=${config.apiKey}`;
    const pimlicoTransport = http(pimlicoPaymasterURL);

    const sponsorshipPolicyId = 'sp_condemned_la_nuit';

    const pimlicoPaymasterClient = createPimlicoPaymasterClient({
      transport: pimlicoTransport,
      entryPoint,
    });

    return async ({ userOperation }: { userOperation: UserOperation<'v0.6'> }) => {
      const sponsoredUserOperation = await pimlicoPaymasterClient.sponsorUserOperation({
        userOperation,
        sponsorshipPolicyId,
      });

      return {
        ...userOperation,
        ...sponsoredUserOperation,
      };
    };
  }

  it('deposit USDC using batched txns', async () => {
    if (config.aaOwnerPrivateKey === '') {
      throw Error('Please set TESTS_AA_OWNER_PRIVATE_KEY to run this test');
    }

    // Step 1: Setup local (owner) validator

    const signer = privateKeyToAccount(config.aaOwnerPrivateKey as `0x{string}`);
    const publicClient = createPublicClient({
      transport: http(BUNDLER_RPC),
    });
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
    });

    // Step 2: Setup session key PK + address
    const sessionPrivateKey = generatePrivateKey();
    const sessionKeySigner = privateKeyToAccount(sessionPrivateKey);
    const sessionKeyAddress = sessionKeySigner.address;

    // Step 3: Sign session key and serialize it
    const emptySessionKeySigner = addressToEmptyAccount(sessionKeyAddress);
    const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
      signer: emptySessionKeySigner,
      entryPoint,
      validatorData: {
        permissions: [
          {
            target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
            functionName: 'deposit',
            valueLimit: BigInt(0),
            abi: [DEPOSIT_BEEFY_ABI],
          },
          {
            target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            functionName: 'approve',
            valueLimit: BigInt(0),
            abi: [APPROVE_ERC20_ABI],
            args: [
              {
                operator: ParamOperator.EQUAL,
                value: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
              },
            ],
          },
        ],
      },
    });
    const sessionKeyAccountLocal = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: ecdsaValidator,
        regular: sessionKeyValidator,
        action: {
          address: zeroAddress,
          selector: toFunctionSelector(getAbiItem({ abi: KernelAccountAbi, name: 'executeBatch' })),
        },
      },
    });
    const serializedSessionKey = await serializeSessionKeyAccount(sessionKeyAccountLocal);

    // Step 4: Create kernelClient account using serialized key + session key PK signer
    const sessionKeyAccount = await deserializeSessionKeyAccount(
      publicClient,
      entryPoint,
      serializedSessionKey,
      sessionKeySigner,
    );
    const kernelClient = createKernelAccountClient({
      account: sessionKeyAccount,
      chain,
      entryPoint,
      bundlerTransport: http(BUNDLER_RPC),
      middleware: {
        sponsorUserOperation: createSponsorUserOperation(),
      },
    });

    // Step 5: send 2 transactions as a batch - one two set allowance for USDC, second to deposit it
    const userOpHash = await kernelClient.sendUserOperation({
      account: kernelClient.account,
      userOperation: {
        callData: await kernelClient.account.encodeCallData([
          {
            to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            value: BigInt(0),
            data: encodeFunctionData({
              functionName: 'approve',
              abi: [APPROVE_ERC20_ABI],
              args: ['0xeF6ED674486E54507d0f711C0d388BD8a1552E6F', BigInt(100)],
            }),
          },
          {
            to: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
            value: BigInt(0),
            data: encodeFunctionData({
              abi: [DEPOSIT_BEEFY_ABI],
              functionName: 'deposit',
              args: [BigInt(100)],
            }),
          },
        ]),
      },
    });
    expect(userOpHash).toBeTruthy();
  }, 100_000);
});
