# BSV Testing Setup Guide

This guide will help you set up and test all BSV blockchain features in Spectral Quest.

## Prerequisites

### 1. Install Metanet Desktop Wallet

**Download:** [Metanet Desktop Wallet](https://metanet.app/)

**Installation Steps:**
1. Download the installer for your OS (Windows/Mac/Linux)
2. Install and launch the wallet
3. Create a new wallet or import existing
4. **Important:** Switch to **TESTNET** mode for development
   - Look for network toggle in settings
   - Testnet uses test BSV (free, no real money)

### 2. Get Testnet BSV

**Option A: Testnet Faucet**
- Visit: https://faucet.bitcoincloud.net/
- Enter your testnet address
- Receive free testnet BSV

**Option B: Testnet Exchange**
- Some exchanges offer testnet BSV
- Or ask in BSV developer communities

### 3. Enable Browser Extension (if needed)

Metanet Desktop Wallet should work via BRC-100 protocol automatically. If you need browser extension:

1. Check if Metanet has browser extension
2. Install and connect to testnet
3. Approve connection requests from the game

---

## Testing Workflow

### Step 1: Start Development Server

```bash
npm run dev
```

The game will start at `http://localhost:5173`

### Step 2: Connect Wallet

1. Open the game in your browser
2. Click "🔗 Connect Wallet" button on main menu
3. Metanet Desktop Wallet should prompt for connection
4. Approve the connection
5. You should see "🔗 Connected" status in the game

### Step 3: Test Each Feature

#### ✅ Test 1: Wallet Connection
- **Location:** Main Menu
- **Action:** Click "Connect Wallet"
- **Expected:** Wallet popup appears, connection successful
- **Verify:** Check console for `[BSV Wallet] ✅ Authenticated!`

#### ✅ Test 2: Card Minting (Level Complete)
- **Location:** After completing any level
- **Action:** Click "MINT CARD" button
- **Expected:** 
  - Transaction popup in wallet
  - Card metadata inscribed on-chain
  - TXID displayed in game
- **Verify:** 
  - Check console for transaction ID
  - View transaction on testnet explorer: https://test.whatsonchain.com/

#### ✅ Test 3: Mentor Token Rewards
- **Location:** During gameplay
- **Action:** Touch a mentor (color-coded unicorn)
- **Expected:**
  - Micropayment sent immediately (1000 satoshis)
  - Wallet may batch multiple payments
- **Verify:**
  - Check wallet balance (should increase)
  - Check console for transaction logs

#### ✅ Test 4: Death Retry Payment
- **Location:** After losing a life
- **Action:** Click "START" button in death modal
- **Expected:**
  - Small payment (100 satoshis) charged
  - Level restarts
- **Verify:**
  - Check wallet balance (should decrease slightly)
  - Transaction appears in wallet history

#### ✅ Test 5: Level Unlock Payment
- **Location:** Main Menu or Level Complete screen
- **Action:** Start new level or continue to next level
- **Expected:**
  - Progressive unlock fee charged (500-3500 satoshis)
  - Level unlocks and starts
- **Verify:**
  - Fee increases per level
  - Transaction recorded

#### ✅ Test 6: Stats Anchoring (Game Over)
- **Location:** Game Over screen
- **Action:** Complete a full run (all 7 levels or game over)
- **Expected:**
  - Final stats inscribed on-chain via OP_RETURN
  - Leaderboard proof created
- **Verify:**
  - Check transaction on explorer
  - OP_RETURN data contains JSON stats

---

## Debugging

### Check Console Logs

All BSV operations log to browser console with `[BSV Wallet]` prefix:

```
[BSV Wallet] Initializing wallet adapter...
[BSV Wallet] Starting authentication...
[BSV Wallet] ✅ Authenticated!
[BSV Wallet] Identity: 02a1b2c3d4e5f6...
[BSV Wallet] Creating transaction...
[BSV Wallet] ✅ Transaction created!
[BSV Wallet] TXID: abc123def456...
```

### Common Issues

#### ❌ "Wallet not connected"
- **Solution:** Make sure Metanet Desktop Wallet is running
- **Solution:** Check that wallet is in TESTNET mode
- **Solution:** Try disconnecting and reconnecting

#### ❌ "Insufficient balance"
- **Solution:** Get more testnet BSV from faucet
- **Solution:** Check wallet balance in Metanet app

#### ❌ "Transaction failed"
- **Solution:** Check network connection
- **Solution:** Verify wallet is unlocked
- **Solution:** Check console for detailed error

#### ❌ "Authentication timeout"
- **Solution:** Make sure wallet popup isn't blocked
- **Solution:** Check wallet is running and responsive

### Network Switching

To switch between testnet and mainnet:

1. **Environment Variable:**
   ```bash
   # .env file
   VITE_BSV_NETWORK=testnet  # or 'mainnet'
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Reconnect wallet** (wallet must match network)

---

## Testnet Resources

- **Explorer:** https://test.whatsonchain.com/
- **Faucet:** https://faucet.bitcoincloud.net/
- **Testnet Docs:** https://docs.bsvblockchain.org/

---

## Production Checklist

Before deploying to mainnet:

- [ ] Switch `VITE_BSV_NETWORK` to `mainnet`
- [ ] Test all features on testnet thoroughly
- [ ] Verify transaction fees are acceptable
- [ ] Test with real BSV wallet (small amounts)
- [ ] Security audit of transaction builders
- [ ] User documentation for wallet setup

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Metanet Desktop Wallet logs
3. Verify network connectivity
4. Test with minimal transaction first
5. Check BSV network status

For BSV-specific questions:
- BSV Discord: [Join BSV Discord]
- Project Babbage Docs: https://docs.projectbabbage.com/
- BSV Association Docs: https://docs.bsvblockchain.org/

