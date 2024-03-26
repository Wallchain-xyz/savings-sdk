// TODO: @merlin lots of these types and schemes are not needed, but
// they will be removed once we move to microservices and have
// separate API for SDK - it will have it's own
// openapi scheme which we will use to generate this client
/* eslint-disable @typescript-eslint/naming-convention */
import { Zodios, type ZodiosOptions } from '@zodios/core';

import { zod as z } from './zod';

import type { TypeOf } from './zod';

const UserKeyType = z.enum(['web3auth', 'wallet', 'account_abstraction']);

const UserKeyTypeSchema = UserKeyType;
type UserKeyType = TypeOf<typeof UserKeyTypeSchema>;

const SignInData = z
  .object({
    userId: z.number().int(),
    email: z.string(),
    address: z.address(),
    aaSignerAddress: z.union([z.string(), z.null()]).optional(),
    keyType: UserKeyType.optional().default('web3auth'),
  })
  .passthrough();

const SignInDataSchema = SignInData;
type SignInData = TypeOf<typeof SignInDataSchema>;

const NetworkEnum = z.union([z.literal(1), z.literal(56), z.literal(8453), z.literal(42161)]);

const NetworkEnumSchema = NetworkEnum;
type NetworkEnum = TypeOf<typeof NetworkEnumSchema>;

const chainId = z.union([NetworkEnum, z.null()]).optional();

const chainIdSchema = chainId;
type chainId = TypeOf<typeof chainIdSchema>;

const ValidationError = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
  })
  .passthrough();

const ValidationErrorSchema = ValidationError;
type ValidationError = TypeOf<typeof ValidationErrorSchema>;

const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();

const HTTPValidationErrorSchema = HTTPValidationError;
type HTTPValidationError = TypeOf<typeof HTTPValidationErrorSchema>;

const APIUserInfo = z
  .object({
    id: z.number().int(),
    email: z.string(),
    firstName: z.union([z.string(), z.null()]),
    lastName: z.union([z.string(), z.null()]),
    photoUrl: z.union([z.string(), z.null()]),
    telegramUsername: z.union([z.string(), z.null()]),
    address: z.address(),
    chain: NetworkEnum,
    keyType: UserKeyType,
  })
  .passthrough();

const APIUserInfoSchema = APIUserInfo;
type APIUserInfo = TypeOf<typeof APIUserInfoSchema>;

const ChatFlow = z.enum(['main', 'buy', 'sell', 'balance', 'transfer']);

const ChatFlowSchema = ChatFlow;
type ChatFlow = TypeOf<typeof ChatFlowSchema>;

const NavigateChatData = z.object({ flow: ChatFlow }).passthrough();

const NavigateChatDataSchema = NavigateChatData;
type NavigateChatData = TypeOf<typeof NavigateChatDataSchema>;

const SetChainData = z.object({ chainId: NetworkEnum }).passthrough();

const SetChainDataSchema = SetChainData;
type SetChainData = TypeOf<typeof SetChainDataSchema>;

const TokenBalanceInfo = z
  .object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.number().int(),
    usdPrice: z.union([z.number(), z.null()]),
    priceChange24HPercent: z.union([z.number(), z.null()]),
    iconUrl: z.union([z.string(), z.null()]),
    balance: z.string(),
    balanceNormalized: z.number(),
    balanceUsd: z.union([z.number(), z.null()]),
    addr: z.address(),
  })
  .passthrough();

const TokenBalanceInfoSchema = TokenBalanceInfo;
type TokenBalanceInfo = TypeOf<typeof TokenBalanceInfoSchema>;

const DetailError = z.object({ detail: z.string() }).passthrough();

const DetailErrorSchema = DetailError;
type DetailError = TypeOf<typeof DetailErrorSchema>;

const NativeBalanceInfo = z
  .object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.number().int(),
    usdPrice: z.union([z.number(), z.null()]),
    priceChange24HPercent: z.union([z.number(), z.null()]),
    iconUrl: z.union([z.string(), z.null()]),
    balance: z.string(),
    balanceNormalized: z.number(),
    balanceUsd: z.union([z.number(), z.null()]),
  })
  .passthrough();

const NativeBalanceInfoSchema = NativeBalanceInfo;
type NativeBalanceInfo = TypeOf<typeof NativeBalanceInfoSchema>;

const APIPointsInfo = z.object({ points: z.number().int() }).passthrough();

const APIPointsInfoSchema = APIPointsInfo;
type APIPointsInfo = TypeOf<typeof APIPointsInfoSchema>;

const SetupSwapData = z
  .object({
    tokenIn: z.address(),
    tokenOut: z.address(),
    amountIn: z.union([z.string(), z.null()]).optional(),
    amountInUsd: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();

const SetupSwapDataSchema = SetupSwapData;
type SetupSwapData = TypeOf<typeof SetupSwapDataSchema>;

const TxnStatus = z.enum(['SUCCESS', 'FAIL', 'PENDING', 'UNSENT']);

const TxnStatusSchema = TxnStatus;
type TxnStatus = TypeOf<typeof TxnStatusSchema>;

const TxnSubmissionType = z.enum(['web3_rpc', 'aa_bundler']);

const TxnSubmissionTypeSchema = TxnSubmissionType;
type TxnSubmissionType = TypeOf<typeof TxnSubmissionTypeSchema>;

const APITXNData = z
  .object({
    from: z.address(),
    to: z.address(),
    value: z.positiveHexString(),
    data: z.positiveHexString(),
  })
  .passthrough();

const APITXNDataSchema = APITXNData;
type APITXNData = TypeOf<typeof APITXNDataSchema>;

const APISwapInfo = z
  .object({
    approveContract: z.address(),
    amountIn: z.positiveHexString(),
    amountInNormalized: z.number(),
    amountOut: z.positiveHexString(),
    amountOutNormalized: z.number(),
    rate: z.number(),
  })
  .passthrough();

const APISwapInfoSchema = APISwapInfo;
type APISwapInfo = TypeOf<typeof APISwapInfoSchema>;

const APITokenInfo = z
  .object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.number().int(),
    iconUrl: z.union([z.string(), z.null()]),
    nativeWrapper: z.boolean(),
    listedOnDex: z.boolean(),
  })
  .passthrough();

const APITokenInfoSchema = APITokenInfo;
type APITokenInfo = TypeOf<typeof APITokenInfoSchema>;

const APITokenPrice = z
  .object({
    usdPrice: z.number(),
    change24HPercent: z.union([z.number(), z.null()]),
  })
  .passthrough();

const APITokenPriceSchema = APITokenPrice;
type APITokenPrice = TypeOf<typeof APITokenPriceSchema>;

const APIToken = z
  .object({
    type: z.literal('erc20'),
    addr: z.address(),
    info: APITokenInfo,
    price: z.union([APITokenPrice, z.null()]),
  })
  .passthrough();

const APITokenSchema = APIToken;
type APIToken = TypeOf<typeof APITokenSchema>;

const APINativeToken = z
  .object({
    type: z.literal('native'),
    addr: z.address(),
    info: APITokenInfo,
    price: z.union([APITokenPrice, z.null()]),
  })
  .passthrough();

const APINativeTokenSchema = APINativeToken;
type APINativeToken = TypeOf<typeof APINativeTokenSchema>;

const APIBalance = z
  .object({
    amount: z.positiveHexString(),
    amountNormalized: z.number(),
    amountUsd: z.union([z.number(), z.null()]),
  })
  .passthrough();

const APIBalanceSchema = APIBalance;
type APIBalance = TypeOf<typeof APIBalanceSchema>;

const APIGasData = z
  .object({
    suggested: z.number().int(),
    suggestedPrice: z.positiveHexString(),
    nativePriceUsd: z.number(),
    priceUsd: z.number(),
  })
  .passthrough();

const APIGasDataSchema = APIGasData;
type APIGasData = TypeOf<typeof APIGasDataSchema>;

const APISwapData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    swap: APISwapInfo,
    tokenIn: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    tokenOut: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balanceIn: APIBalance,
    balanceOut: APIBalance,
    gas: APIGasData,
    type: z.literal('swap'),
  })
  .passthrough();

const APISwapDataSchema = APISwapData;
type APISwapData = TypeOf<typeof APISwapDataSchema>;

const FundUsageEnum = z.enum(['FOR_AMOUNT', 'FOR_GAS', 'FOR_AMOUNT_AND_GAS']);

const FundUsageEnumSchema = FundUsageEnum;
type FundUsageEnum = TypeOf<typeof FundUsageEnumSchema>;

const APIInsufficientFundsError = z
  .object({
    code: z.literal('insufficient_funds'),
    detail: z.string(),
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    requiredAmount: z.positiveHexString(),
    fundUsage: FundUsageEnum,
  })
  .passthrough();

const APIInsufficientFundsErrorSchema = APIInsufficientFundsError;
type APIInsufficientFundsError = TypeOf<typeof APIInsufficientFundsErrorSchema>;

const SetupTransferData = z
  .object({
    receiverAddr: z.address(),
    token: z.union([z.string(), z.null()]),
    amount: z.union([z.string(), z.null()]),
  })
  .passthrough();

const SetupTransferDataSchema = SetupTransferData;
type SetupTransferData = TypeOf<typeof SetupTransferDataSchema>;

const APITransferInfo = z
  .object({
    amount: z.positiveHexString(),
    amountNormalized: z.number(),
    amountUsd: z.union([z.number(), z.null()]),
    receiver: z.address(),
  })
  .passthrough();

const APITransferInfoSchema = APITransferInfo;
type APITransferInfo = TypeOf<typeof APITransferInfoSchema>;

const APITransferData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('transfer'),
    transfer: APITransferInfo,
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    gas: APIGasData,
  })
  .passthrough();

const APITransferDataSchema = APITransferData;
type APITransferData = TypeOf<typeof APITransferDataSchema>;

const SetupTGTransferData = z
  .object({
    token: z.union([z.string(), z.null()]),
    amount: z.union([z.string(), z.null()]),
  })
  .passthrough();

const SetupTGTransferDataSchema = SetupTGTransferData;
type SetupTGTransferData = TypeOf<typeof SetupTGTransferDataSchema>;

const TGTransferTxnStatus = z.enum(['SUCCESS', 'FAIL', 'PENDING', 'UNSENT', 'WAITING_FOR_ACCEPT']);

const TGTransferTxnStatusSchema = TGTransferTxnStatus;
type TGTransferTxnStatus = TypeOf<typeof TGTransferTxnStatusSchema>;

const APITGTransferInfo = z
  .object({
    amount: z.positiveHexString(),
    amountNormalized: z.number(),
    amountUsd: z.union([z.number(), z.null()]),
    receiver: z.union([z.address(), z.null()]),
  })
  .passthrough();

const APITGTransferInfoSchema = APITGTransferInfo;
type APITGTransferInfo = TypeOf<typeof APITGTransferInfoSchema>;

const APITGTransferData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TGTransferTxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('tg_transfer'),
    transfer: APITGTransferInfo,
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    gas: APIGasData,
    inlineCommandQuery: z.string(),
    acceptedBy: z.union([APIUserInfo, z.null()]),
    canceled: z.boolean(),
  })
  .passthrough();

const APITGTransferDataSchema = APITGTransferData;
type APITGTransferData = TypeOf<typeof APITGTransferDataSchema>;

const SetupAddDepositData = z
  .object({
    depositStrategyId: z.number().int(),
    amount: z.union([z.string(), z.null()]),
  })
  .passthrough();

const SetupAddDepositDataSchema = SetupAddDepositData;
type SetupAddDepositData = TypeOf<typeof SetupAddDepositDataSchema>;

const APIDepositInfo = z.object({ amount: z.positiveHexString() }).passthrough();

const APIDepositInfoSchema = APIDepositInfo;
type APIDepositInfo = TypeOf<typeof APIDepositInfoSchema>;

const APIAddDepositData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('add_deposit'),
    deposit: APIDepositInfo,
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    gas: APIGasData,
  })
  .passthrough();

const APIAddDepositDataSchema = APIAddDepositData;
type APIAddDepositData = TypeOf<typeof APIAddDepositDataSchema>;

const SetupWithdrawDepositData = z
  .object({
    depositStrategyId: z.number().int(),
    amount: z.union([z.string(), z.null()]),
  })
  .passthrough();

const SetupWithdrawDepositDataSchema = SetupWithdrawDepositData;
type SetupWithdrawDepositData = TypeOf<typeof SetupWithdrawDepositDataSchema>;

const APIWithdrawDepositInfo = z.object({ amount: z.positiveHexString() }).passthrough();

const APIWithdrawDepositInfoSchema = APIWithdrawDepositInfo;
type APIWithdrawDepositInfo = TypeOf<typeof APIWithdrawDepositInfoSchema>;

const APIWithdrawDepositData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('withdraw_deposit'),
    deposit: APIWithdrawDepositInfo,
    gas: APIGasData,
  })
  .passthrough();

const APIWithdrawDepositDataSchema = APIWithdrawDepositData;
type APIWithdrawDepositData = TypeOf<typeof APIWithdrawDepositDataSchema>;

const TxnType = z.enum([
  'SWAP',
  'TRANSFER',
  'INCOMING_TRANSFER',
  'TG_TRANSFER',
  'TG_INCOMING_TRANSFER',
  'EXTERNAL_TRANSFER',
]);

const TxnTypeSchema = TxnType;
type TxnType = TypeOf<typeof TxnTypeSchema>;

const txnType = z.union([TxnType, z.null()]).optional();

const txnTypeSchema = txnType;
type txnType = TypeOf<typeof txnTypeSchema>;

const TxnSortingOptions = z.enum(['unspecified', 'by_built_at']);

const TxnSortingOptionsSchema = TxnSortingOptions;
type TxnSortingOptions = TypeOf<typeof TxnSortingOptionsSchema>;

const sortBy = TxnSortingOptions.optional().default('unspecified');

const sortBySchema = sortBy;
type sortBy = TypeOf<typeof sortBySchema>;

const APIIncomingTransferData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('incoming_transfer'),
    transfer: APITransferInfo,
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    gas: APIGasData,
    sentBy: APIUserInfo,
  })
  .passthrough();

const APIIncomingTransferDataSchema = APIIncomingTransferData;
type APIIncomingTransferData = TypeOf<typeof APIIncomingTransferDataSchema>;

const APITGIncomingTransferData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('tg_incoming_transfer'),
    transfer: APITransferInfo,
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    gas: APIGasData,
    sentBy: APIUserInfo,
  })
  .passthrough();

const APITGIncomingTransferDataSchema = APITGIncomingTransferData;
type APITGIncomingTransferData = TypeOf<typeof APITGIncomingTransferDataSchema>;

const APIExternalTransferData = z
  .object({
    txnId: z.string(),
    chainId: NetworkEnum,
    status: TxnStatus,
    submissionType: TxnSubmissionType,
    buildAt: z.string().datetime({ offset: true }),
    sentAt: z.union([z.string(), z.null()]),
    completedAt: z.union([z.string(), z.null()]),
    txn: APITXNData,
    txnHash: z.union([z.string(), z.null()]),
    type: z.literal('external_transfer'),
    transfer: APITransferInfo,
    token: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balance: APIBalance,
    gas: APIGasData,
  })
  .passthrough();

const APIExternalTransferDataSchema = APIExternalTransferData;
type APIExternalTransferData = TypeOf<typeof APIExternalTransferDataSchema>;

const SubmittedTransactionData = z
  .object({
    txnHash: z.union([z.string(), z.null()]),
    userOpHash: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

const SubmittedTransactionDataSchema = SubmittedTransactionData;
type SubmittedTransactionData = TypeOf<typeof SubmittedTransactionDataSchema>;

const APISwapDraftData = z
  .object({
    swap: APISwapInfo,
    tokenIn: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    tokenOut: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    balanceIn: APIBalance,
    balanceOut: APIBalance,
    gas: APIGasData,
  })
  .passthrough();

const APISwapDraftDataSchema = APISwapDraftData;
type APISwapDraftData = TypeOf<typeof APISwapDraftDataSchema>;

const popular = z.union([z.boolean(), z.null()]).optional();

const popularSchema = popular;
type popular = TypeOf<typeof popularSchema>;

const TokenSortingOptions = z.enum(['unspecified', 'by_addr', 'by_name', 'by_symbol', 'by_match_score']);

const TokenSortingOptionsSchema = TokenSortingOptions;
type TokenSortingOptions = TypeOf<typeof TokenSortingOptionsSchema>;

const APIPnL = z.object({ token: APIToken, balance: APIBalance, usdPaid: z.number() }).passthrough();

const APIPnLSchema = APIPnL;
type APIPnL = TypeOf<typeof APIPnLSchema>;

const APIPnLBuyTrade = z
  .object({
    type: z.literal('user_buy'),
    amount: z.positiveHexString(),
    amountNormalized: z.number(),
    usdPriceOld: z.union([z.number(), z.null()]),
    paidAmount: z.positiveHexString(),
    paidAmountNormalized: z.number(),
    paidWith: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    paidWithOldPriceUsd: z.union([z.number(), z.null()]),
    paidWithCurrentPriceUsd: z.union([z.number(), z.null()]),
    timestamp: z.string().datetime({ offset: true }),
  })
  .passthrough();

const APIPnLBuyTradeSchema = APIPnLBuyTrade;
type APIPnLBuyTrade = TypeOf<typeof APIPnLBuyTradeSchema>;

const APIPnLSellTrade = z
  .object({
    type: z.literal('user_sell'),
    amount: z.positiveHexString(),
    amountNormalized: z.number(),
    usdPriceOld: z.union([z.number(), z.null()]),
    receivedAmount: z.positiveHexString(),
    receivedAmountNormalized: z.number(),
    received: z.discriminatedUnion('type', [APIToken, APINativeToken]),
    receivedOldPriceUsd: z.union([z.number(), z.null()]),
    receivedCurrentPriceUsd: z.union([z.number(), z.null()]),
    timestamp: z.string().datetime({ offset: true }),
  })
  .passthrough();

const APIPnLSellTradeSchema = APIPnLSellTrade;
type APIPnLSellTrade = TypeOf<typeof APIPnLSellTradeSchema>;

const APIPnLDetailed = z
  .object({
    token: APIToken,
    balance: APIBalance,
    usdPaid: z.number(),
    trades: z.array(z.union([APIPnLBuyTrade, APIPnLSellTrade])),
  })
  .passthrough();

const APIPnLDetailedSchema = APIPnLDetailed;
type APIPnLDetailed = TypeOf<typeof APIPnLDetailedSchema>;

const APIDepositStrategy = z
  .object({
    id: z.number().int(),
    name: z.string(),
    iconUrl: z.string(),
    chainId: NetworkEnum,
    vaultAddr: z.address(),
    depositTokenAddr: z.address(),
    bondTokenAddr: z.address(),
  })
  .passthrough();

const APIDepositStrategySchema = APIDepositStrategy;
type APIDepositStrategy = TypeOf<typeof APIDepositStrategySchema>;

const APISessionKeyAccount = z
  .object({
    userAddress: z.address(),
    sessionKeyAccountAddress: z.address(),
    isSigned: z.boolean(),
  })
  .passthrough();

const APISessionKeyAccountSchema = APISessionKeyAccount;
type APISessionKeyAccount = TypeOf<typeof APISessionKeyAccountSchema>;

const UpdateSessionKeyData = z.object({ serializedSessionKey: z.string() }).passthrough();

const UpdateSessionKeyDataSchema = UpdateSessionKeyData;
type UpdateSessionKeyData = TypeOf<typeof UpdateSessionKeyDataSchema>;

const IncomingTxn = z
  .object({
    to: z.address(),
    value: z.positiveHexString(),
    data: z.positiveHexString(),
  })
  .passthrough();

const IncomingTxnSchema = IncomingTxn;
type IncomingTxn = TypeOf<typeof IncomingTxnSchema>;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(
    baseUrl,
    [
      {
        method: 'get',
        path: '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
        alias:
          'get_session_key_account_b_v2_session_key_account_manager_service_session_key_account__user_address__get',
        description: `Returns session key account if exists`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_address',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APISessionKeyAccount,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
        alias:
          'create_session_key_account_b_v2_session_key_account_manager_service_session_key_account__user_address__post',
        description: `Creates session key account if doesn&#x27;t exist`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_address',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APISessionKeyAccount,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'patch',
        path: '/b/v2/session_key_account_manager_service/session_key_account/:user_address/serialized_session_key',
        alias:
          'update_session_key_b_v2_session_key_account_manager_service_session_key_account__user_address__serialized_session_key_patch',
        description: `Updates session key for account`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: z.object({ serializedSessionKey: z.string() }).passthrough(),
          },
          {
            name: 'user_address',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.unknown(),
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/session_key_account_manager_service/session_key_account/:user_address/user_operation',
        alias:
          'execute_user_operation_with_session_key_account_b_v2_session_key_account_manager_service_session_key_account__user_address__user_operation_post',
        description: `Executes transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: IncomingTxn,
          },
          {
            name: 'user_address',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.string(),
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
    ],
    options,
  );
}
