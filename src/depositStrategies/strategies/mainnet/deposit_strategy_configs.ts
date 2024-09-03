export const mainnetStrategyConfigs = [
  {
    id: 'c38d9a08-a0de-4866-bf16-e433a03848ff',
    isSingleStepWithdraw: false,
    protocolType: 'veda',
    accountType: 'aa',
    chainId: 1,
    name: 'Ether.fi King Karak LRT',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenName: 'WETH',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/2396.png',
    protocolName: 'Ether.fi',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/29814.png',
    bondTokenAddress: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
    tellerAddress: '0x929B44db23740E65dF3A81eA4aAB716af1b88474',
    accountantAddress: '0x126af21dc55C300B7D0bBfC4F3898F558aE8156b',
    atomicQueueAddress: '0xd45884b592e316eb816199615a95c182f75dea07',
    permissions: [
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
          },
        ],
      },
      {
        target: '0x929B44db23740E65dF3A81eA4aAB716af1b88474',
        functionName: 'deposit',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                name: 'depositAsset',
                type: 'address',
              },
              {
                name: 'depositAmount',
                type: 'uint256',
              },
              {
                name: 'minimumMint',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [
              {
                name: 'shares',
                type: 'uint256',
              },
            ],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          },
        ],
      },
      {
        target: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xd45884b592e316eb816199615a95c182f75dea07',
          },
        ],
      },
      {
        target: '0xd45884b592e316eb816199615a95c182f75dea07',
        functionName: 'updateAtomicRequest',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'contract ERC20',
                name: 'offer',
                type: 'address',
              },
              {
                internalType: 'contract ERC20',
                name: 'want',
                type: 'address',
              },
              {
                components: [
                  {
                    internalType: 'uint64',
                    name: 'deadline',
                    type: 'uint64',
                  },
                  {
                    internalType: 'uint88',
                    name: 'atomicPrice',
                    type: 'uint88',
                  },
                  {
                    internalType: 'uint96',
                    name: 'offerAmount',
                    type: 'uint96',
                  },
                  {
                    internalType: 'bool',
                    name: 'inSolve',
                    type: 'bool',
                  },
                ],
                internalType: 'struct AtomicQueue.AtomicRequest',
                name: 'userRequest',
                type: 'tuple',
              },
            ],
            name: 'updateAtomicRequest',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
          },
          {
            operator: 0,
            value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          },
        ],
      },
    ],
  },
  {
    id: 'c1d136de-ee0c-4652-9708-836939241d3a',
    isSingleStepWithdraw: false,
    protocolType: 'veda',
    accountType: 'eoa',
    chainId: 1,
    name: 'Ether.fi King Karak LRT',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenName: 'WETH',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/2396.png',
    protocolName: 'Ether.fi',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/29814.png',
    bondTokenAddress: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
    tellerAddress: '0x929B44db23740E65dF3A81eA4aAB716af1b88474',
    accountantAddress: '0x126af21dc55C300B7D0bBfC4F3898F558aE8156b',
    atomicQueueAddress: '0xd45884b592e316eb816199615a95c182f75dea07',
    permissions: [
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
          },
        ],
      },
      {
        target: '0x929B44db23740E65dF3A81eA4aAB716af1b88474',
        functionName: 'deposit',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                name: 'depositAsset',
                type: 'address',
              },
              {
                name: 'depositAmount',
                type: 'uint256',
              },
              {
                name: 'minimumMint',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [
              {
                name: 'shares',
                type: 'uint256',
              },
            ],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          },
        ],
      },
      {
        target: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xd45884b592e316eb816199615a95c182f75dea07',
          },
        ],
      },
      {
        target: '0xd45884b592e316eb816199615a95c182f75dea07',
        functionName: 'updateAtomicRequest',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'contract ERC20',
                name: 'offer',
                type: 'address',
              },
              {
                internalType: 'contract ERC20',
                name: 'want',
                type: 'address',
              },
              {
                components: [
                  {
                    internalType: 'uint64',
                    name: 'deadline',
                    type: 'uint64',
                  },
                  {
                    internalType: 'uint88',
                    name: 'atomicPrice',
                    type: 'uint88',
                  },
                  {
                    internalType: 'uint96',
                    name: 'offerAmount',
                    type: 'uint96',
                  },
                  {
                    internalType: 'bool',
                    name: 'inSolve',
                    type: 'bool',
                  },
                ],
                internalType: 'struct AtomicQueue.AtomicRequest',
                name: 'userRequest',
                type: 'tuple',
              },
            ],
            name: 'updateAtomicRequest',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
          },
          {
            operator: 0,
            value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          },
        ],
      },
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'transferFrom',
        valueLimit: 0n,
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
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'transfer',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
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
            name: 'transfer',
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
        ],
      },
    ],
  },
  {
    id: '5155d89f-98c3-436b-bd87-d8fef022620a',
    isSingleStepWithdraw: false,
    protocolType: 'mellow',
    accountType: 'aa',
    chainId: 1,
    name: 'Mellow Renzo Restaked LST',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenName: 'WETH',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/2396.png',
    protocolName: 'Mellow',
    protocolImageURL: 'https://avatars.githubusercontent.com/u/83597631?s=200',
    bondTokenAddress: '0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811',
    depositWrapperAddress: '0x897642a9DbE1dD82AcFdB90D1f22F75B66a765bA',
    collectorAddress: '0x317554dC885FbeFfC77D8fA753cCd5a45890863b',
    permissions: [
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x897642a9DbE1dD82AcFdB90D1f22F75B66a765bA',
          },
        ],
      },
      {
        target: '0x897642a9DbE1dD82AcFdB90D1f22F75B66a765bA',
        functionName: 'deposit',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'minLpAmount',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [
              {
                internalType: 'uint256',
                name: 'lpAmount',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
          {
            operator: 0,
            value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          },
        ],
      },
      {
        target: '0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811',
        functionName: 'registerWithdrawal',
        valueLimit: 0n,
        abi: [
          {
            name: 'registerWithdrawal',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'to',
              },
              {
                type: 'uint256',
                name: 'lpAmount',
              },
              {
                type: 'uint256[]',
                name: 'minAmounts',
              },
              {
                type: 'uint256',
                name: 'deadline',
              },
              {
                type: 'uint256',
                name: 'requestDeadline',
              },
              {
                type: 'bool',
                name: 'closePrevious',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
        ],
      },
      {
        target: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
          },
        ],
      },
      {
        target: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
        functionName: 'requestWithdrawalsWstETH',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256[]',
                name: '_amounts',
                type: 'uint256[]',
              },
              {
                internalType: 'address',
                name: '_owner',
                type: 'address',
              },
            ],
            name: 'requestWithdrawalsWstETH',
            outputs: [
              {
                internalType: 'uint256[]',
                name: 'requestIds',
                type: 'uint256[]',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [],
      },
      {
        target: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
        functionName: 'claimWithdrawal',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_requestId',
                type: 'uint256',
              },
            ],
            name: 'claimWithdrawal',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [],
      },
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'deposit',
        valueLimit: 9999999999999999999999999999999999999n,
        abi: [
          {
            inputs: [],
            name: 'deposit',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        args: [],
      },
    ],
  },
  {
    id: 'a4be0324-c93c-4525-a0d1-48c6f9f1bb49',
    isSingleStepWithdraw: false,
    protocolType: 'mellow',
    accountType: 'eoa',
    chainId: 1,
    name: 'Mellow Renzo Restaked LST',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenName: 'WETH',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/2396.png',
    protocolName: 'Mellow',
    protocolImageURL: 'https://avatars.githubusercontent.com/u/83597631?s=200',
    bondTokenAddress: '0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811',
    depositWrapperAddress: '0x897642a9DbE1dD82AcFdB90D1f22F75B66a765bA',
    collectorAddress: '0x317554dC885FbeFfC77D8fA753cCd5a45890863b',
    permissions: [
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x897642a9DbE1dD82AcFdB90D1f22F75B66a765bA',
          },
        ],
      },
      {
        target: '0x897642a9DbE1dD82AcFdB90D1f22F75B66a765bA',
        functionName: 'deposit',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'minLpAmount',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [
              {
                internalType: 'uint256',
                name: 'lpAmount',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
          {
            operator: 0,
            value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          },
        ],
      },
      {
        target: '0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811',
        functionName: 'registerWithdrawal',
        valueLimit: 0n,
        abi: [
          {
            name: 'registerWithdrawal',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'to',
              },
              {
                type: 'uint256',
                name: 'lpAmount',
              },
              {
                type: 'uint256[]',
                name: 'minAmounts',
              },
              {
                type: 'uint256',
                name: 'deadline',
              },
              {
                type: 'uint256',
                name: 'requestDeadline',
              },
              {
                type: 'bool',
                name: 'closePrevious',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
        ],
      },
      {
        target: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
          },
        ],
      },
      {
        target: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
        functionName: 'requestWithdrawalsWstETH',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256[]',
                name: '_amounts',
                type: 'uint256[]',
              },
              {
                internalType: 'address',
                name: '_owner',
                type: 'address',
              },
            ],
            name: 'requestWithdrawalsWstETH',
            outputs: [
              {
                internalType: 'uint256[]',
                name: 'requestIds',
                type: 'uint256[]',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [],
      },
      {
        target: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
        functionName: 'claimWithdrawal',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_requestId',
                type: 'uint256',
              },
            ],
            name: 'claimWithdrawal',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [],
      },
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'deposit',
        valueLimit: 9999999999999999999999999999999999999n,
        abi: [
          {
            inputs: [],
            name: 'deposit',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        args: [],
      },
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'transferFrom',
        valueLimit: 0n,
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
      {
        target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        functionName: 'transfer',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
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
            name: 'transfer',
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
        ],
      },
    ],
  },
  {
    id: '019144f5-9401-7be9-8999-ec510d6d59a3',
    chainId: 1,

    isSingleStepWithdraw: false,
    accountType: 'eoa',
    name: 'Pendle USDC', // TODO: @merlin check

    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',

    protocolType: 'pendle', // TODO: @merlin check
    protocolName: 'Pendle', // TODO: @merlin check
    protocolImageURL: 'https://cryptologos.cc/logos/pendle-pendle-logo.png',

    bondTokenAddress: '0x73a15fed60bf67631dc6cd7bc5b6e8da8190acf5', // USDO
    permissions: [], // TODO: @merlin check
  },
  {
    id: '3693460d-87fa-4c0a-afdc-67cf3ae63041',
    chainId: 1,

    isSingleStepWithdraw: true,
    accountType: 'eoa',
    name: 'Fuel SolvBTC.BBN',

    tokenAddress: '0xd9d920aa40f578ab794426f5c90f6c731d159def', // SolvBTC.BBN
    tokenName: 'SolvBTC.BBN',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/1.png',

    protocolType: 'fuel',
    protocolName: 'Fuel',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/24087.png',

    bondTokenAddress: null, // Fuel does not issue any bond token as a result of deposit

    vaultAddress: '0x19b5cc75846BF6286d599ec116536a333C4C2c14',

    permissions: [
      {
        target: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
        functionName: 'transferFrom',
        valueLimit: 0n,
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
      {
        target: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x19b5cc75846BF6286d599ec116536a333C4C2c14',
          },
        ],
      },
      {
        target: '0x19b5cc75846BF6286d599ec116536a333C4C2c14',
        functionName: 'deposit',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint240',
                name: 'amount',
                type: 'uint240',
              },
              {
                internalType: 'uint16',
                name: 'depositParam',
                type: 'uint16',
              },
            ],
            name: 'deposit',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
          },
        ],
      },
    ],
  },
  {
    id: '00c0b60b-8ec6-4c2d-ad08-9457010121a8',
    chainId: 1,

    isSingleStepWithdraw: true,
    accountType: 'eoa',
    name: 'Mezo SolvBTC.BBN',

    tokenAddress: '0xd9d920aa40f578ab794426f5c90f6c731d159def', // SolvBTC.BBN
    tokenName: 'SolvBTC.BBN',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/1.png',

    protocolType: 'mezo',
    protocolName: 'Mezo',
    protocolImageURL: 'https://img.cryptorank.io/coins/mezo1712665386292.png',

    bondTokenAddress: null, // There are no bond token

    vaultAddress: '0xab13b8eecf5aa2460841d75da5d5d861fd5b8a39',

    permissions: [
      {
        target: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
        functionName: 'transferFrom',
        valueLimit: 0n,
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
      {
        target: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xab13b8eecf5aa2460841d75da5d5d861fd5b8a39',
          },
        ],
      },
      {
        target: '0xab13b8eecf5aa2460841d75da5d5d861fd5b8a39',
        functionName: 'deposit',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint96',
                name: 'amount',
                type: 'uint96',
              },
              {
                internalType: 'uint32',
                name: 'lockPeriod',
                type: 'uint32',
              },
            ],
            name: 'deposit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
          },
        ],
      },
    ],
  },
  {
    id: '0191a35a-888c-7b58-b477-1eb687251cf8',
    chainId: 1,

    isSingleStepWithdraw: false,
    accountType: 'eoa',
    name: 'SolvBTC',

    tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
    tokenName: 'WBTC',
    tokenImageURL: 'https://etherscan.io/token/images/wbtc_28.png?v=1',

    protocolType: 'solv',
    protocolName: 'Solv',
    protocolImageURL:
      'data:image/jpeg;base64,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',

    // WBTC -> SolvBTC
    // '0xd9d920aa40f578ab794426f5c90f6c731d159def'// SolvBTC.BBN
    bondTokenAddress: '0x7A56E1C57C7475CCf742a1832B028F0456652F97', // SolvBTC
    routerAddress: '0x1fF7d7C0A7D8E94046708C611DeC5056A9d2B823',
    poolId: '0x716db7dc196abe78d5349c7166896f674ab978af26ada3e5b3ea74c5a1b48307',

    permissions: [
      {
        target: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        functionName: 'transferFrom',
        valueLimit: 0n,
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
      {
        target: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x1fF7d7C0A7D8E94046708C611DeC5056A9d2B823',
          },
        ],
      },
      {
        target: '0x1fF7d7C0A7D8E94046708C611DeC5056A9d2B823',
        functionName: 'createSubscription',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'bytes32',
                name: 'poolId_',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'currencyAmount_',
                type: 'uint256',
              },
            ],
            name: 'createSubscription',
            outputs: [
              {
                internalType: 'uint256',
                name: 'shareValue_',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x716db7dc196abe78d5349c7166896f674ab978af26ada3e5b3ea74c5a1b48307',
          },
        ],
      },
    ],
  },
  {
    id: 'c0d17a3f-4c4f-443d-b3b4-3df5f3ab00d7',
    chainId: 1,

    isSingleStepWithdraw: false,
    accountType: 'eoa',
    name: 'SolvBTC.BBN',

    tokenAddress: '0x7A56E1C57C7475CCf742a1832B028F0456652F97', // SolvBTC
    tokenName: 'SolvBTC',
    tokenImageURL: 'https://etherscan.io/token/images/wbtc_28.png?v=1',

    protocolType: 'solv',
    protocolName: 'Solv',
    protocolImageURL:
      'data:image/jpeg;base64,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',

    // SolvBTC -> SolvBTC.BBN
    bondTokenAddress: '0xd9d920aa40f578ab794426f5c90f6c731d159def',
    routerAddress: '0x01024AaeD5561fa6237C0ad4073417576C591261',
    poolId: '0xefcca1eb946cdc7b56509489a56b45b75aff74b8bb84dad5b893012157e0df93',

    permissions: [
      {
        target: '0x7A56E1C57C7475CCf742a1832B028F0456652F97',
        functionName: 'transferFrom',
        valueLimit: 0n,
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
      {
        target: '0x7A56E1C57C7475CCf742a1832B028F0456652F97',
        functionName: 'approve',
        valueLimit: 0n,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'spender',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'bool',
              },
            ],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x01024AaeD5561fa6237C0ad4073417576C591261',
          },
        ],
      },
      {
        target: '0x01024AaeD5561fa6237C0ad4073417576C591261',
        functionName: 'createSubscription',
        valueLimit: 0n,
        abi: [
          {
            inputs: [
              {
                internalType: 'bytes32',
                name: 'poolId_',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'currencyAmount_',
                type: 'uint256',
              },
            ],
            name: 'createSubscription',
            outputs: [
              {
                internalType: 'uint256',
                name: 'shareValue_',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0xefcca1eb946cdc7b56509489a56b45b75aff74b8bb84dad5b893012157e0df93',
          },
        ],
      },
    ],
  },
] as const;
