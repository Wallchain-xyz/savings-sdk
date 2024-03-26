import { bsc } from 'viem/chains';

import { nativeTokenAddress } from '../shared/nativeTokenAddress';

import nativeBeefyAbi from './abis/beefy/native.json';

import type { DepositStrategy } from './DepositStrategy';
import type { Abi, Address } from 'viem';

export function getSupportedDepositStrategies(): DepositStrategy[] {
  const bondTokenAddress: Address = '0x6BE4741AB0aD233e4315a10bc783a7B923386b71';

  return [
    {
      // TODO: @merlin use hash here
      id: '1',
      permissions: [
        {
          target: bondTokenAddress,
          valueLimit: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
          // TODO: @merlin not sure how to deal here
          abi: nativeBeefyAbi as Abi,
          functionName: 'depositBNB',
        },
        {
          target: bondTokenAddress,
          valueLimit: BigInt(0),
          abi: nativeBeefyAbi as Abi,
          functionName: 'withdrawBNB',
        },
      ],
      chain: bsc,
      tokenAddress: nativeTokenAddress,
      bondTokenAddress,
    },
  ];
}
