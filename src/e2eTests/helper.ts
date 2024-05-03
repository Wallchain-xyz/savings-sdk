export interface IntegrationTestConfig {
  apiUrl: string;
  bundlerChainAPIKey: string;
  sponsorshipAPIKey: string;
  chainId: number;
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
  chainId: Number(getEnvOrFail('TESTS_CHAIN_ID', '8453')),
  apiUrl: getEnvOrFail('TESTS_API_URL'),
  bundlerChainAPIKey: getEnvOrFail('TESTS_BUNDLER_CHAIN_API_KEY'),
  sponsorshipAPIKey: getEnvOrFail('TESTS_SPONSORSHIP_API_KEY'),
  aaOwnerPrivateKey: getEnvOrFail('TESTS_AA_OWNER_PRIVATE_KEY', ''),
});
