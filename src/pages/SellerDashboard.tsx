import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Loader2,
  Package,
  TrendingUp,
  ShoppingCart,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { useSellerOrders, useListings } from '../hooks/useApi';
import { useWallet } from '../context/WalletContext';
import StatusBadge from '../components/StatusBadge';
import type { Order, Listing } from '../types';

const EXPLORER_BASE = 'https://testnet.stellarchain.io/transactions';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      )}
    </div>
  );
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('orders');

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useSellerOrders(address);

  const {
    data: listingsData,
    isLoading: listingsLoading,
  } = useListings();

  const orders: Order[] = ordersData ?? [];
  const allListings: Listing[] = listingsData?.data ?? [];

  // Filter listings belonging to this seller
  const myListings = allListings.filter((l) => l.seller === address);

  // Stats
  const activeOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
  ).length;

  const totalEarnings = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.listing?.priceXLM ?? 0), 0);

  const activeListings = myListings.filter((l) => l.isActive).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Wallet Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Connect your wallet to access the seller dashboard.
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-6 h-6 text-stellar-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Seller Dashboard
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
              {address?.slice(0, 8)}…{address?.slice(-6)}
            </p>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 bg-stellar-600 hover:bg-stellar-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Listing
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Package}
            label="Total Listings"
            value={myListings.length}
            sub={`${activeListings} active`}
            color="bg-stellar-100 dark:bg-stellar-900/30 text-stellar-600 dark:text-stellar-400"
          />
          <StatCard
            icon={ShoppingCart}
            label="Active Orders"
            value={activeOrders}
            sub="Pending + Confirmed"
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Earnings"
            value={`⭐ ${totalEarnings.toLocaleString()} XLM`}
            sub="From delivered orders"
            color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
          {(['orders', 'listings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'orders' ? `Orders (${orders.length})` : `Listings (${myListings.length})`}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-stellar-500 animate-spin" />
              </div>
            ) : ordersError ? (
              <div className="text-center py-16 text-red-500">
                Failed to load orders.
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No incoming orders yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Item
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Buyer
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Tx
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-[180px] truncate">
                          {order.listing?.title ?? order.listingId.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-500 dark:text-gray-400 text-xs">
                          {order.buyerAddress.slice(0, 6)}…
                          {order.buyerAddress.slice(-4)}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                          ⭐ {order.listing?.priceXLM?.toLocaleString() ?? '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          {order.txHash ? (
                            <a
                              href={`${EXPLORER_BASE}/${order.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-stellar-600 hover:text-stellar-700 text-xs"
                            >
                              {order.txHash.slice(0, 6)}…
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {listingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-stellar-500 animate-spin" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven't created any listings yet.
                </p>
                <button
                  onClick={() => navigate('/create')}
                  className="bg-stellar-600 hover:bg-stellar-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Title
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Category
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Price
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Created
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {myListings.map((listing) => (
                      <tr
                        key={listing.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                          {listing.title}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                          {listing.category}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                          ⭐ {listing.priceXLM.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              listing.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {listing.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() =>
                              navigate(`/listings/${listing.id}`)
                            }
                            className="text-stellar-600 hover:text-stellar-700 text-xs font-medium hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
