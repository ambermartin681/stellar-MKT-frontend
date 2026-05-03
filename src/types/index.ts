export interface Listing {
  id: string;
  title: string;
  description: string;
  priceXLM: number;
  seller: string; // Stellar address
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'REFUNDED';

export interface Order {
  id: string;
  listingId: string;
  buyerAddress: string;
  sellerAddress: string;
  contractOrderId: string;
  txHash?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
}

export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export type TransactionStatus =
  | 'idle'
  | 'signing'
  | 'submitting'
  | 'confirmed'
  | 'failed';

export interface TransactionState {
  status: TransactionStatus;
  txHash?: string;
  error?: string;
}

export type ListingCategory =
  | 'All'
  | 'Electronics'
  | 'Clothing'
  | 'Art'
  | 'Services'
  | 'Other';

export interface CreateListingPayload {
  title: string;
  description: string;
  priceXLM: number;
  seller: string;
  imageUrl: string;
  category: string;
}

export interface CreateOrderPayload {
  listingId: string;
  buyerAddress: string;
  sellerAddress: string;
  contractOrderId: string;
  txHash: string;
}

export interface PaginatedListings {
  data: Listing[];
  total: number;
}
