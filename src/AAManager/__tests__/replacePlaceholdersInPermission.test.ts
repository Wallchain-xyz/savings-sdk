import { Permission } from '@zerodev/session-key';
import { Abi } from 'viem';

import { AAManager } from '../AAManager';

describe('replacePlaceholdersInPermission', () => {
  const permission = {
    target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
    functionName: 'transferFrom',
    valueLimit: BigInt(0),
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
        ],
        name: 'transferFrom',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    args: [
      {
        operator: 0,
        value: '{{eoaAddress}}',
      },
      {
        operator: 0,
        value: '{{aaAddress}}',
      },
    ],
  };

  it('should replace params if provided', () => {
    const interpolated = AAManager.replacePlaceholdersInPermission(
      // TODO: @merlin not sure what is the issue with typing here
      permission as unknown as Permission<Abi, string>,
      {
        eoaAddress: '0x0',
        aaAddress: '0x1',
      },
    );

    expect(interpolated.args?.[0]?.value).toBe('0x0');
    expect(interpolated.args?.[1]?.value).toBe('0x1');
  });

  it('should throw  if param is not provided', async () => {
    expect(
      AAManager.replacePlaceholdersInPermission(
        // TODO: @merlin not sure what is the issue with typing here
        permission as unknown as Permission<Abi, string>,
        {
          eoaAddress: '0x0',
        },
      ),
    ).toThrow();
  });
});
