import { bsc } from "viem/chains";
import type { Abi, Address } from "viem";

import { nativeTokenAddress } from "../shared/nativeTokenAddress";

import type { DepositStrategy } from "./DepositStrategy";
import nativeBeefyAbi from "./abis/beefy/native.json";

export function getSupportedDepositStrategies(): DepositStrategy[] {
  const bondTokenAddress: Address =
    "0x6BE4741AB0aD233e4315a10bc783a7B923386b71";

  return [
    {
      // TODO: @merlin use hash here
      id: "1",
      permissions: [
        {
          target: bondTokenAddress,
          valueLimit: BigInt(
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          ),
          // TODO: @merlin not sure how to deal here
          abi: nativeBeefyAbi as Abi,
          functionName: "depositBNB",
        },
        {
          target: bondTokenAddress,
          valueLimit: BigInt(0),
          abi: nativeBeefyAbi as Abi,
          functionName: "withdrawBNB",
        },
      ],
      chain: bsc,
      tokenAddress: nativeTokenAddress,
      bondTokenAddress,
    },
  ];
}
