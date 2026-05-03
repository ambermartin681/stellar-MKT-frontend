import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Wallet,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useBuyerOrders, useUpdateOrderStatus } from '../hooks/useApi';
import { useWallet } from '../context/WalletContext';
import StatusBadge from '../components/StatusBadge';
import { confirmDelivery, raiseDispute } from '../lib/contractClient';
import { showTransactionToast } from '../components/TransactionToast';
import toast from 'react-hot-toast';
import type { Order } from '../types';

const EXPLORER_BASE = 'https://testnet.stellarchain.io/transactions';

function OrderCard({
  order,
  onConfirmDelivery,
  onRaiseDispute,
  isProcessing,
}: {
  order: Order;
  onConfirmDelivery: (order: Order) => void;
  onRaiseDispute: (order: Order) => void;
  isProcessing: string | null;
}) {
  const isThisProcessing = isProcessing === order.id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
            {order.listing?.title ?? `Order #${order.id.slice(0, 8)}`}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Seller:{' '}
            <span className="font-mono">
              {order.sellerAddress.slice(0, 6)}…{order.sellerAddress.slice(-4)}
            </span>
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Price</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ⭐ {order.listing?.priceXLM?.toLocaleString() ?? '—'} XLM
          </p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Placed</p>
          <p className="text-gray-700 dark:text-gray-300">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Order ID</p>
          <p className="font-mono text-gray-600 dark:text-gray-400 text-xs truncate">
            {order.contractOrderId}
          </p>
        </div>
        {order.txHash && (
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Tx Hash</p>
            <a
              href={`${EXPLORER_BASE}/${order.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stellar-600 hover:text-stellar-700 text-xs font-medium"
            >
              {order.txHash.slice(0, 8)}…
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Actions for PENDING orders */}
      {order.status === 'PENDING' && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onConfirmDelivery(order)}
            disabled={isThisProcessing}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {isThisProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirm Delivery
          </button>
          <button
            onClick={() => onRaiseDispute(order)}
            disabled={isThisProcessing}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {isThisProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Raise Dispute
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { data: orders, isLoading, isError } = useBuyerOrders(address);
  const updateStatusMutation = useUpdateOrderStatus();
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );

  const handleConfirmDelivery = async (order: Order) => {
    if (!address) return;
    setProcessingOrderId(order.id);
    showTransactionToast('signing');
    try {
      showTransactionToast('submitting');
      const { txHash } = await confirmDelivery(address, order.contractOrderId);
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: 'DELIVERED',
        txHash,
      });
      showTransactionToast('confirmed', txHash);
      toast.success('Delivery confirmed!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to confirm delivery';
      showTransactionToast('failed', undefined, message);
      toast.error(message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRaiseDispute = async (order: Order) => {
    if (!address) return;
    setProcessingOrderId(order.id);
    showTransactionToast('signing');
    try {
      showTransactionToast('submitting');
      const { txHash } = await raiseDispute(address, order.contractOrderId);
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: 'DISPUTED',
        txHash,
      });
      showTransactionToast('confirmed', txHash);
      toast.success('Dispute raised. Our team will review it.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to raise dispute';
      showTransactionToast('failed', undefined, message);
      toast.error(message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Wallet Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Connect your wallet to view your orders.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-stellar-600 hover:underline text-sm"
          >
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your purchases
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-stellar-500 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">
              Failed to load orders. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && (!orders || orders.length === 0) && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Browse the marketplace and make your first purchase!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-stellar-600 hover:bg-stellar-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Browse Listings
            </button>
          </div>
        )}

        {!isLoading && !isError && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirmDelivery={handleConfirmDelivery}
                onRaiseDispute={handleRaiseDispute}
                isProcessing={processingOrderId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
