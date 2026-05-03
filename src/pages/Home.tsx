import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Shield, Globe, WifiOff } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useListings } from '../hooks/useApi';
import type { ListingCategory } from '../types';

const CATEGORIES: ListingCategory[] = [
  'All',
  'Electronics',
  'Clothing',
  'Art',
  'Services',
  'Other',
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex justify-between mt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] =
    useState<ListingCategory>('All');

  const { data, isLoading, isError } = useListings(
    selectedCategory !== 'All' ? { category: selectedCategory } : undefined
  );

  const listings = data?.data ?? [];
  // When data loaded successfully but came from mock fallback, show demo banner
  const isDemoMode = !isError && !isLoading && listings.length > 0 &&
    listings[0]?.id?.startsWith('mock-');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stellar-900 via-stellar-800 to-stellar-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-stellar-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              Powered by Stellar Blockchain
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              Decentralized Marketplace{' '}
              <span className="text-stellar-300">on Stellar</span>
            </h1>
            <p className="text-lg md:text-xl text-stellar-100 mb-8 leading-relaxed">
              Buy and sell goods with trustless escrow, instant settlement, and
              near-zero fees — all secured by the Stellar network.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/create')}
                className="bg-white text-stellar-700 hover:bg-stellar-50 font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                Start Selling
              </button>
              <button
                onClick={() => {
                  document
                    .getElementById('listings')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
              >
                Browse Listings
              </button>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Shield, text: 'Escrow Protection' },
              { icon: Zap, text: 'Instant Settlement' },
              { icon: Globe, text: 'Global Access' },
              { icon: ShoppingBag, text: 'Dispute Resolution' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm"
              >
                <Icon className="w-4 h-4 text-stellar-300" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings section */}
      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Browse Listings
            </h2>
            {data && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {data.total} item{data.total !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stellar-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-stellar-400 hover:text-stellar-600 dark:hover:text-stellar-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <div className="flex items-center justify-center gap-3 py-16 text-center">
            <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-500 font-medium">
              Failed to load listings. Make sure the backend is running.
            </p>
          </div>
        )}

        {/* Demo mode banner */}
        {isDemoMode && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Demo mode</strong> — backend is offline. Showing sample listings.
              Start the backend to see real data.
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && listings.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No listings found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {selectedCategory !== 'All'
                ? `No items in the "${selectedCategory}" category yet.`
                : 'Be the first to list something!'}
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-stellar-600 hover:bg-stellar-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Create a Listing
            </button>
          </div>
        )}

        {/* Listings grid */}
        {!isLoading && !isError && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
