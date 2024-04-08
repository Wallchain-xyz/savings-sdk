import { base } from 'viem/chains';

import { NATIVE_TOKEN_ADDRESS, UINT256_MAX } from '../../../consts';

import { DepositStrategy } from '../../DepositStrategy';

import nativeBeefyAbi from './abis/native.json';

import type { Abi, Address } from 'viem';

const vaultAddress: Address = '0x62e5B9934dCB87618CFC74B222305D16C997E8c1';
const bondTokenAddress: Address = '0x62e5B9934dCB87618CFC74B222305D16C997E8c1';

// TODO: @merlin not sure how to deal here
const abi = nativeBeefyAbi as Abi;

export const beefyBaseNativeStrategy: DepositStrategy = {
  // TODO: @merlin use hash here
  id: '2',
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
  chainId: base.id,
  tokenAddress: NATIVE_TOKEN_ADDRESS,
  bondTokenAddress,
};
