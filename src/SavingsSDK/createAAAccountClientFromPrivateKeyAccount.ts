import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import type { PrivateKeyAccount } from "viem";
import { createPublicClient, http } from "viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";

interface CreateAAAccountClient {
  privateKeyAccount: PrivateKeyAccount;
  bundlerAPIKey: string;
}

export type AAAccountClient = Awaited<
  ReturnType<typeof createAAAccountClientFromPrivateKeyAccount>
>;

export async function createAAAccountClientFromPrivateKeyAccount({
  privateKeyAccount,
  bundlerAPIKey,
}: CreateAAAccountClient) {
  const aaBundlerTransport = http(
    `https://rpc.zerodev.app/api/v2/bundler/${bundlerAPIKey}`
  );
  const publicClient = createPublicClient({
    transport: aaBundlerTransport,
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: privateKeyAccount,
  });

  const aaAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
  });

  return createKernelAccountClient({
    account: aaAccount,
    transport: aaBundlerTransport,
  });
}
