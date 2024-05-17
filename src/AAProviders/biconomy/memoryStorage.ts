import { SignerData, SmartAccountSigner, WalletClientSigner } from '@biconomy/account';

import {
  ISessionStorage,
  SessionLeafNode,
  SessionSearchParam,
  SessionStatus,
} from '@biconomy/account/dist/_types/modules/interfaces/ISessionStorage';
import { Chain, Hex, createWalletClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

interface StoreData {
  merkleRoot: string;
  sessions: SessionLeafNode[];
  signerDataByAddress: { [key: string]: SignerData };
}

export class SessionMemoryStorage implements ISessionStorage {
  private merkleRoot: string = '';

  private sessions: SessionLeafNode[] = [];

  private readonly signerDataByAddress: { [key: string]: SignerData } = {};

  constructor(initialData?: StoreData) {
    if (initialData) {
      this.merkleRoot = initialData.merkleRoot;
      this.sessions = initialData.sessions;
      this.signerDataByAddress = initialData.signerDataByAddress;
    }
  }

  // Serialization methods

  serializeToString(): string {
    const data: StoreData = {
      merkleRoot: this.merkleRoot,
      sessions: this.sessions,
      signerDataByAddress: this.signerDataByAddress,
    };
    return JSON.stringify(data);
  }

  static fromString(serializedData: string): SessionMemoryStorage {
    return new SessionMemoryStorage(JSON.parse(serializedData));
  }

  // SessionData related methods

  async addSessionData(session: SessionLeafNode): Promise<void> {
    this.sessions.push({
      ...session,
      sessionValidationModule: session.sessionValidationModule.toLowerCase() as Hex,
      sessionPublicKey: session.sessionPublicKey.toLowerCase() as Hex,
    });
  }

  async getAllSessionData(param?: SessionSearchParam): Promise<SessionLeafNode[]> {
    let { sessions } = this;
    if (param && param.status) {
      sessions = sessions.filter((s: SessionLeafNode) => s.status === param.status);
    }
    return JSON.parse(JSON.stringify(sessions)); // Defensive copy
  }

  async getSessionData(param: SessionSearchParam): Promise<SessionLeafNode> {
    this.validateSearchParam(param);
    const session = this.sessions.find(this.createSessionFilter(param));
    if (!session) {
      throw new Error('Session not found.');
    }
    return JSON.parse(JSON.stringify(session)); // Defensive copy
  }

  async updateSessionStatus(param: SessionSearchParam, status: SessionStatus): Promise<void> {
    this.validateSearchParam(param);
    const session = this.sessions.find(this.createSessionFilter(param));
    if (!session) {
      throw new Error('Session not found.');
    }
    session.status = status;
  }

  async clearPendingSessions(): Promise<void> {
    this.sessions = this.sessions.filter((s: SessionLeafNode) => s.status !== 'PENDING');
  }

  // Signer related methods

  async addSigner(signerData?: SignerData): Promise<SmartAccountSigner> {
    let newSignerData: SignerData;
    if (!signerData) {
      const pkey = generatePrivateKey();
      newSignerData = {
        pvKey: pkey,
        pbKey: privateKeyToAccount(pkey).publicKey,
      };
    } else {
      newSignerData = signerData;
    }
    const signerAddr = privateKeyToAccount(newSignerData.pvKey).address;
    const signer = this.pkToSigner(newSignerData.pvKey, newSignerData.chainId);
    this.signerDataByAddress[signerAddr.toLowerCase()] = newSignerData;
    return signer;
  }

  async getSignerByKey(sessionPublicKey: string): Promise<SmartAccountSigner> {
    const signerData = this.signerDataByAddress[sessionPublicKey.toLowerCase()];
    if (!signerData) {
      throw new Error('Signer not found.');
    }
    return this.pkToSigner(signerData.pvKey, signerData.chainId);
  }

  async getSignerBySession(param: SessionSearchParam): Promise<SmartAccountSigner> {
    const session = await this.getSessionData(param);
    return this.getSignerByKey(session.sessionPublicKey);
  }

  // MerkleRoot related methods

  async getMerkleRoot(): Promise<string> {
    return this.merkleRoot;
  }

  async setMerkleRoot(merkleRoot: string): Promise<void> {
    this.merkleRoot = merkleRoot;
  }

  // Private helper methods

  private validateSearchParam(param: SessionSearchParam): void {
    if (param.sessionID || (!param.sessionID && param.sessionPublicKey && param.sessionValidationModule)) {
      return;
    }
    throw new Error('Either pass sessionId or a combination of sessionPublicKey and sessionValidationModule address.');
  }

  private createSessionFilter(param: SessionSearchParam) {
    return (session: SessionLeafNode) => {
      if (param.status && session.status === param.status) {
        return false;
      }
      if (param.sessionID) {
        return session.sessionID === param.sessionID;
      }
      if (param.sessionPublicKey && param.sessionValidationModule) {
        return (
          session.sessionPublicKey === param.sessionPublicKey.toLowerCase() &&
          session.sessionValidationModule === param.sessionValidationModule.toLowerCase()
        );
      }
      return false;
    };
  }

  private pkToSigner(privateKey: Hex, chain: Chain | undefined): SmartAccountSigner {
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain: chain ?? mainnet,
      transport: http(),
    });
    return new WalletClientSigner(client, 'viem');
  }
}
