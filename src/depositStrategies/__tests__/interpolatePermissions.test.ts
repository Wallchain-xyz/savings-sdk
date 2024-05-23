import { Txn } from '../../AAProviders/types';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategy,
  DepositStrategyConfig,
  DepositStrategyType,
} from '../DepositStrategy';

class FakeStrategy extends DepositStrategy {
  isEOA: boolean;

  constructor(data: DepositStrategyConfig) {
    super(data);
    this.isEOA = false;
  }

  createDepositTxns(_: CreateDepositTxnsParams): Promise<Txn[]> {
    throw new Error('Method not implemented.');
  }

  createWithdrawTxns(_: CreateWithdrawTxnsParams): Promise<Txn[]> {
    throw new Error('Method not implemented.');
  }

  bondTokenAmountToTokenAmount(_: bigint): Promise<bigint> {
    throw new Error('Method not implemented.');
  }

  tokenAmountToBondTokenAmount(_: bigint): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
}

describe('interpolatePermissions', () => {
  it('should replace eoaAddress and aaAddress', () => {
    const strategy = new FakeStrategy({
      id: '123',
      type: DepositStrategyType.beefyAA,
      tokenAddress: '0x11',
      bondTokenAddress: '0x11',
      chainId: 1,
      permissions: [
        {
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
        },
      ],
    });

    const interpolated = strategy.getPermissions({
      eoaAddress: '0x0',
      aaAddress: '0x1',
    })[0];

    expect(interpolated.args?.[0]?.value).toBe('0x0');
    expect(interpolated.args?.[1]?.value).toBe('0x1');
  });
});
