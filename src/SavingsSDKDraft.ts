// /* ts-ignore */
// import type { KernelSmartAccount } from '@zerodev/sdk';
// import type { InferFunctionName, Permission } from '@zerodev/session-key/types';
// import type { type Abi, PrivateKeyAccount } from 'viem';
//
// enum Chain {
//   ETHEREUM = 1,
//   BINANCE_SMART_CHAIN = 56,
//   ARBITRUM = 42161,
//   BASE = 8453,
// }
//
// // TODO: pick only needed
// type AAClient = KernelSmartAccount;
//
// type HexString = `0x${string}`;
//
// type Address = HexString;
// type TokenAmount = HexString;
// type TxnHash = HexString;
// type DepositStrategyId = string;
//
// interface DepositStrategy<
//   TAbi extends Abi | ReadonlyArray<unknown> = Abi,
//   TFunctionName extends string | undefined = string,
//   _FunctionName = TAbi extends Abi
//     ? InferFunctionName<TAbi, TFunctionName>
//     : never,
// > {
//   id: DepositStrategyId;
//   requiredPermissions: Permission<TAbi, TFunctionName, _FunctionName>[];
//
//   chain: Chain;
//   tokenAddress: Address;
//   vaultAddress: Address;
//   bondTokenAddress: Address;
// }
//
// type DepositId = string;
// interface Deposit {
//   id: DepositId;
//   initialTokenAmount: TokenAmount;
//
//   // computed prop from chain in API call (to hide Beefy)
//   currentTokenAmount: TokenAmount;
//
//   depositStrategyId: DepositStrategyId;
//
//   userAddress: Address;
//
//   // maybe createdAt
//
//   // these can be retrieved from DepositStrategy
//   // chain: Chain;
//   // tokenAddress: TokenAddress;
//   // bondTokenAddress: TokenAddress;
// }
//
// interface Txn {
//   to: Address;
//   value: number /* bigint */;
//   data: string;
// }
//
// interface UserOp {
//   callData: string; // created from Txn
// }
//
// interface SponsoredUserOp extends UserOp {
//   paymasterAndData: string;
//   callGasLimit: number /* bigint */;
//   verificationGasLimit: number /* bigint */;
//   preVerificationGas: number /* bigint */;
//   maxFeePerGas: number /* bigint */;
//   maxPriorityFeePerGas: number /* bigint */;
// }
//
// // FRONTEND
// // - add lib with Supported DepositStrategy[] support once and connect it to FE and BE
// // - implement all sdk functions
// // - integrate SDK to our wallet
//
// // BACKEND CHANGES:
// // - add auth for users
// // - add auth for internal communication
// // - extract each microservice
//
// // SKA SERVICE:
// // we already have:
// //   GET: session_key_account_manager_service/session_key_account/:user_address
// //   POST: session_key_account_manager_service/session_key_account/:user_address
// //   PATCH: session_key_account_manager_service/session_key_account/:user_address/serialized_session_key
// //   we also have internal
// //   POST: session_key_account_manager_service/session_key_account/:user_address/user_operation
// // we need to add/alter:
// //   - change add strategyIds field to sessionKeyAccount
// //     - alter PATCH: session_key_account_manager_service/session_key_account/:user_address/serialized_session_key to accept it
// //     - alter GET: session_key_account_manager_service/session_key_account/:user_address to return it
// //   - add DELETE: session_key_account_manager_service/session_key_account/:user_address
//
// // DEPOSIT SERVICE:
// // we already have:
// //   NO PUBLIC API
// // we need to add:
// // - add GET: deposit_service/:user_address/deposits -> Deposit[]
// // - add GET: deposit_service/:user_address/prepare-ensure-token-available {tokenAmount, tokenAddress, chain}  -> WithdrawalParams[]
// //   - make business logic based on deposits and token amount prepare - UserOp
// //   - GET: session_key_account_manager_service/sponsor-user-op {WithdrawUserOp}  -> SponsoredUserOp
//
// interface SavingAccount {
//   aaClient: AAClient;
//   privateKeyAccount: PrivateKeyAccount;
//   strategies: {
//     activateStrategies: (
//       depositStrategyIds: DepositStrategyId[],
//     ) => Promise<void>;
//     // activeStrategies = this.getActiveStrategies()
//     // depositStrategiesToAdd = depositStrategyIds.map(getStrategyById)
//     // newActiveStrategies = union(activeStrategies, depositStrategiesToAdd)
//     // this.revokeSessionKey(this.aaClient, sessionKeyAccount.sessionKeyAccountAddress)
//     // this.createSessionKeyAccount(this.aaClient.address, this.privateKeyAccount, newActiveStrategies)
//     // - POST: session_key_account_manager_service/session_key_account/:user_address
//     // - permissions = newActiveStrategies.map(strategy => strategy.requiredPermissions)
//     // - prepareSessionKeyAccount(this.privateKeyAccount, permissions)
//     // - newActiveStrategyIds = newActiveStrategies.map(strategy => strategy.id)
//     // - PATCH: session_key_account_manager_service/session_key_account/:user_address/serialized_session_key {newActiveStrategyIds, serializedSessionKey}
//
//     // need backend to extend sessionKeyAccount entity with strategyIds
//     getActiveStrategies: () => Promise<DepositStrategy[]>;
//     // - GET: session_key_account_manager_service/session_key_account/:user_address
//     // activeDepositStrategies = sessionKeyAccount.activeStrategyIds.map(getStrategyById)
//
//     // need backend to remove sessionKeyAccount
//     deactivateAllStrategies: () => Promise<void>;
//     // this.revokeSessionKey(this.aaClient, sessionKeyAccount.sessionKeyAccountAddress)
//     // DELETE: session_key_account_manager_service/session_key_account/:user_address
//   };
//   deposits: {
//     getDeposits: () => Deposit[];
//     // GET: deposit_service/:user_address/deposits -> Deposit[]
//   };
//   userOps: {
//     prepareEnsureTokenAvailableUserOp: (
//       tokenAddress: Address,
//       tokenAmount: TokenAmount,
//     ) => SponsoredUserOp[];
//     // TODO: maybe these two call should be combined
//     // GET: deposit_service/:user_address/prepare-ensure-token-available {tokenAmount, tokenAddress, chain}  -> WithdrawalParams[]
//
//     sendUserOps: (userOps: UserOp[]) => TxnHash;
//     txnToUserOp: (txn: Txn) => UserOp;
//
//     // just for tests:
//     _prepareAddDepositUserOp: (
//       depositStrategyId: DepositStrategyId,
//       tokenAmount: TokenAmount,
//     ) => UserOp;
//     // - POST: thecat/b/v2/transactions/setup_add_deposit {depositStrategyId, tokenAmount} -> userOp
//     // - POST: session_key_account_manager_service/session_key_account/:user_address/execute_user_operation {userOp} -> userOpHash
//
//     _prepareWithdrawDepositUserOp: (
//       depositStrategyId: DepositStrategyId,
//       tokenAmount: TokenAmount,
//     ) => UserOp;
//     // - POST: thecat/b/v2/transactions/setup_withdraw_deposit {depositStrategyId, tokenAmount} -> userOp
//     // - POST: session_key_account_manager_service/session_key_account/:user_address/execute_user_operation {userOp} -> userOpHash
//   };
// }
//
// interface SavingsSDK {
//   // ideally supportedDepositStrategies should be separate package so wallets can easily update and review it
//   // separately from our code
//   supportedDepositStrategies: DepositStrategy[];
//   createAAClient: (
//     privateKeyAccount: PrivateKeyAccount,
//     bundlerAPIKey: string,
//   ) => Promise<AAClient>;
//   createSavingAccount: (
//     privateKeyAccount: PrivateKeyAccount,
//     bundlerAPIKey: string,
//     savingsAPIBaseURL: string,
//     aaClient?: AAClient,
//   ) => Promise<SavingAccount>;
// }
//
// interface SavingAccountV2 extends SavingAccount {
//   strategies: SavingAccount['strategies'] & {
//     deactivateStrategies: (
//       depositStrategyIds: DepositStrategyId[],
//     ) => Promise<void>; // need backend to recreate sessionKeyAccount + we probably suppose to withdraw from deactivated strategies and rebalance
//   };
// }
//
// // TODO: TO ADDRESS
// // Q: where do we depend on chain?
// // A: bundlerRPCKey for now depends in chain, for pimlico this won't be the case. Otherwise we should provide bunch of them
// // A: ??? probably chain matters on level of txn or userOp
//
// // Q: what to do if we need to add permissions to strategy?
// // A: ??? probably we might want to save permissions along with id, and compare them from time to time
//
// // Q: what do we do if vault is compromised?
// // A: ??? we should extend our SKA with self revoke permissions
// // A: we should have protected API call for self revoke + check for file with supported
// // and revoke SKA with compromised strategies
//
// // Q: do we need to provide API for manual deposit managment?
// // A: ??? if yes - we should not sponsor it and prepare full on FE
//
// // TODO: NOT COVERED:
// // Q: how wallet do simulation and gas calculation if needed?
// // A: for v1 we don't provide simulation
//
// // Q: what userOps do we sponsor
// // A: we sponsor depositing and withdrawal, depositing internaly, withdrawal via ensure call
//
// // Q: if we sponsor withdrawal, how do we defend against burning our gas by user if he calls ensure lots of times
// // A: ??? we probably need some kind of limit for this
//
// // Q: what if we used strategy for WBNB, but we can withdraw BNB, and user wants transfer more BNB that he has?
// // A: probably for this we have call deposit_service/:user_address/prepare-ensure-token-available
//
// // Q: how do we handle situation where user manually withdraw or put some tokens into some vault that we support?
// // A: we manage all money on the saving account
