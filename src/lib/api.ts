import axios from 'axios';
import type {
  Listing,
  Order,
  OrderStatus,
  CreateListingPayload,
  CreateOrderPayload,
  PaginatedListings,
} from '../types';
import { getMockListings, getMockListing, MOCK_LISTINGS } from './mockData';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5_000,
});

// Request interceptor for logging only
apiClient.interceptors.request.use((config) => {
  console.debug(`[api] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// NOTE: No response error interceptor — we need the raw AxiosError
// in each function so we can detect network failures and fall back to mock data.

/** True when the backend is unreachable (no response, timeout, CORS, etc.) */
function isOffline(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  return (
    !err.response ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_NETWORK' ||
    err.code === 'ERR_FAILED' ||
    err.message === 'Network Error'
  );
}

/** Normalise an error to a plain message string */
function toMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? err.message ?? 'Unknown error';
  }
  return err instanceof Error ? err.message : 'Unknown error';
}

export async function getListings(params?: {
  category?: string;
  page?: number;
}): Promise<PaginatedListings> {
  try {
    const { data } = await apiClient.get<PaginatedListings>('/listings', { params });
    return data;
  } catch (err) {
    if (isOffline(err)) {
      console.warn('[api] Backend offline — using demo listings');
      return getMockListings(params);
    }
    throw new Error(toMessage(err));
  }
}

export async function getListing(id: string): Promise<Listing> {
  try {
    const { data } = await apiClient.get<Listing>(`/listings/${id}`);
    return data;
  } catch (err) {
    if (isOffline(err)) {
      const mock = getMockListing(id);
      if (mock) return mock;
      if (MOCK_LISTINGS.length > 0) return MOCK_LISTINGS[0];
    }
    throw new Error(toMessage(err));
  }
}

export async function createListing(
  payload: CreateListingPayload
): Promise<Listing> {
  try {
    const { data } = await apiClient.post<Listing>('/listings', payload);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function getBuyerOrders(buyerAddress: string): Promise<Order[]> {
  try {
    const { data } = await apiClient.get<Order[]>('/orders', {
      params: { buyer: buyerAddress },
    });
    return data;
  } catch (err) {
    if (isOffline(err)) return [];
    throw new Error(toMessage(err));
  }
}

export async function getSellerOrders(sellerAddress: string): Promise<Order[]> {
  try {
    const { data } = await apiClient.get<Order[]>('/orders', {
      params: { seller: sellerAddress },
    });
    return data;
  } catch (err) {
    if (isOffline(err)) return [];
    throw new Error(toMessage(err));
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  txHash?: string
): Promise<Order> {
  try {
    const { data } = await apiClient.patch<Order>(`/orders/${orderId}/status`, {
      status,
      ...(txHash ? { txHash } : {}),
    });
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}
