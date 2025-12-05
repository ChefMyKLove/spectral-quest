# Quick Start: BSV Integration Testing

## 🚀 Phase 1 Complete!

The wallet adapter layer is now integrated. Here's how to test it:

### Step 1: Install Metanet Desktop Wallet

1. Download: https://metanet.app/
2. Install and launch
3. **Switch to TESTNET mode** (important for development!)
4. Create or import a wallet

### Step 2: Get Testnet BSV

- Visit: https://faucet.bitcoincloud.net/
- Enter your testnet address
- Receive free testnet BSV

### Step 3: Run the Game

```bash
npm run dev
```

Open: http://localhost:5173

### Step 4: Connect Wallet

1. On the main menu, click **"🔗 Connect Wallet"**
2. Metanet Desktop Wallet should prompt for connection
3. Approve the connection
4. You should see: **"🔗 Wallet: Connected"** in green

### What's Working Now

✅ **Wallet Connection** - BRC-100 compatible wallet adapter  
✅ **Authentication** - Authrite protocol for secure identity  
✅ **UI Integration** - Wallet status displayed on main menu  
✅ **Error Handling** - Graceful fallback if wallet unavailable  

### What's Next (Phase 2)

- Card minting (1Sat Ordinals)
- Micropayment system
- Transaction builders

### Troubleshooting

**"Wallet not connected"**
- Make sure Metanet Desktop Wallet is running
- Check wallet is in TESTNET mode
- Try clicking "Connect Wallet" again

**"Authentication failed"**
- Check browser console for errors
- Make sure wallet popup isn't blocked
- Verify wallet is unlocked

**Console Logs**
All BSV operations log with `[BSV Wallet]` prefix - check browser console!

---

For detailed testing guide, see: [BSV_TESTING_SETUP.md](./BSV_TESTING_SETUP.md)

