/**
 * contractClient.ts — Phase 4
 *
 * Wires the React frontend to the deployed Soroban marketplace contract.
 * Uses @stellar/stellar-sdk to build XDR transactions, Freighter to sign
 * them, and Horizon to submit and confirm.
 *
 * All monetary values are in XLM on the public API surface; internally
 * they are converted to stroops (1 XLM = 10_000_000 stroops).
 */

import {
  Contract,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
  Address,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// ─── Config ───────────────────────────────────────────────────────────────────

const NETWORK = (import.meta.env.VITE_STELLAR_NETWORK ?? 'TESTNET') as
  | 'TESTNET'
  | 'PUBLIC';

const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ??
  'https://soroban-testnet.stellar.org';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? '';

// Native XLM token contract address on testnet
const XLM_TOKEN_ADDRESS =
  import.meta.env.VITE_XLM_TOKEN_ADDRESS ??
  'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

const NETWORK_PASSPHRASE =
  NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;

const XLM_TO_STROOPS = 10_000_000n;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * Number(XLM_TO_STROOPS)));
}

function getServer(): SorobanRpc.Server {
  return new SorobanRpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
}

/**
 * Build, simulate, sign (via Freighter), and submit a Soroban transaction.
 * Returns the transaction hash on success.
 */
async function invokeContract(
  sourceAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<{ txHash: string; result: xdr.ScVal | null }> {
  if (!CONTRACT_ID) {
    throw new Error('VITE_CONTRACT_ID is not set in .env');
  }

  const server = getServer();

  // Load source account
  const account = await server.getAccount(sourceAddress);

  const contract = new Contract(CONTRACT_ID);

  // Build transaction
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate to get footprint + resource fees
  const simResult = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  // Assemble the transaction with simulation data
  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();

  // Sign via Freighter
  const signResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (signResult.error) {
    throw new Error(`Freighter signing failed: ${signResult.error}`);
  }

  // Submit to Soroban RPC
  const submitResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE)
  );

  if (submitResult.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${submitResult.errorResult}`);
  }

  const txHash = submitResult.hash;

  // Poll for confirmation
  let getResult = await server.getTransaction(txHash);
  let attempts = 0;
  const MAX_ATTEMPTS = 20;

  while (
    getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
    attempts < MAX_ATTEMPTS
  ) {
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await server.getTransaction(txHash);
    attempts++;
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed on-chain: ${txHash}`);
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error(`Transaction not confirmed after ${MAX_ATTEMPTS} attempts: ${txHash}`);
  }

  // Extract return value
  const returnVal =
    getResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS
      ? (getResult as SorobanRpc.Api.GetSuccessfulTransactionResponse).returnValue ?? null
      : null;

  return { txHash, result: returnVal };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Place an order: escrow `amountXLM` from the connected wallet to the contract.
 * Returns the on-chain order_id and the transaction hash.
 */
export async function placeOrder(
  buyerAddress: string,
  sellerAddress: string,
  listingRef: string,
  amountXLM: number
): Promise<{ contractOrderId: string; txHash: string }> {
  const stroops = xlmToStroops(amountXLM);

  const args: xdr.ScVal[] = [
    new Address(buyerAddress).toScVal(),
    new Address(sellerAddress).toScVal(),
    nativeToScVal(listingRef, { type: 'symbol' }),
    nativeToScVal(stroops, { type: 'i128' }),
    new Address(XLM_TOKEN_ADDRESS).toScVal(),
  ];

  const { txHash, result } = await invokeContract(buyerAddress, 'place_order', args);

  if (!result) {
    throw new Error('place_order returned no result');
  }

  const orderId: bigint = scValToNative(result) as bigint;
  return { contractOrderId: orderId.toString(), txHash };
}

/**
 * Buyer confirms delivery: releases escrowed funds to the seller.
 */
export async function confirmDelivery(
  buyerAddress: string,
  contractOrderId: string
): Promise<{ txHash: string }> {
  const args: xdr.ScVal[] = [
    nativeToScVal(BigInt(contractOrderId), { type: 'u64' }),
    new Address(buyerAddress).toScVal(),
    new Address(XLM_TOKEN_ADDRESS).toScVal(),
  ];

  const { txHash } = await invokeContract(buyerAddress, 'confirm_delivery', args);
  return { txHash };
}

/**
 * Buyer or seller raises a dispute on a pending order.
 */
export async function raiseDispute(
  callerAddress: string,
  contractOrderId: string
): Promise<{ txHash: string }> {
  const args: xdr.ScVal[] = [
    nativeToScVal(BigInt(contractOrderId), { type: 'u64' }),
    new Address(callerAddress).toScVal(),
  ];

  const { txHash } = await invokeContract(callerAddress, 'raise_dispute', args);
  return { txHash };
}

/**
 * Admin resolves a disputed order.
 */
export async function resolveDispute(
  adminAddress: string,
  contractOrderId: string,
  releaseToSeller: boolean
): Promise<{ txHash: string }> {
  const args: xdr.ScVal[] = [
    nativeToScVal(BigInt(contractOrderId), { type: 'u64' }),
    new Address(adminAddress).toScVal(),
    nativeToScVal(releaseToSeller, { type: 'bool' }),
    new Address(XLM_TOKEN_ADDRESS).toScVal(),
  ];

  const { txHash } = await invokeContract(adminAddress, 'resolve_dispute', args);
  return { txHash };
}
