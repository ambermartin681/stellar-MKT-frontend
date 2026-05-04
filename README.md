# Stellar Decentralized Marketplace

A full-stack peer-to-peer marketplace on the Stellar blockchain where buyers and sellers transact through a Soroban smart contract that handles all payment logic, escrow, delivery confirmation, and dispute resolution. Product data lives off-chain; money and rules live on-chain.

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
  - [3. Frontend](#3-frontend)
- [Smart Contract Reference](#smart-contract-reference)
  - [Functions](#functions)
  - [Events](#events)
  - [Error Codes](#error-codes)
- [API Reference](#api-reference)
- [Order Lifecycle](#order-lifecycle)
- [Dispute Resolution](#dispute-resolution)
- [Security Model](#security-model)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│    React + TypeScript + Tailwind CSS + Freighter Wallet SDK     │
│    Listings · Product detail · Orders · Seller dashboard        │
└───────────────────────────┬─────────────────────────────────────┘
                            │  REST API + Stellar transactions
┌───────────────────────────▼─────────────────────────────────────┐
│                          BACKEND                                │
│       Node.js + Express + TypeScript + Prisma + PostgreSQL      │
│       Product data · Order records · Auth · Event sync          │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐     │
│   │           HORIZON EVENT SYNC WORKER (node-cron)       │     │
│   │   Polls Stellar for contract events every 30 seconds  │     │
│   │   Auto-updates order status in DB from on-chain truth │     │
│   └───────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Signed transactions
┌───────────────────────────▼─────────────────────────────────────┐
│                   SOROBAN SMART CONTRACT                         │
│       Rust → WebAssembly · Deployed on Stellar Testnet          │
│       Escrow · Delivery confirmation · Dispute resolution        │
│       Platform fee collection · Order state enforcement          │
└─────────────────────────────────────────────────────────────────┘
```

> **Core separation of concerns:**
> - **On-chain** → payment logic, escrow, order status, dispute resolution, fee collection
> - **Off-chain** → product titles, descriptions, images, search, analytics, order history display

---

## How It Works

1. **Seller lists a product** via the frontend — title, description, price in XLM, image URL, and category are stored in the backend database. A reference ID links the listing to any on-chain order.

2. **Buyer browses listings**, connects their Freighter wallet, and clicks "Buy Now".

3. **Order is placed** — the frontend calls `place_order()` on the smart contract. XLM is transferred from the buyer into the contract (escrow). The contract assigns an `order_id` and emits a `PlacedOrder` event.

4. **Backend records the order** — the frontend POSTs the `order_id` and `txHash` to the backend, linking the on-chain order to the off-chain listing.

5. **Seller fulfils** the order off-chain (ships product, delivers service).

6. **Buyer confirms delivery** — the frontend calls `confirm_delivery()` on the contract. The contract releases funds to the seller minus the platform fee, which goes to the admin wallet.

7. **If a problem arises**, either party can call `raise_dispute()`. The contract freezes the funds and marks the order as Disputed.

8. **Admin resolves disputes** by calling `resolve_dispute()`, directing funds to either the seller (legitimate delivery) or the buyer (full refund).

9. **Event sync worker** polls Stellar Horizon every 30 seconds for contract events and auto-updates order status in the database, keeping the frontend in sync without requiring users to manually refresh.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Soroban SDK → WebAssembly |
| Blockchain | Stellar Testnet (Futurenet compatible) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Event Sync | node-cron + Stellar Horizon RPC |
| Frontend | React + TypeScript + Tailwind CSS |
| Wallet | Freighter browser extension |
| Stellar SDK | @stellar/stellar-sdk |
| State Management | React Context + React Query |

---

## Project Structure

```
stellar-marketplace/
├── contract/                         # Soroban smart contract (Rust)
│   ├── src/
│   │   ├── lib.rs                    # Contract implementation
│   │   └── test.rs                   # Unit tests
│   ├── Cargo.toml
│   └── README.md
│
├── backend/                          # Express API + event sync worker
│   ├── src/
│   │   ├── routes/
│   │   │   ├── listings.ts           # CRUD for product listings
│   │   │   └── orders.ts             # Order management
│   │   ├── middleware/
│   │   │   └── stellarAuth.ts        # Ed25519 signature verification
│   │   ├── workers/
│   │   │   └── eventSync.ts          # Horizon event polling worker
│   │   ├── lib/
│   │   │   └── horizon.ts            # Horizon RPC helpers
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── docker-compose.yml
│   ├── .env.example
│   └── package.json
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Listings grid + hero
│   │   │   ├── ListingDetail.tsx     # Product detail + Buy Now
│   │   │   ├── CreateListing.tsx     # Seller listing form
│   │   │   ├── MyOrders.tsx          # Buyer order history
│   │   │   └── SellerDashboard.tsx   # Seller orders + earnings
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TxToast.tsx           # Transaction status toasts
│   │   │   └── DisputeModal.tsx
│   │   ├── context/
│   │   │   └── WalletContext.tsx
│   │   ├── lib/
│   │   │   └── contractClient.ts     # All contract interactions
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
- Docker + Docker Compose (for local PostgreSQL)
- [Freighter wallet](https://freighter.app/) browser extension
- A funded Stellar Testnet account — get free testnet XLM at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

Install the Rust WASM target:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stellar_marketplace"
STELLAR_NETWORK="testnet"
CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
ADMIN_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
PORT=3001
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:3001"
VITE_CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VITE_STELLAR_NETWORK="testnet"
VITE_ADMIN_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

> **Never commit `.env` files.** Both directories include `.env.example` templates. Copy and fill in values before running locally.

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
  --wasm target/wasm32-unknown-unknown/release/marketplace.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet

# Initialize the contract (run once after deploy)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --fee_bps 250
```

Save the deployed `CONTRACT_ID` — you will need it in both `.env` files.

---

### 2. Backend API

```bash
cd backend

# Install dependencies
npm install

# Start local PostgreSQL
docker-compose up -d

# Run database migrations
npx prisma migrate dev --name init

# Copy env template and fill in values
cp .env.example .env

# Start development server (includes event sync worker)
npm run dev
```

The API will be available at `http://localhost:3001`.
The Horizon event sync worker starts automatically and logs to the same console.

---

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Start development server
npm run dev
```

Open `http://localhost:5173`, set Freighter to **Testnet**, and connect your wallet.

---

## Smart Contract Reference

### Storage

The contract stores only what is needed to enforce payment rules.
No product titles, images, or descriptions are stored on-chain.

```
Orders map     : order_id (u64) → OrderState
Platform config: admin (Address), fee_bps (u32)
Order counter  : next_id (u64)
```

```rust
struct OrderState {
    buyer       : Address,
    seller      : Address,
    amount      : i128,       // in stroops (1 XLM = 10_000_000)
    status      : OrderStatus,
    created_at  : u64,        // ledger timestamp
    listing_ref : Symbol,     // off-chain listing ID reference
}

enum OrderStatus { Pending, Delivered, Disputed, Resolved, Refunded }
```

---

### Functions

| Function | Authorized Caller | Description |
|---|---|---|
| `initialize(admin, fee_bps)` | Anyone (once) | Deploy-time setup. Panics if called again. |
| `place_order(buyer, seller, listing_ref, amount)` | Buyer | Escrow funds, create order, return `order_id` |
| `confirm_delivery(order_id, buyer)` | Buyer | Release escrowed funds to seller minus platform fee |
| `raise_dispute(order_id, caller)` | Buyer or Seller | Freeze funds, mark order as Disputed |
| `resolve_dispute(order_id, admin, release_to_seller)` | Admin | Direct frozen funds to seller or refund buyer |
| `get_order(order_id)` | Anyone | Read-only view of order state |
| `update_fee(admin, new_fee_bps)` | Admin | Update platform fee (max 1000 bps / 10%) |

---

### Events

| Topics | Data | Emitted By |
|---|---|---|
| `["order", "placed"]` | `{order_id, buyer, seller, amount}` | `place_order()` |
| `["order", "delivered"]` | `{order_id}` | `confirm_delivery()` |
| `["order", "disputed"]` | `{order_id, raised_by}` | `raise_dispute()` |
| `["order", "resolved"]` | `{order_id, outcome}` | `resolve_dispute()` |

The backend event sync worker subscribes to these events via Stellar Horizon and updates the `orders` table in PostgreSQL automatically.

---

### Error Codes

| Error | Meaning |
|---|---|
| `AlreadyInitialized` | `initialize()` called more than once |
| `OrderNotFound` | No order exists with that `order_id` |
| `Unauthorized` | Caller is not the required address for this action |
| `InvalidStatus` | Action not permitted for the order's current status |
| `InvalidAmount` | Amount is zero or negative |

---

## API Reference

All write endpoints require Stellar signature authentication:

```
X-Stellar-Address: G...
X-Stellar-Signature: <Ed25519 signature of SHA-256(request body JSON)>
```

### Listings

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/listings` | Seller | Create a new listing |
| `GET` | `/listings` | Public | Paginated list. Supports `?category=` filter |
| `GET` | `/listings/:id` | Public | Single listing detail |
| `PATCH` | `/listings/:id` | Seller only | Update listing fields |
| `DELETE` | `/listings/:id` | Seller only | Soft-delete (sets `isActive = false`) |

**POST /listings body:**
```json
{
  "title": "Handmade Leather Wallet",
  "description": "Full-grain leather, card slots, slim profile.",
  "priceXLM": 15.5,
  "imageUrl": "https://example.com/wallet.jpg",
  "category": "Accessories"
}
```

---

### Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | Buyer | Record order after on-chain `place_order()` tx |
| `GET` | `/orders?buyer=<addr>` | Public | Buyer's order history |
| `GET` | `/orders?seller=<addr>` | Public | Seller's incoming orders |
| `PATCH` | `/orders/:id/status` | Buyer or Seller | Update status after on-chain action |
| `GET` | `/health` | Public | Health check |

**POST /orders body:**
```json
{
  "listingId": "uuid-of-listing",
  "buyerAddress": "G...",
  "sellerAddress": "G...",
  "contractOrderId": "42",
  "txHash": "abc123..."
}
```

**PATCH /orders/:id/status body:**
```json
{
  "status": "DELIVERED",
  "txHash": "def456..."
}
```

---

## Order Lifecycle

```
                       ┌─────────┐
                       │  OPEN   │  Listing exists, no buyer yet
                       └────┬────┘
                            │  buyer calls place_order()
                       ┌────▼────┐
                       │ PENDING │  Funds held in contract escrow
                       └────┬────┘
              ┌─────────────┼─────────────┐
              │             │             │
   buyer calls         buyer or seller
   confirm_delivery()  raise_dispute()
              │             │
        ┌─────▼─────┐  ┌───▼──────┐
        │ DELIVERED │  │ DISPUTED │  Funds frozen in contract
        └───────────┘  └───┬──────┘
                           │  admin calls resolve_dispute()
              ┌────────────┼────────────┐
              │                         │
   release_to_seller=true    release_to_seller=false
              │                         │
        ┌─────▼──────┐           ┌──────▼──────┐
        │  RESOLVED  │           │  REFUNDED   │
        └────────────┘           └─────────────┘
```

**Status meanings:**

| Status | Funds Location | Who Can Act |
|---|---|---|
| `PENDING` | Contract escrow | Buyer (confirm or dispute), Seller (dispute) |
| `DELIVERED` | Seller's wallet | — terminal state |
| `DISPUTED` | Contract escrow (frozen) | Admin only |
| `RESOLVED` | Seller's wallet | — terminal state |
| `REFUNDED` | Buyer's wallet | — terminal state |

---

## Dispute Resolution

Disputes are handled by the platform admin — a trusted keypair controlled by the marketplace operator.

**How to raise a dispute (buyer or seller):**

1. Navigate to the order in the dashboard
2. Click "Raise Dispute" and confirm in Freighter
3. Frontend calls `raise_dispute(order_id, caller)` on the contract
4. Funds are frozen in the contract
5. Order status updates to `DISPUTED` in the frontend

**How the admin resolves:**

```bash
# Release to seller (dispute decided in seller's favour)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- resolve_dispute \
  --order_id 42 \
  --admin <ADMIN_ADDRESS> \
  --release_to_seller true

# Refund buyer (dispute decided in buyer's favour)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- resolve_dispute \
  --order_id 42 \
  --admin <ADMIN_ADDRESS> \
  --release_to_seller false
```

> **Note:** Admin resolution currently uses the Stellar CLI. A future version will include an in-app admin panel with one-click dispute resolution.

---

## Security Model

| Concern | Mitigation |
|---|---|
| Buyer pays but seller never ships | Buyer can raise a dispute — funds remain in escrow until resolved |
| Seller claims delivery without shipping | Buyer controls `confirm_delivery()` — funds never release without buyer action |
| Admin steals escrowed funds | Dispute resolution only directs funds to buyer or seller — admin receives platform fee only |
| Unauthorized `confirm_delivery()` | Contract checks `caller == order.buyer` — any other address is rejected with `Unauthorized` |
| Unauthorized `resolve_dispute()` | Contract checks `caller == admin` stored at initialize time |
| Backend tampering with order status | Event sync worker reads on-chain state as source of truth — backend is a mirror only |
| API write abuse | All write endpoints require valid Ed25519 Stellar signature — no JWT, no sessions |
| Fee abuse | Fee capped at 1000 bps (10%) in the contract — cannot be overridden by backend |
| Double-spending | Contract rejects actions on orders not in the required status |

---

## Testing

### Smart Contract

```bash
cd contract
cargo test

# Expected:
# test test_happy_path_place_confirm ... ok
# test test_dispute_resolved_seller ... ok
# test test_dispute_resolved_buyer_refund ... ok
# test test_unauthorized_confirm ... ok
# test test_unauthorized_resolve ... ok
# test test_invalid_status_transitions ... ok
# test test_double_initialize ... ok
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

### End-to-End on Testnet

1. Deploy contract and record `CONTRACT_ID`
2. Fund three test accounts: buyer, seller, admin via [Stellar Laboratory](https://laboratory.stellar.org)
3. Start backend and verify `/health` returns `200`
4. Start frontend, connect Freighter (Testnet), create a test listing as seller
5. Switch to buyer wallet, purchase the listing, confirm the escrow tx on [Stellar Testnet Explorer](https://testnet.stellarchain.io)
6. Confirm delivery as buyer, verify funds appear in seller wallet
7. Test dispute flow: place a second order, raise a dispute, resolve as admin via CLI

---

## Deployment

### Contract (Testnet → Mainnet)

```bash
# Build optimized WASM
cargo build --target wasm32-unknown-unknown --release

# Optimize for mainnet
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/marketplace.wasm

# Deploy to mainnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/marketplace.optimized.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network mainnet

# Initialize
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network mainnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --fee_bps 250
```

### Backend (Production)

```bash
# Build TypeScript
npm run build

# Run migrations against production DB
DATABASE_URL=<PROD_DB_URL> npx prisma migrate deploy

# Start server
node dist/index.js
```

Recommended: deploy via Docker or a managed Node.js host (Railway, Render, Fly.io). Inject secrets via your platform's secret manager — never commit `.env` to source control.

### Frontend (Production)

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, Cloudflare Pages, or any static host
```

Update `VITE_API_URL` to your production backend URL before building.

---

## Troubleshooting

**"OrderNotFound" when confirming delivery**
The `contractOrderId` stored in the backend may not match what was returned by `place_order()`. Check the transaction receipt on [Stellar Testnet Explorer](https://testnet.stellarchain.io) for the correct on-chain `order_id`.

**Freighter shows "Transaction Failed"**
Check that the buyer's XLM balance covers the order amount plus transaction fee (~0.001 XLM). Ensure the contract is initialized — try calling `get_order(0)` via Stellar CLI to confirm the contract is reachable.

**Event sync worker not updating order status**
Verify `CONTRACT_ID` in backend `.env` matches the deployed contract exactly. Check that Horizon is reachable: `curl https://horizon-testnet.stellar.org`. Worker logs appear in the backend console prefixed with `[EventSync]`.

**Seller dashboard shows no orders**
Confirm the `sellerAddress` in the POST `/orders` request exactly matches the seller's Stellar public key. Keys are case-sensitive with no leading or trailing whitespace.

**"Unauthorized" on listing creation or update**
The `X-Stellar-Signature` header must be an Ed25519 signature of the SHA-256 hash of the raw request body JSON, signed by the private key corresponding to `X-Stellar-Address`. Review the signing logic in `contractClient.ts`.

**Admin dispute resolution fails**
The `admin` address stored in the contract is set at `initialize()` time and cannot be changed. Confirm `ADMIN_ADDRESS` in your `.env` is the exact address used during deployment.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run all tests before committing: `cargo test && npm test`
4. Open a pull request with a clear description of what changed and which layer it affects

**Contribution rule:** Payment logic belongs in the contract. Product data belongs in the backend. PRs that move fund-handling logic into the Express API will not be accepted.

---

## Roadmap

- [ ] In-app admin dispute panel (currently CLI only)
- [ ] USDC payments via SEP-41 token standard
- [ ] On-chain order timeout — auto-refund buyer after N days with no delivery confirmation
- [ ] Seller reputation scores derived from on-chain delivery events
- [ ] IPFS integration for decentralized image and product data storage
- [ ] Multi-currency price display with live XLM conversion rates
- [ ] Mobile app (React Native + Freighter mobile SDK)

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
Built on <a href="https://stellar.org">Stellar</a> · Powered by <a href="https://soroban.stellar.org">Soroban</a>
</div>
