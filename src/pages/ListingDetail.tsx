import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useListing, useCreateOrder } from '../hooks/useApi';
import { useWallet } from '../context/WalletContext';
import { placeOrder } from '../lib/contractClient';
import { showTransactionToast } from '../components/TransactionToast';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGE =
  'https://placehold.co/800x500/1e1b4b/a5b8fc?text=No+Image';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { data: listing, isLoading, isError } = useListing(id ?? '');
  const createOrderMutation = useCreateOrder();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyNow = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!listing) return;
    if (listing.seller === address) {
      toast.error("You can't buy your own listing");
      return;
    }

    setIsBuying(true);
    showTransactionToast('signing');

    try {
      // Step 1: Invoke contract (escrow funds)
      showTransactionToast('submitting');
      const { contractOrderId, txHash } = await placeOrder(
        address,
        listing.seller,
        listing.id,
        listing.priceXLM
      );

      // Step 2: Record order in backend
      await createOrderMutation.mutateAsync({
        listingId: listing.id,
        buyerAddress: address,
        sellerAddress: listing.seller,
        contractOrderId,
        txHash,
      });

      showTransactionToast('confirmed', txHash);
      toast.success('Order placed successfully!');
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Transaction failed';
      showTransactionToast('failed', undefined, message);
      toast.error(message);
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-stellar-500 animate-spin" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          Listing not found or failed to load.
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-stellar-600 hover:underline text-sm"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isSeller = address === listing.seller;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[4/3]">
            <img
              src={listing.imageUrl || PLACEHOLDER_IMAGE}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-stellar-500" />
              <span className="text-sm font-medium text-stellar-600 dark:text-stellar-400 bg-stellar-50 dark:bg-stellar-900/30 px-2.5 py-0.5 rounded-full">
                {listing.category}
              </span>
              {!listing.isActive && (
                <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {listing.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {listing.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                ⭐ {listing.priceXLM.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                XLM
              </span>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              <User className="w-4 h-4 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Seller
                </p>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                  {listing.seller}
                </p>
              </div>
            </div>

            {/* Listed date */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Listed on{' '}
              {new Date(listing.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {/* Buy button */}
            {isSeller ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
                This is your listing. You cannot purchase your own items.
              </div>
            ) : !isConnected ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
                Connect your wallet to purchase this item.
              </div>
            ) : !listing.isActive ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 text-sm">
                This listing is no longer active.
              </div>
            ) : (
              <button
                onClick={handleBuyNow}
                disabled={isBuying}
                className="flex items-center justify-center gap-2 bg-stellar-600 hover:bg-stellar-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
              >
                {isBuying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now for {listing.priceXLM} XLM
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
