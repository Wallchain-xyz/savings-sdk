import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { PrivateKeyAccount, createPublicClient, http } from 'viem';

import {
  CreateSavingsAccountFromKernelValidatorParams,
  createSavingsAccountFromSudoValidator,
} from './createSavingsAccountFromSudoValidator';

interface CreateYieldAccountParams extends Omit<CreateSavingsAccountFromKernelValidatorParams, 'sudoValidator'> {
  privateKeyAccount: PrivateKeyAccount;
}

export async function createSavingsAccountFromPrivateKeyAccount({
  privateKeyAccount,
  // TODO: @merlin think how to pass these not via params
  // since external wallet code doesn't need to know about this
  bundlerChainAPIKey,
  sponsorshipAPIKey,
  chainId,
  savingsBackendUrl,
}: CreateYieldAccountParams) {
  const aaBundlerTransport = http(`https://rpc.zerodev.app/api/v2/bundler/${bundlerChainAPIKey}`);
  const publicClient = createPublicClient({
    transport: aaBundlerTransport,
  });

  const sudoValidator = await signerToEcdsaValidator(publicClient, {
    signer: privateKeyAccount,
  });

  return createSavingsAccountFromSudoValidator({
    sudoValidator,
    bundlerChainAPIKey,
    sponsorshipAPIKey,
    chainId,
    savingsBackendUrl,
    privateKeyAccount,
  });
}
