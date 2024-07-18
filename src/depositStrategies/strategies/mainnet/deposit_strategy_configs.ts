export const mainnetStrategyConfigs = [
  {
    id: 'c38d9a08-a0de-4866-bf16-e433a03848ff',
    isSingleStepWithdraw: false,
    protocolType: 'veda',
    accountType: 'aa',
    chainId: 8453,
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
    chainId: 8453,
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
        valueLimit: '0x0',
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
] as const;
