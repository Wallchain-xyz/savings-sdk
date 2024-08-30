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

    bondTokenAddress: null, // There are no bond token

    vaultAddress: '0x19b5cc75846BF6286d599ec116536a333C4C2c14',

    permissions: [
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
] as const;
