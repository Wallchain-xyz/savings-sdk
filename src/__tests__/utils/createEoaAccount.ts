// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export function createEoaAccount(privateKey?: Hex) {
  return privateKeyToAccount(privateKey ?? (faker.string.hexadecimal({ length: 64 }) as Hex));
}
