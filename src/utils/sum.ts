export function sumBigInts(items?: bigint[]) {
  return items?.reduce((acc, balance) => acc + balance, BigInt(0)) ?? BigInt(0);
}
