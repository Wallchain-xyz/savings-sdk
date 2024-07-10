import { parseAbi } from 'viem';

export const erc20ABI = parseAbi([
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address src, address dst, uint wad) public returns (bool)',
  'function transfer(address to, uint256 value) external returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() public view returns (uint8)',
]);
