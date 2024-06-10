import { Address, PrivateKeyAccount } from 'viem';
import { base } from 'viem/chains';

import { createEoaAccount } from '../__tests__/utils/createEoaAccount';

import { PrimaryAAAccount } from '../AAProviders/shared/PrimaryAAAccount';
import { ZerodevAAProvider } from '../AAProviders/zerodev/ZerodevAAProvider';

import { createPimlicoBundlerUrl } from '../factories/utils/createPimlicoBundlerUrl';

import { createAuthClient } from './auth/createAuthClient';

import { createDmsClient } from './dms/createDmsClient';
import { SavingsBackendClient } from './SavingsBackendClient';
import { CreateSKAClientParams, createSKAClient } from './ska/createSKAClient';

const chain = base; // TODO: maybe make it changeable
const chainId = chain.id;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);

const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;

function signMessageWithEoa(
  eoaAccount: PrivateKeyAccount,
  message: { expires: number; aa_address: `0x${string}`; info: string },
) {
  return eoaAccount.signTypedData({
    domain: {
      name: 'WallchainAuthMessage',
    },
    types: {
      WallchainAuthMessage: [
        { name: 'info', type: 'string' },
        { name: 'aa_address', type: 'address' },
        { name: 'expires', type: 'uint256' },
      ],
    },
    primaryType: 'WallchainAuthMessage',
    message: {
      ...message,
      expires: BigInt(message.expires),
    },
  });
}

function createAuthMessageWithAaAddress(aaAddress: Address) {
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min in milliseconds
  const expiresInt = Math.floor(expires.getTime() / 1000); // Convert to seconds

  const message = {
    info: 'Confirm Address for Wallchain Auto-Yield',
    aa_address: aaAddress,
    expires: expiresInt,
  };
  return message;
}

describe('SavingsBackendClient', () => {
  let eoaAccount: PrivateKeyAccount;
  beforeEach(() => {
    eoaAccount = createEoaAccount();
  });

  let apiListeners: CreateSKAClientParams['apiListeners'];
  let savingsBackendClient: SavingsBackendClient;
  beforeEach(() => {
    const apiClientParams = {
      baseUrl: savingsBackendUrl,
      apiListeners,
    };
    savingsBackendClient = new SavingsBackendClient({
      authClient: createAuthClient(apiClientParams),
      skaClient: createSKAClient(apiClientParams),
      dmsClient: createDmsClient(apiClientParams),
    });
  });

  let aaAccount: PrimaryAAAccount;

  beforeEach(async () => {
    const aaProvider = new ZerodevAAProvider({
      chain,
      bundlerUrl: createPimlicoBundlerUrl({ chainId, apiKey: pimlicoApiKey }),
    });
    aaAccount = await aaProvider.createAAAccount(eoaAccount);
  });

  describe('auth', () => {
    it('should register user if not registered', async () => {
      const message = createAuthMessageWithAaAddress(aaAccount.aaAddress);
      const signedMessage = await signMessageWithEoa(eoaAccount, message);

      const { user } = await savingsBackendClient.auth({
        message,
        signedMessage,
      });

      expect(user).toBeTruthy();
    });
  });
});
