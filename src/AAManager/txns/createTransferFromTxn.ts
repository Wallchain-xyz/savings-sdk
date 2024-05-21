import { Address, encodeFunctionData, parseAbi } from 'viem';

export const TRANSFER_FROM_FUNCTION_NAME = 'transferFrom';

interface TransferFromParams {
  token: Address;
  value: bigint;
  to: Address;
  from: Address;
}

export function createTransferFromTxn({ token, from, value, to }: TransferFromParams) {
  return {
    data: encodeFunctionData({
      functionName: TRANSFER_FROM_FUNCTION_NAME,
      abi: parseAbi(['function transferFrom(address from, address to, uint256 value) external returns (bool)']),
      args: [from, to, value],
    }),
    value: BigInt(0),
    to: token,
  };
}
