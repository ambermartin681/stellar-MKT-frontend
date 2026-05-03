import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import type { TransactionStatus } from '../types';

const EXPLORER_BASE = 'https://testnet.stellarchain.io/transactions';

interface ToastContentProps {
  status: TransactionStatus;
  txHash?: string;
  error?: string;
}

function ToastContent({ status, txHash, error }: ToastContentProps) {
  if (status === 'signing') {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-stellar-500 animate-spin shrink-0" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            Waiting for signature
          </p>
          <p className="text-gray-500 text-xs">
            Please approve in Freighter wallet
          </p>
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            Submitting transaction
          </p>
          <p className="text-gray-500 text-xs">Broadcasting to Stellar network…</p>
        </div>
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            Transaction confirmed!
          </p>
          {txHash && (
            <a
              href={`${EXPLORER_BASE}/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stellar-600 hover:text-stellar-700 text-xs font-medium mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              View on Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            Transaction failed
          </p>
          {error && (
            <p className="text-red-500 text-xs mt-0.5 max-w-xs truncate">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Imperative helpers ───────────────────────────────────────────────────────

let activeToastId: string | undefined;

export function showTransactionToast(
  status: TransactionStatus,
  txHash?: string,
  error?: string
) {
  const content = (
    <ToastContent status={status} txHash={txHash} error={error} />
  );

  const duration =
    status === 'confirmed' ? 6000 : status === 'failed' ? 5000 : Infinity;

  if (activeToastId) {
    toast.dismiss(activeToastId);
  }

  activeToastId = toast.custom(content, {
    duration,
    position: 'bottom-right',
    style: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      minWidth: '280px',
    },
  });

  if (status === 'confirmed' || status === 'failed') {
    activeToastId = undefined;
  }

  return activeToastId;
}

export function dismissTransactionToast() {
  if (activeToastId) {
    toast.dismiss(activeToastId);
    activeToastId = undefined;
  }
}
