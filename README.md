# BOT WhaleTrace

A dedicated **BOT Chain Testnet** large-transfer analysis tool that identifies significant token movements, converts amounts using accurate token decimals, ranks dominant transacting wallets, and provides verifiable on-chain registry integration.

---

## Network Parameters (BOT Chain Testnet)

- **Network Name**: BOT Chain Testnet
- **Chain ID**: `968`
- **RPC URL**: `https://rpc.bohr.life`
- **Native Currency**: `BOT` (18 decimals)
- **Explorer**: [https://scan.bohr.life/](https://scan.bohr.life/)

---

## Environment Setup (`.env`)

A `.env` file has been created at the root of the project:

```env
# BOT Chain Testnet Configuration
# Paste your private key below for smart contract deployment
PRIVATE_KEY=

# Reown AppKit Project ID (kept private on server side)
REOWN_ID=

# BOT Chain Testnet RPC and Explorer
RPC_URL=https://rpc.bohr.life
CHAIN_ID=968
EXPLORER_URL=https://scan.bohr.life/

# Deployed Contract Address (optional, auto-configured after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

> **Security Note**: `REOWN_ID` is strictly server-side and never exposed as `VITE_` or `NEXT_PUBLIC_` to client bundles.

---

## Running the Application

### 1. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Smart Contract Tests
```bash
npm run test:contracts
```

### 3. Deploy `BOTWhaleTrace.sol` to BOT Chain Testnet
Once you paste your testnet `PRIVATE_KEY` in `.env`:
```bash
npm run deploy
```
The script will deploy `BOTWhaleTrace.sol` to BOT Chain Testnet and automatically save the deployed address and ABI to `src/contracts/deployment.json`.

---

## Features

- **Flat, Normal Color Palette**: Utilitarian, matte dark slate design strictly without glossy textures or gradients.
- **Whale Dashboard**:
  - Exact expected result summary card.
  - Transfer volume charts across block ranges.
  - Frequently active large-transfer addresses leaderboard.
  - Detailed transaction explorer with sender, recipient, amount, token, block, and explorer links.
- **Inspection Form**:
  - Native BOT / ERC-20 toggle with contract decimals normalization.
  - Minimum transfer threshold.
  - Starting & Ending block selectors with live chain head synchronization.
  - Optional wallet address filter.
- **Transparent Threshold Explanation**: Grounded criteria explaining why transfers and wallets are classified as whales.
- **Smart Contract Registry**:
  - `requestWhaleAnalysis(...)`
  - `getRequest(...)`
  - `publishResult(...)`

