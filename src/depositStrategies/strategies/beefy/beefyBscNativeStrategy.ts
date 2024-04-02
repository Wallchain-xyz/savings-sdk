import { bsc } from 'viem/chains';

import { NATIVE_TOKEN_ADDRESS, UINT256_MAX } from '../../../consts';

import { DepositStrategy } from '../../DepositStrategy';

import nativeBeefyAbi from './abis/native.json';

import type { Abi, Address } from 'viem';

const vaultAddress: Address = '0x6BE4741AB0aD233e4315a10bc783a7B923386b71';
const bondTokenAddress: Address = '0x6BE4741AB0aD233e4315a10bc783a7B923386b71';

// TODO: @merlin not sure how to deal here
const abi = nativeBeefyAbi as Abi;

export const beefyBscNativeStrategy: DepositStrategy = {
  // TODO: @merlin use hash here
  id: '1',
  permissions: [
    {
      target: vaultAddress,
      valueLimit: UINT256_MAX,
      abi,
      functionName: 'depositBNB',
    },
    {
      target: vaultAddress,
      valueLimit: BigInt(0),
      abi,
      functionName: 'withdrawBNB',
    },
  ],
  chainId: bsc.id,
  tokenAddress: NATIVE_TOKEN_ADDRESS,
  bondTokenAddress,
};
