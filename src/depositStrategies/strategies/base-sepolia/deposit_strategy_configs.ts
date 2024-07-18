export const baseSepoliaStrategyConfigs = [
  {
    id: '5b4b4a92-f6b1-4b66-8d95-f3e981c35879',
    isSingleStepWithdraw: true,
    protocolType: 'beefy',
    accountType: 'aa',
    chainId: 84532,
    name: 'Beefy USDC',
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Beefy',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7311.png',
    bondTokenAddress: '0x9418efe858e69872a09a33a436c82fde58d41113',
    beefyVaultId: 'compound-base-usdc',
    permissions: [
      {
        target: '0x9418efe858e69872a09a33a436c82fde58d41113',
        functionName: 'deposit',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      },
      {
        target: '0x9418efe858e69872a09a33a436c82fde58d41113',
        functionName: 'withdraw',
        valueLimit: '0x0',
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              {
                internalType: 'uint256',
                name: '_shares',
                type: 'uint256',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
      },
      {
        target: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
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
            value: '0x9418efe858e69872a09a33a436c82fde58d41113',
          },
        ],
      },
    ],
  },
  {
    id: '890ff406-72b8-4e82-b6e1-892ecaa01a4f',
    isSingleStepWithdraw: true,
    protocolType: 'beefy',
    accountType: 'eoa',
    chainId: 84532,
    name: 'Beefy USDC',
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Beefy',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7311.png',
    bondTokenAddress: '0x9418efe858e69872a09a33a436c82fde58d41113',
    beefyVaultId: 'compound-base-usdc',
    permissions: [
      {
        target: '0x9418efe858e69872a09a33a436c82fde58d41113',
        functionName: 'deposit',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      },
      {
        target: '0x9418efe858e69872a09a33a436c82fde58d41113',
        functionName: 'withdraw',
        valueLimit: '0x0',
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              {
                internalType: 'uint256',
                name: '_shares',
                type: 'uint256',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
      },
      {
        target: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
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
            value: '0x9418efe858e69872a09a33a436c82fde58d41113',
          },
        ],
      },
      {
        target: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
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
        target: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
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
      {
        target: '0x9418efe858e69872a09a33a436c82fde58d41113',
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
        target: '0x9418efe858e69872a09a33a436c82fde58d41113',
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
