/**
 * BSV CONFIGURATION
 * 
 * Centralized configuration for BSV blockchain integration
 */

export const BSV_CONFIG = {
  // Network selection
  NETWORK: (import.meta.env.VITE_BSV_NETWORK as 'mainnet' | 'testnet') || 'testnet',
  
  // App metadata
  APP_NAME: 'Spectral Quest',
  APP_ICON: undefined, // Optional: URL to app icon
  
  // Micropayment amounts (in satoshis)
  MICROPAYMENTS: {
    MENTOR_REWARD: 1000,        // 1000 satoshis ≈ $0.01
    RETRY_FEE: 100,             // 100 satoshis ≈ $0.001
    LEVEL_UNLOCK_FEE: [
      500,   // Level 1 (Crimson)
      750,   // Level 2 (Amber)
      1000,  // Level 3 (Yellow)
      1500,  // Level 4 (Green)
      2000,  // Level 5 (Blue)
      2500,  // Level 6 (Indigo)
      3500   // Level 7 (Violet)
    ]
  },
  
  // Transaction labels for organization
  LABELS: {
    CARD_MINT: 'spectral-quest-card',
    MENTOR_REWARD: 'spectral-quest-mentor',
    RETRY_FEE: 'spectral-quest-retry',
    LEVEL_UNLOCK: 'spectral-quest-unlock',
    STATS_ANCHOR: 'spectral-quest-stats'
  }
} as const;

/**
 * Get level unlock fee
 */
export function getLevelUnlockFee(levelIndex: number): number {
  if (levelIndex < 0 || levelIndex >= BSV_CONFIG.MICROPAYMENTS.LEVEL_UNLOCK_FEE.length) {
    throw new Error(`Invalid level index: ${levelIndex}`);
  }
  return BSV_CONFIG.MICROPAYMENTS.LEVEL_UNLOCK_FEE[levelIndex];
}

