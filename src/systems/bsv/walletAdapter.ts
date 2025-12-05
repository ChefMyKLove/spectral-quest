/**
 * BSV WALLET ADAPTER LAYER
 * 
 * BRC-100 compatible wallet abstraction
 * Works with any BSV wallet implementing BRC-100 standard:
 * - Metanet Desktop Wallet (primary)
 * - 1Sat Ordinals Wallet (fallback)
 * - Any custom BSV wallet (extensible)
 * 
 * Uses Project Babbage SDK for wallet communication
 */

import { Babbage } from '@babbage/sdk-ts';
import type { CreateActionParams } from '@babbage/sdk-ts';

// =============================================================================
// TYPES
// =============================================================================

export interface WalletConfig {
  network: 'mainnet' | 'testnet';
  appName: string;
  appIcon?: string;
}

export interface WalletConnection {
  identityKey: string;
  authenticated: boolean;
  connected: boolean;
}

// =============================================================================
// WALLET ADAPTER CLASS
// =============================================================================

export class BSVWalletAdapter {
  private wallet: typeof Babbage;
  private config: WalletConfig;
  private isConnected: boolean = false;
  private userIdentityKey: string = '';

  constructor(config: WalletConfig) {
    this.config = config;
    this.wallet = Babbage;
  }

  /**
   * AUTHENTICATE USER
   * 
   * Uses Authrite protocol for mutual authentication
   * No passwords needed - blockchain-native identity
   * 
   * @returns User's identity key and authentication status
   */
  async authenticate(): Promise<WalletConnection> {
    try {
      console.log('[BSV Wallet] Starting authentication...');
      
      // Check if already authenticated
      const isAuth = await this.wallet.isAuthenticated();
      
      if (!isAuth) {
        console.log('[BSV Wallet] Not authenticated, waiting for user approval...');
        await this.wallet.waitForAuthentication();
      }

      // Get user's identity key (permanent, pseudonymous identity)
      const publicKey = await this.wallet.getPublicKey({
        identityKey: true
      });

      this.userIdentityKey = publicKey.publicKey;
      this.isConnected = true;

      console.log(`[BSV Wallet] ✅ Authenticated!`);
      console.log(`[BSV Wallet] Identity: ${this.userIdentityKey.slice(0, 16)}...${this.userIdentityKey.slice(-8)}`);

      return {
        identityKey: this.userIdentityKey,
        authenticated: true,
        connected: true
      };
    } catch (error) {
      console.error('[BSV Wallet] ❌ Authentication failed:', error);
      this.isConnected = false;
      throw new Error(`Failed to authenticate with wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * CREATE & BROADCAST TRANSACTION
   * 
   * BRC-100 compatible transaction creation using Babbage SDK
   * Handles micropayments, card minting, and data storage
   * 
   * @param params Transaction parameters (outputs, description, labels)
   * @returns Transaction ID and raw transaction hex
   */
  async createTransaction(params: CreateActionParams): Promise<{ txid: string; rawTx: string }> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected. Call authenticate() first.');
    }

    try {
      console.log('[BSV Wallet] Creating transaction...');
      console.log(`[BSV Wallet] Description: ${params.description || 'No description'}`);
      
      const result = await this.wallet.createAction({
        ...params,
        description: params.description || 'Spectral Quest action',
        // Add app metadata for BRC-100 compliance
        appName: this.config.appName,
        appIcon: this.config.appIcon
      });

      console.log(`[BSV Wallet] ✅ Transaction created!`);
      console.log(`[BSV Wallet] TXID: ${result.txid}`);

      return {
        txid: result.txid,
        rawTx: result.rawTx || ''
      };
    } catch (error) {
      console.error('[BSV Wallet] ❌ Transaction creation failed:', error);
      throw error;
    }
  }

  /**
   * SIGN DATA WITH USER'S KEY
   * 
   * For card metadata, timestamps, game state proofs
   * Creates cryptographic signature over data
   * 
   * @param data Data to sign (string or Buffer)
   * @returns Hex-encoded signature
   */
  async signData(data: string | Buffer): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected. Call authenticate() first.');
    }

    try {
      const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
      
      const signature = await this.wallet.createSignature({
        data: dataBuffer,
        protocolID: ['spectral-quest', this.config.appName],
        keyID: 'game-state'
      });

      return signature.toString('hex');
    } catch (error) {
      console.error('[BSV Wallet] ❌ Signing failed:', error);
      throw error;
    }
  }

  /**
   * ENCRYPT SENSITIVE GAME DATA
   * 
   * Encrypted storage of player statistics with user's key
   * Only the user can decrypt their own data
   * 
   * @param plaintext Data to encrypt
   * @returns Base64-encoded ciphertext
   */
  async encryptData(plaintext: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected. Call authenticate() first.');
    }

    try {
      const ciphertext = await this.wallet.encrypt({
        plaintext: Buffer.from(plaintext, 'utf-8'),
        protocolID: ['spectral-quest', 'game-data'],
        keyID: 'encrypted-stats'
      });

      return ciphertext.toString('base64');
    } catch (error) {
      console.error('[BSV Wallet] ❌ Encryption failed:', error);
      throw error;
    }
  }

  /**
   * DECRYPT PLAYER DATA
   * 
   * Retrieve encrypted player statistics
   * 
   * @param ciphertext Base64-encoded encrypted data
   * @returns Decrypted plaintext string
   */
  async decryptData(ciphertext: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected. Call authenticate() first.');
    }

    try {
      const plaintext = await this.wallet.decrypt({
        ciphertext: Buffer.from(ciphertext, 'base64'),
        protocolID: ['spectral-quest', 'game-data'],
        keyID: 'encrypted-stats',
        returnType: 'string'
      });

      return plaintext;
    } catch (error) {
      console.error('[BSV Wallet] ❌ Decryption failed:', error);
      throw error;
    }
  }

  /**
   * GET CURRENT USER IDENTITY
   */
  getIdentityKey(): string {
    return this.userIdentityKey;
  }

  /**
   * CHECK CONNECTION STATUS
   */
  isWalletConnected(): boolean {
    return this.isConnected;
  }

  /**
   * DISCONNECT WALLET
   * Clears connection state
   */
  disconnect(): void {
    this.isConnected = false;
    this.userIdentityKey = '';
    console.log('[BSV Wallet] Disconnected');
  }
}

// =============================================================================
// GLOBAL WALLET INSTANCE
// =============================================================================

let walletInstance: BSVWalletAdapter | null = null;

/**
 * INITIALIZE WALLET
 * 
 * Creates and authenticates wallet connection
 * Should be called once at app startup
 * 
 * @param config Wallet configuration (network, app name)
 * @returns Authenticated wallet adapter instance
 */
export async function initializeWallet(config: WalletConfig): Promise<BSVWalletAdapter> {
  if (!walletInstance) {
    console.log('[BSV Wallet] Initializing wallet adapter...');
    walletInstance = new BSVWalletAdapter(config);
    await walletInstance.authenticate();
  }
  return walletInstance;
}

/**
 * GET WALLET INSTANCE
 * 
 * Returns the global wallet instance
 * Throws error if wallet not initialized
 * 
 * @returns Wallet adapter instance
 */
export function getWallet(): BSVWalletAdapter {
  if (!walletInstance) {
    throw new Error('Wallet not initialized. Call initializeWallet() first.');
  }
  return walletInstance;
}

/**
 * RESET WALLET INSTANCE
 * 
 * For testing or reconnection scenarios
 */
export function resetWallet(): void {
  if (walletInstance) {
    walletInstance.disconnect();
  }
  walletInstance = null;
}

