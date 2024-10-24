import { Account, Chain, PublicClient, RpcSchema, Transport, WalletClient } from 'viem';

export type PublicClientWithChain<
  transport extends Transport = Transport,
  chain extends Chain = Chain,
  accountOrAddress extends Account | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = PublicClient<transport, chain, accountOrAddress, rpcSchema>;

export type ViemDefinitions<
  transport extends Transport = Transport,
  chain extends Chain = Chain,
  account extends Account = Account,
  rpcSchema extends RpcSchema | undefined = undefined,
> = WalletClient<transport, chain, account, rpcSchema>;
