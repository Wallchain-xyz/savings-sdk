import { Address, encodeFunctionData, parseAbi } from 'viem';

export const ERC20_TRANSFER_FUNCTION_NAME = 'transfer';

interface ERC20TransferParams {
  token: Address;
  value: bigint;
  to: Address;
}

export function createERC20TransferTxn({ token, value, to }: ERC20TransferParams) {
  return {
    data: encodeFunctionData({
      functionName: ERC20_TRANSFER_FUNCTION_NAME,
      abi: parseAbi(['function transfer(address to, uint256 value) external returns (bool)']),
      args: [to, value],
    }),
    value: BigInt(0),
    to: token,
  };
}
