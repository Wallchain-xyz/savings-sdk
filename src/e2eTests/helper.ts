import { ChainId } from '../api/auth/__generated__/createApiClient';

export interface IntegrationTestConfig {
  apiUrl: string;
  apiKey: string;
  chainId: ChainId;
  aaOwnerPrivateKey: string;
}

function getEnvOrFail(envName: string, defaultValue?: string): string {
  const res = process.env[envName] || defaultValue;
  if (res === undefined) {
    throw new Error(`Env with name ${envName} is not set`);
  }
  return res;
}

export const getTestConfig: () => IntegrationTestConfig = () => ({
  chainId: Number(getEnvOrFail('TESTS_CHAIN_ID', '8453')) as ChainId,
  apiUrl: getEnvOrFail('TESTS_API_URL'),
  apiKey: getEnvOrFail('TESTS_BUNDLER_CHAIN_API_KEY'),
  aaOwnerPrivateKey: getEnvOrFail('TESTS_AA_OWNER_PRIVATE_KEY', ''),
});
