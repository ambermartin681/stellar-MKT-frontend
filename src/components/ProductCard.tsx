import type { Listing } from '../types';

interface ProductCardProps {
  listing: Listing;
  onClick: () => void;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const PLACEHOLDER_IMAGE =
  'https://placehold.co/400x300/1e1b4b/a5b8fc?text=No+Image';

export default function ProductCard({ listing, onClick }: ProductCardProps) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={listing.imageUrl || PLACEHOLDER_IMAGE}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
        {/* Category badge */}
        <span className="absolute top-2 right-2 bg-stellar-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {listing.category}
        </span>
        {!listing.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              Inactive
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 mb-1 group-hover:text-stellar-600 dark:group-hover:text-stellar-400 transition-colors">
          {listing.title}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-gray-900 dark:text-white text-base">
              {listing.priceXLM.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              XLM
            </span>
          </div>

          {/* Seller */}
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {truncateAddress(listing.seller)}
          </span>
        </div>
      </div>
    </article>
  );
}
