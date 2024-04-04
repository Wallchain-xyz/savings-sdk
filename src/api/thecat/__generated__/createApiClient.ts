// TODO: @merlin lots of these types and schemes are not needed, but
// they will be removed once we move to microservices and have
// separate API for SDK - it will have it's own
// openapi scheme which we will use to generate this client
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { Zodios, type ZodiosOptions } from '@zodios/core';

import { TypeOf, zod as z } from '../../zod';

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

const X_TG_Web_App_Init_Data = z.union([z.string(), z.null()]).optional();

const X_TG_Web_App_Init_DataSchema = X_TG_Web_App_Init_Data;
type X_TG_Web_App_Init_Data = TypeOf<typeof X_TG_Web_App_Init_DataSchema>;

const ValidationError = z
  .object({ loc: z.array(z.union([z.string(), z.number()])), msg: z.string(), type: z.string() })
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

const user_id = z.union([z.number(), z.literal('me')]);

const user_idSchema = user_id;
type user_id = TypeOf<typeof user_idSchema>;

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
  .object({ usdPrice: z.number(), change24HPercent: z.union([z.number(), z.null()]) })
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
  .object({ token: z.union([z.string(), z.null()]), amount: z.union([z.string(), z.null()]) })
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
    receiver: z.union([z.string(), z.null()]),
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
  .object({ depositStrategyId: z.number().int(), amount: z.union([z.string(), z.null()]) })
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
  .object({ depositStrategyId: z.number().int(), amount: z.union([z.string(), z.null()]) })
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
  .object({ txnHash: z.union([z.string(), z.null()]), userOpHash: z.union([z.string(), z.null()]) })
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

const sortBy__2 = TokenSortingOptions.optional().default('by_match_score');

const sortBy__2Schema = sortBy__2;
type sortBy__2 = TypeOf<typeof sortBy__2Schema>;

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
    depositStrategyIds: z.array(z.string()),
  })
  .passthrough();

const APISessionKeyAccountSchema = APISessionKeyAccount;
type APISessionKeyAccount = TypeOf<typeof APISessionKeyAccountSchema>;

const UpdateSessionKeyData = z
  .object({ serializedSessionKey: z.string(), depositStrategyIds: z.array(z.string()) })
  .passthrough();

const UpdateSessionKeyDataSchema = UpdateSessionKeyData;
type UpdateSessionKeyData = TypeOf<typeof UpdateSessionKeyDataSchema>;

const MinimumExecutableTxn = z
  .object({
    to: z.address(),
    value: z.positiveHexString(),
    data: z.positiveHexString(),
  })
  .passthrough();

const MinimumExecutableTxnSchema = MinimumExecutableTxn;
type MinimumExecutableTxn = TypeOf<typeof MinimumExecutableTxnSchema>;

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
        method: 'delete',
        path: '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
        alias: 'delete_session_key_b_v2_session_key_account_manager_service_session_key_account__user_address__delete',
        description: `Delete session key account`,
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
            schema: UpdateSessionKeyData,
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
            schema: MinimumExecutableTxn,
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
      {
        method: 'get',
        path: '/b/v2/tokens/by_addr',
        alias: 'lookup_tokens_b_v2_tokens_by_addr_get',
        requestFormat: 'json',
        parameters: [
          {
            name: 'token',
            type: 'Query',
            schema: z.array(z.string()).min(1),
          },
          {
            name: 'includePrices',
            type: 'Query',
            schema: z.boolean().optional(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.array(APIToken),
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'get',
        path: '/b/v2/tokens/native',
        alias: 'get_native_token_b_v2_tokens_native_get',
        description: `List native token info`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'includePrices',
            type: 'Query',
            schema: z.boolean().optional(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APINativeToken,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'get',
        path: '/b/v2/transactions/:txn_id',
        alias: 'get_txn_b_v2_transactions__txn_id__get',
        description: `Get information about transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'txn_id',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.discriminatedUnion('type', [
          APISwapData,
          APITransferData,
          APIIncomingTransferData,
          APITGTransferData,
          APITGIncomingTransferData,
          APIAddDepositData,
          APIExternalTransferData,
          APIWithdrawDepositData,
        ]),
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
        path: '/b/v2/transactions/:txn_id/cancel_transfer',
        alias: 'cancel_transfer_txn_b_v2_transactions__txn_id__cancel_transfer_post',
        description: `Cancel transfer transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'txn_id',
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
        path: '/b/v2/transactions/:txn_id/submitted',
        alias: 'confirm_txn_by_id_b_v2_transactions__txn_id__submitted_post',
        description: `Notify server about sent transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SubmittedTransactionData,
          },
          {
            name: 'txn_id',
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
        path: '/b/v2/transactions/setup_add_deposit',
        alias: 'setup_add_deposit_b_v2_transactions_setup_add_deposit_post',
        description: `Build add deposit transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SetupAddDepositData,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APIAddDepositData,
        errors: [
          {
            status: 400,
            description: `Failed to build add deposit due to incorrect input`,
            schema: APIInsufficientFundsError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/transactions/setup_swap',
        alias: 'setup_swap_b_v2_transactions_setup_swap_post',
        description: `Build swap transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SetupSwapData,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APISwapData,
        errors: [
          {
            status: 400,
            description: `Failed to build swap due to incorrect input`,
            schema: APIInsufficientFundsError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/transactions/setup_tg_transfer',
        alias: 'setup_tg_transfer_b_v2_transactions_setup_tg_transfer_post',
        description: `Build transfer transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SetupTGTransferData,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APITGTransferData,
        errors: [
          {
            status: 400,
            description: `Failed to build swap due to incorrect input`,
            schema: APIInsufficientFundsError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/transactions/setup_transfer',
        alias: 'setup_transfer_b_v2_transactions_setup_transfer_post',
        description: `Build transfer transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SetupTransferData,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APITransferData,
        errors: [
          {
            status: 400,
            description: `Failed to build swap due to incorrect input`,
            schema: APIInsufficientFundsError,
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/transactions/setup_withdraw_deposit',
        alias: 'setup_withdraw_deposit_b_v2_transactions_setup_withdraw_deposit_post',
        description: `Build withdraw deposit transaction`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SetupWithdrawDepositData,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APIWithdrawDepositData,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'get',
        path: '/b/v2/users/',
        alias: 'list_users_b_v2_users__get',
        description: `List all users`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.array(APIUserInfo),
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'get',
        path: '/b/v2/users/:user_id',
        alias: 'get_user_b_v2_users__user_id__get',
        description: `Get user info`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: APIUserInfo,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'delete',
        path: '/b/v2/users/:user_id',
        alias: 'delete_self_b_v2_users__user_id__delete',
        description: `Delete the user from DB`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
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
        method: 'get',
        path: '/b/v2/users/:user_id/native_balance',
        alias: 'user_native_balance_b_v2_users__user_id__native_balance_get',
        description: `Get native balance of a user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: NativeBalanceInfo,
        errors: [
          {
            status: 404,
            description: `User not found`,
            schema: z.object({ detail: z.string() }).passthrough(),
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/users/:user_id/navigate_in_chat',
        alias: 'navigate_in_chat_b_v2_users__user_id__navigate_in_chat_post',
        description: `Open chat flow (chat menu)`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: NavigateChatData,
          },
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
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
        method: 'get',
        path: '/b/v2/users/:user_id/points',
        alias: 'user_points_b_v2_users__user_id__points_get',
        description: `Get point count of a user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.object({ points: z.number().int() }).passthrough(),
        errors: [
          {
            status: 404,
            description: `User not found`,
            schema: z.object({ detail: z.string() }).passthrough(),
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/users/:user_id/set_chain',
        alias: 'set_chain_b_v2_users__user_id__set_chain_post',
        description: `Open chat flow (chat menu)`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SetChainData,
          },
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
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
        method: 'get',
        path: '/b/v2/users/:user_id/tokens',
        alias: 'user_tokens_b_v2_users__user_id__tokens_get',
        description: `Get token balances of a user`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'user_id',
            type: 'Path',
            schema: user_id,
          },
          {
            name: 'noBalanceCache',
            type: 'Query',
            schema: z.boolean().optional(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.array(TokenBalanceInfo),
        errors: [
          {
            status: 404,
            description: `User not found`,
            schema: z.object({ detail: z.string() }).passthrough(),
          },
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'post',
        path: '/b/v2/users/sign_in',
        alias: 'signin_b_v2_users_sign_in_post',
        description: `Sign-in user finishing bot setup flow

This endpoint stores user info and moves telegram chat to main menu.`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: SignInData,
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
          {
            name: 'X-TG-Web-App-Init-Data',
            type: 'Header',
            schema: X_TG_Web_App_Init_Data,
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
        method: 'get',
        path: '/b/v2/wallets/:wallet_addr/native_balance',
        alias: 'wallet_native_balance_b_v2_wallets__wallet_addr__native_balance_get',
        description: `Get native balances of a wallet`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'wallet_addr',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: NativeBalanceInfo,
        errors: [
          {
            status: 422,
            description: `Validation Error`,
            schema: HTTPValidationError,
          },
        ],
      },
      {
        method: 'get',
        path: '/b/v2/wallets/:wallet_addr/tokens',
        alias: 'wallet_balances_b_v2_wallets__wallet_addr__tokens_get',
        description: `Get token balances of a wallet`,
        requestFormat: 'json',
        parameters: [
          {
            name: 'wallet_addr',
            type: 'Path',
            schema: z.string(),
          },
          {
            name: 'chainId',
            type: 'Query',
            schema: chainId,
          },
        ],
        response: z.array(TokenBalanceInfo),
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
