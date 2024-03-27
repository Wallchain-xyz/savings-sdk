import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { PrivateKeyAccount, createPublicClient, http } from 'viem';

import { createSavingsAccountFromSudoValidator } from './createSavingsAccountFromSudoValidator';

interface CreateYieldAccountParams {
  privateKeyAccount: PrivateKeyAccount;
  bundlerAPIKey: string;
  savingsBackendUrl: string;
  savingsBackendHeaders: { [key: string]: string };
}

export async function createSavingsAccountFromPrivateKeyAccount({
  privateKeyAccount,
  // TODO: @merlin think how to pass these not via params
  // since external wallet code doesn't need to know about this
  bundlerAPIKey,
  savingsBackendUrl,
  savingsBackendHeaders,
}: CreateYieldAccountParams) {
  const aaBundlerTransport = http(`https://rpc.zerodev.app/api/v2/bundler/${bundlerAPIKey}`);
  const publicClient = createPublicClient({
    transport: aaBundlerTransport,
  });

  const sudoValidator = await signerToEcdsaValidator(publicClient, {
    signer: privateKeyAccount,
  });

  return createSavingsAccountFromSudoValidator({
    sudoValidator,
    bundlerAPIKey,
    savingsBackendUrl,
    savingsBackendHeaders,
  });
}
