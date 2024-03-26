import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import type { KernelSmartAccount } from '@zerodev/sdk';
import { createKernelAccount } from '@zerodev/sdk';
import type { PrivateKeyAccount } from 'viem';
import { createPublicClient, http } from 'viem';

interface CreateAAAccountParams {
  privateKeyAccount: PrivateKeyAccount;
  bundlerAPIKey: string;
}

export async function createAAAccount({
  privateKeyAccount,
  bundlerAPIKey,
}: CreateAAAccountParams): Promise<KernelSmartAccount> {
  if (!bundlerAPIKey) {
    throw new Error(
      'process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID is not defined',
    );
  }

  const aaBundlerTransport = http(
    `https://rpc.zerodev.app/api/v2/bundler/${bundlerAPIKey}`,
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

  return aaAccount;
}
