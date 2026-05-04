# Stellar Subscription Billing

A decentralized recurring payments platform built on the Stellar blockchain. Users subscribe to plans once, approve a token allowance, and are billed automatically on a 30-day cycle enforced by a Soroban smart contract.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [1. Smart Contract](#1-smart-contract)
  - [2. Backend API](#2-backend-api)
  - [3. Billing Worker](#3-billing-worker)
  - [4. Frontend](#4-frontend)
- [Smart Contract Reference](#smart-contract-reference)
  - [Functions](#functions)
  - [Events](#events)
  - [Error Codes](#error-codes)
- [API Reference](#api-reference)
- [Subscription Plans](#subscription-plans)
- [Billing Worker](#billing-worker)
- [Security Model](#security-model)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   React + TypeScript + Tailwind + Freighter Wallet SDK      │
│   Subscribe flow · Dashboard · Allowance health · Admin     │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API calls + Stellar txs
┌───────────────────────▼─────────────────────────────────────┐
│                       BACKEND                               │
│   Node.js + Express + Prisma + PostgreSQL                   │
│   Subscription records · Billing history · Auth middleware  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              BILLING WORKER (node-cron)             │   │
│   │  Runs every 5 min · Detects due subscriptions ·    │   │
│   │  Signs & submits process_billing() transactions     │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ Signed transactions
┌──────────────────────────────▼──────────────────────────────┐
│                   SOROBAN SMART CONTRACT                     │
│   Rust → WebAssembly · Deployed on Stellar Testnet          │
│   Validates timing · Pulls tokens · Enforces rules          │
│   Never self-executes — always invoked externally           │
└─────────────────────────────────────────────────────────────┘
```

> **Key architectural rule:** Soroban contracts are passive. The contract enforces *when* and *how* money moves. The billing worker is the clock that triggers each cycle. These responsibilities must never be mixed.

---

## How It Works

1. **User connects** their Freighter wallet and selects a plan.
2. **Allowance approval** — user approves 12× the monthly amount on the SEP-41 token contract (covers a full year without re-approval).
3. **Subscribe** — frontend calls `subscribe()` on the contract. First payment is collected immediately. Backend records the subscription.
4. **Every 5 minutes**, the billing worker queries the database for subscriptions where `next_due_at <= now()`.
5. **Pre-flight check** — worker reads on-chain state via Horizon RPC to confirm the contract also considers the subscription due.
6. **Billing transaction** — worker signs and submits `process_billing(subscriber, relayer)` using the relayer keypair.
7. **Contract validates** — checks interval elapsed, status is Active, and allowance is sufficient. Transfers tokens, updates state, emits event.
8. **Database synced** — worker updates `last_billed_at`, `next_due_at`, and creates a `BillingEvent` record.
9. **User can** pause, resume, cancel, or upgrade their plan at any time via the dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Soroban SDK → WebAssembly |
| Blockchain | Stellar Testnet (Futurenet compatible) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Billing Worker | node-cron |
| Frontend | React + TypeScript + Tailwind CSS |
| Wallet | Freighter browser extension |
| Stellar SDK | @stellar/stellar-sdk |
| Token Standard | SEP-41 (Stellar token standard) |

---

## Project Structure

```
stellar-subscription/
├── contract/                    # Soroban smart contract (Rust)
│   ├── src/
│   │   ├── lib.rs               # Contract implementation
│   │   └── test.rs              # Unit tests
│   ├── Cargo.toml
│   └── README.md
│
├── backend/                     # Express API + billing worker
│   ├── src/
│   │   ├── routes/
│   │   │   ├── subscriptions.ts
│   │   │   └── admin.ts
│   │   ├── middleware/
│   │   │   └── stellarAuth.ts   # Ed25519 signature verification
│   │   ├── workers/
│   │   │   └── billingWorker.ts # node-cron billing engine
│   │   ├── lib/
│   │   │   └── horizon.ts       # Horizon RPC helpers
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── docker-compose.yml
│   ├── .env.example
│   └── package.json
│
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Subscribe.tsx    # Multi-step subscribe flow
│   │   │   ├── Dashboard.tsx
│   │   │   └── Admin.tsx
│   │   ├── components/
│   │   │   ├── PlanCard.tsx
│   │   │   ├── AllowanceBar.tsx
│   │   │   ├── BillingHistory.tsx
│   │   │   └── TxToast.tsx      # Transaction status toasts
│   │   ├── context/
│   │   │   └── WalletContext.tsx
│   │   ├── lib/
│   │   │   └── contractClient.ts # All contract interactions
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- [Rust](https://rustup.rs/) + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- Node.js >= 18
- Docker + Docker Compose (for local Postgres)
- [Freighter wallet](https://freighter.app/) browser extension (for testing)
- A funded Stellar Testnet account ([get testnet XLM](https://laboratory.stellar.org/#account-creator?network=test))

Install the Rust WASM target:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stellar_billing"
STELLAR_NETWORK="testnet"
CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TOKEN_CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
RELAYER_SECRET_KEY="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
PORT=3001
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:3001"
VITE_CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VITE_TOKEN_CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VITE_STELLAR_NETWORK="testnet"
VITE_RELAYER_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

> **Never commit `.env` files.** Both directories include `.env.example` templates. The `RELAYER_SECRET_KEY` must never be exposed client-side.

---

## Getting Started

### 1. Smart Contract

```bash
cd contract

# Build
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test

# Deploy to Stellar Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/subscription_billing.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet

# Initialize (run once after deploy)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --token <TOKEN_CONTRACT_ID> \
  --fee_bps 150
```

Save the deployed `CONTRACT_ID` — you'll need it in both `.env` files.

---

### 2. Backend API

```bash
cd backend

# Install dependencies
npm install

# Start local Postgres
docker-compose up -d

# Run migrations
npx prisma migrate dev --name init

# Copy env and fill in values
cp .env.example .env

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`.

---

### 3. Billing Worker

The billing worker starts automatically with the backend. To verify it's running:

```bash
# Worker logs appear in the backend console:
# [BillingWorker] Run complete — checked: 5, billed: 2, failed: 0, skipped: 3
```

To run the worker standalone for debugging:

```bash
npm run worker
```

---

### 4. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env and fill in values
cp .env.example .env

# Start development server
npm run dev
```

Open `http://localhost:5173` and connect your Freighter wallet (set to Testnet).

---

## Smart Contract Reference

### Functions

| Function | Caller | Description |
|---|---|---|
| `initialize(admin, token, fee_bps)` | Admin (once) | Deploy-time setup |
| `subscribe(subscriber, plan, relayer)` | Subscriber | Create subscription + collect first payment |
| `process_billing(subscriber, caller)` | Relayer | Collect recurring payment for due subscription |
| `pause_subscription(subscriber)` | Subscriber | Pause billing |
| `resume_subscription(subscriber)` | Subscriber | Resume from pause (starts fresh 30-day cycle) |
| `cancel_subscription(subscriber)` | Subscriber | Permanently cancel |
| `change_plan(subscriber, new_plan)` | Subscriber | Switch tier mid-cycle |
| `get_subscription(subscriber)` | Anyone | Read subscription state |
| `update_fee(admin, new_fee_bps)` | Admin | Update platform fee (max 5%) |

### Events

All events are emitted to the Stellar event stream and can be observed via Horizon.

| Topic | Data | Trigger |
|---|---|---|
| `["sub", "created"]` | `{subscriber, plan, amount}` | New subscription |
| `["sub", "billed"]` | `{subscriber, amount, next_due_at}` | Successful billing cycle |
| `["sub", "paused"]` | `{subscriber}` | Subscription paused |
| `["sub", "resumed"]` | `{subscriber}` | Subscription resumed |
| `["sub", "cancelled"]` | `{subscriber}` | Subscription cancelled |
| `["sub", "plan_changed"]` | `{subscriber, new_plan}` | Plan upgrade or downgrade |

### Error Codes

| Error | Meaning |
|---|---|
| `NotInitialized` | Contract not yet initialized |
| `AlreadyInitialized` | `initialize()` called more than once |
| `Unauthorized` | Caller is not the required address |
| `NotFound` | Subscription does not exist |
| `InvalidStatus` | Action not valid for current status |
| `TooEarly` | Billing interval has not elapsed |
| `InsufficientAllowance` | Subscriber's token allowance is too low |
| `InvalidPlan` | Unknown plan tier supplied |

---

## API Reference

All write endpoints require Stellar signature headers:

```
X-Stellar-Address: G...
X-Stellar-Signature: <Ed25519 signature of SHA-256(request body)>
```

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/subscriptions` | Subscriber | Record new subscription after on-chain tx |
| `GET` | `/subscriptions/:address` | Public | Get subscription + billing history |
| `PATCH` | `/subscriptions/:address/pause` | Subscriber | Record pause |
| `PATCH` | `/subscriptions/:address/resume` | Subscriber | Record resume |
| `PATCH` | `/subscriptions/:address/cancel` | Subscriber | Record cancellation |
| `PATCH` | `/subscriptions/:address/plan` | Subscriber | Record plan change |
| `GET` | `/subscriptions/:address/history` | Public | Full billing event log |
| `GET` | `/admin/due-now` | Relayer | List subscriptions due for billing |
| `GET` | `/health` | Public | Health check |

---

## Subscription Plans

| Plan | Monthly Cost | Amount (Stroops) |
|---|---|---|
| Basic | 1 XLM | 10,000,000 |
| Pro | 5 XLM | 50,000,000 |
| Enterprise | 20 XLM | 200,000,000 |

> 1 XLM = 10,000,000 stroops. Prices are set in the contract and can only be changed by deploying a new contract version.

**Recommended allowance:** Approve 12× the monthly amount on first subscribe. This covers a full year without requiring the user to re-approve.

---

## Billing Worker

The worker is the only component that holds the `RELAYER_SECRET_KEY`. It runs inside the backend process on a 5-minute cron schedule.

**Run loop:**

```
Every 5 minutes:
  1. Query DB for ACTIVE subscriptions where next_due_at <= now() + 2min buffer
  2. For each due subscription (max 10 concurrent):
     a. Read on-chain state via Horizon RPC (pre-flight check)
     b. Skip if contract says TooEarly or not Active
     c. Build + sign process_billing() transaction with relayer keypair
     d. Submit to Stellar Horizon, await confirmation
     e. On success: update DB, create BillingEvent { type: BILLED }
     f. On failure: create BillingEvent { type: FAILED }, retry next run
  3. After 3 consecutive failures: flag subscription as needsAttention=true
```

**What the worker cannot do:** steal funds, fabricate billing cycles, or process subscriptions that the contract considers not yet due. The contract is the final authority.

---

## Security Model

| Concern | Mitigation |
|---|---|
| Relayer key compromise | Key can only trigger legitimate billing — cannot redirect funds. Rotate key via `update_relayer()` |
| Early billing | Contract rejects any call where `now < next_due_at` with `TooEarly` error |
| Unauthorized billing | Contract checks `caller == stored_relayer` before processing |
| Insufficient allowance | Contract checks SEP-41 allowance before transfer; billing fails cleanly |
| Backend data tampering | On-chain state is the source of truth; backend mirrors it only for query speed |
| API write access | All write endpoints require valid Ed25519 Stellar signature — no JWT, no sessions |
| Admin abuse | Fee is capped at 500 bps (5%) in the contract; cannot be overridden by backend |

---

## Testing

### Smart Contract

```bash
cd contract
cargo test

# Expected output:
# test test_happy_path ... ok
# test test_too_early ... ok
# test test_pause_resume ... ok
# test test_cancel_blocks_billing ... ok
# test test_unauthorized_relayer ... ok
# test test_insufficient_allowance ... ok
# test test_plan_change ... ok
```

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### End-to-End (Testnet)

1. Deploy contract to Testnet and record `CONTRACT_ID`
2. Fund three test accounts (subscriber, relayer, admin) via [Stellar Laboratory](https://laboratory.stellar.org)
3. Start backend + billing worker
4. Start frontend, connect Freighter on Testnet
5. Subscribe with a test account → verify on-chain via [Stellar Testnet Explorer](https://testnet.stellarchain.io)
6. Fast-forward test: manually update `next_due_at` in DB to `now()`, wait for worker run, verify billing event

---

## Deployment

### Contract (Testnet → Mainnet)

```bash
# Build optimized WASM
cargo build --target wasm32-unknown-unknown --release

# Optimize (recommended for mainnet)
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/subscription_billing.wasm

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/subscription_billing.optimized.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network mainnet
```

### Backend (Production)

```bash
# Build
npm run build

# Run migrations against production DB
DATABASE_URL=<PROD_URL> npx prisma migrate deploy

# Start
node dist/index.js
```

Use a process manager like PM2 or deploy via Docker. Ensure `RELAYER_SECRET_KEY` is injected via your secrets manager (not a `.env` file in production).

### Frontend (Production)

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, Cloudflare Pages, or any static host
```

---

## Troubleshooting

**Billing worker not triggering**
- Check `RELAYER_SECRET_KEY` is set and the relayer account has enough XLM for transaction fees (~0.001 XLM per billing tx)
- Confirm the relayer address matches what was stored in the contract during `subscribe()`

**`TooEarly` errors in worker logs**
- Normal — this happens when the DB buffer window (2 min) catches subscriptions slightly before the contract considers them due. The worker skips and retries silently.

**`InsufficientAllowance` failures**
- The subscriber's token allowance has been exhausted. The `needsAttention` flag will be set in the DB. The frontend dashboard shows a warning prompting the user to re-approve.

**Freighter not connecting**
- Ensure Freighter is set to **Testnet** (not Mainnet) in the extension settings.

**Contract deploy fails**
- Confirm your source account is funded: `stellar account show --network testnet G...`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests before committing: `cargo test && npm test`
4. Open a pull request with a clear description of the change

Please follow the architectural rule: **payment logic belongs in the contract, data belongs in the backend.** PRs that add payment-related logic to the backend will be rejected.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
Built on <a href="https://stellar.org">Stellar</a> · Powered by <a href="https://soroban.stellar.org">Soroban</a>
</div>
