import { Abi, Address } from 'viem';

export enum PermissionArgOperator {
  EQUAL = 0,
  GREATER_THAN = 1,
  LESS_THAN = 2,
  GREATER_THAN_OR_EQUAL = 3,
  LESS_THAN_OR_EQUAL = 4,
  NOT_EQUAL = 5,
}

interface PermissionArgRule {
  operator: PermissionArgOperator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface Permission {
  target: Address;
  functionName: string;
  valueLimit: bigint;
  abi: Abi;
  args: (PermissionArgRule | null)[]; // Null used to skip arguments
}
