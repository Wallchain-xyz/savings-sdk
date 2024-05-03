# E2E testing for SDK&API

This tests allow to verify that savings platforms works correctly

## ENV variables

To be able to run E2E tests, you need to set following variables:

- `TESTS_CHAIN_ID`: Chain id to use, set `8453` for Base chain
- `TESTS_API_URL`: API url for backend service. Use `http://localhost:8000` for local server
- `TESTS_BUNDLER_CHAIN_API_KEY`: A bundler api key, should be Zerodev key
- `TESTS_SPONSORSHIP_API_KEY`: A sponsorship (paymaster key), should be Pimlico key
- `TESTS_AA_OWNER_PRIVATE_KEY`: A private key that owns AA to be used in tests. Please generate your own,
  and then send some ETH to corresponding AA account.

## Test suites

- `free.test.ts` contains test that do not execute anything on chain. `TESTS_AA_OWNER_PRIVATE_KEY` is not required
  to run it.
- `zerodev.test.ts` contains working examples on how to perform some actions via ZeroDev. It has minimal dependency
  on sdk, it's goal to be a complete working script that performer core functionality.
