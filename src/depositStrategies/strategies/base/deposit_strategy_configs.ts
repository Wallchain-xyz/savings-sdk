export const baseStrategyConfigs = [
  {
    id: '018ecbc3-597e-739c-bfac-80d534743e3e',
    protocolType: 'beefy',
    accountType: 'aa',
    chainId: 8453,
    name: 'Beefy ETH',
    tokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    tokenName: 'ETH',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/1027.png',
    protocolName: 'Beefy',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7311.png',
    bondTokenAddress: '0x62e5B9934dCB87618CFC74B222305D16C997E8c1',
    beefyVaultId: 'compound-base-eth',
    permissions: [
      {
        target: '0x62e5B9934dCB87618CFC74B222305D16C997E8c1',
        functionName: 'depositBNB',
        valueLimit: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        abi: [
          {
            inputs: [],
            name: 'depositBNB',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
      },
      {
        target: '0x62e5B9934dCB87618CFC74B222305D16C997E8c1',
        functionName: 'withdrawBNB',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: '_shares',
                type: 'uint256',
              },
            ],
            name: 'withdrawBNB',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      },
    ],
  },
  {
    id: '018f04e0-73d5-77be-baec-c76bac26b4f3',
    protocolType: 'beefy',
    accountType: 'aa',
    chainId: 8453,
    name: 'Beefy USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Beefy',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7311.png',
    bondTokenAddress: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
    beefyVaultId: 'compound-base-usdc',
    permissions: [
      {
        target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
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
        target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
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
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
          },
        ],
      },
    ],
  },
  {
    id: '018f94ed-f3b8-7dd5-8615-5b07650f5772',
    protocolType: 'beefy',
    accountType: 'eoa',
    chainId: 8453,
    name: 'Beefy USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Beefy',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7311.png',
    bondTokenAddress: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
    beefyVaultId: 'compound-base-usdc',
    permissions: [
      {
        target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
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
        target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
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
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
        target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
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
        target: '0xeF6ED674486E54507d0f711C0d388BD8a1552E6F',
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
  {
    id: '856a815e-dc16-41a0-84c8-1a94dd7f763b',
    protocolType: 'moonwell',
    accountType: 'aa',
    chainId: 8453,
    name: 'Moonwell USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Moonwell',
    protocolImageURL: 'https://y.wallchains.com/static/protocols/Moonwell.png',
    bondTokenAddress: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
    defiLlamaPoolId: '69cf831d-624a-4f23-b5e3-c0f63ad1fa01',
    permissions: [
      {
        target: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
        functionName: 'mint',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: 'mintAmount',
                type: 'uint256',
              },
            ],
            name: 'mint',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      },
      {
        target: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
        functionName: 'redeem',
        valueLimit: '0x0',
        abi: [
          {
            name: 'redeem',
            type: 'function',
            inputs: [
              {
                internalType: 'uint256',
                name: 'redeemTokens',
                type: 'uint256',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
          },
        ],
      },
    ],
  },
  {
    id: '2935fab9-23be-41d0-b58c-9fa46a12078f',
    protocolType: 'moonwell',
    accountType: 'eoa',
    chainId: 8453,
    name: 'Moonwell USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Moonwell',
    protocolImageURL: 'https://y.wallchains.com/static/protocols/Moonwell.png',
    bondTokenAddress: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
    defiLlamaPoolId: '69cf831d-624a-4f23-b5e3-c0f63ad1fa01',
    permissions: [
      {
        target: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
        functionName: 'mint',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'uint256',
                name: 'mintAmount',
                type: 'uint256',
              },
            ],
            name: 'mint',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
      },
      {
        target: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
        functionName: 'redeem',
        valueLimit: '0x0',
        abi: [
          {
            name: 'redeem',
            type: 'function',
            inputs: [
              {
                internalType: 'uint256',
                name: 'redeemTokens',
                type: 'uint256',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
  {
    id: '484b91e5-7d5c-4476-b512-45a0a0e4a199',
    protocolType: 'aaveV3',
    accountType: 'aa',
    chainId: 8453,
    name: 'AAVE V3 USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'AAVE',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7278.png',
    bondTokenAddress: '0x4e65fe4dba92790696d040ac24aa414708f5c0ab',
    poolAddress: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
    defiLlamaPoolId: '7e0661bf-8cf3-45e6-9424-31916d4c7b84',
    permissions: [
      {
        target: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
        functionName: 'supply',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'referralCode',
                type: 'uint16',
              },
            ],
            name: 'supply',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
          {
            operator: 1,
            value: 0,
          },
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
        ],
      },
      {
        target: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
        functionName: 'withdraw',
        valueLimit: '0x0',
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
          },
        ],
      },
    ],
  },
  {
    id: '1af624b4-5a99-42c8-a560-5966b956f2cf',
    protocolType: 'aaveV3',
    accountType: 'eoa',
    chainId: 8453,
    name: 'AAVE V3 USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'AAVE',
    protocolImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7278.png',
    bondTokenAddress: '0x4e65fe4dba92790696d040ac24aa414708f5c0ab',
    poolAddress: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
    defiLlamaPoolId: '7e0661bf-8cf3-45e6-9424-31916d4c7b84',
    permissions: [
      {
        target: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
        functionName: 'supply',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'referralCode',
                type: 'uint16',
              },
            ],
            name: 'supply',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
          {
            operator: 1,
            value: 0,
          },
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
        ],
      },
      {
        target: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
        functionName: 'withdraw',
        valueLimit: '0x0',
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
  {
    id: '8a8bce36-7e99-438e-ab03-cd6064b91072',
    protocolType: 'aaveV3',
    accountType: 'aa',
    chainId: 8453,
    name: 'Seamless V3 USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Seamless',
    protocolImageURL: 'https://y.wallchains.com/static/protocols/Seamless.png',
    bondTokenAddress: '0x53e240c0f985175da046a62f26d490d1e259036e',
    poolAddress: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
    defiLlamaPoolId: '1fe6614c-f384-401d-8a63-e696e13c808c',
    permissions: [
      {
        target: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
        functionName: 'supply',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'referralCode',
                type: 'uint16',
              },
            ],
            name: 'supply',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
          {
            operator: 1,
            value: 0,
          },
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        functionName: 'withdraw',
        valueLimit: '0x0',
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
        ],
      },
    ],
  },
  {
    id: '5c76265d-0ad1-4829-abc7-9f282cbae198',
    protocolType: 'aaveV3',
    accountType: 'eoa',
    chainId: 8453,
    name: 'Seamless V3 USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    tokenImageURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
    protocolName: 'Seamless',
    protocolImageURL: 'https://y.wallchains.com/static/protocols/Seamless.png',
    bondTokenAddress: '0x53e240c0f985175da046a62f26d490d1e259036e',
    poolAddress: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
    defiLlamaPoolId: '1fe6614c-f384-401d-8a63-e696e13c808c',
    permissions: [
      {
        target: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
        functionName: 'supply',
        valueLimit: '0x0',
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: 'referralCode',
                type: 'uint16',
              },
            ],
            name: 'supply',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
          {
            operator: 1,
            value: 0,
          },
          {
            operator: 0,
            value: '{{aaAddress}}',
          },
        ],
      },
      {
        target: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
        functionName: 'withdraw',
        valueLimit: '0x0',
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              {
                internalType: 'address',
                name: 'asset',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        args: [
          {
            operator: 0,
            value: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
            value: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
          },
        ],
      },
      {
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
        target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
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
