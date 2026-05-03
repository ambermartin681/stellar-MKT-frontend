import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListings,
  getListing,
  createListing,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  createOrder,
} from '../lib/api';
import type {
  OrderStatus,
  CreateListingPayload,
  CreateOrderPayload,
} from '../types';

// ─── Listings ────────────────────────────────────────────────────────────────

export function useListings(params?: { category?: string; page?: number }) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => getListings(params),
    staleTime: 30_000,
    retry: false, // getListings handles offline fallback internally
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateListingPayload) => createListing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useBuyerOrders(buyerAddress: string | null) {
  return useQuery({
    queryKey: ['orders', 'buyer', buyerAddress],
    queryFn: () => getBuyerOrders(buyerAddress!),
    enabled: !!buyerAddress,
    staleTime: 15_000,
  });
}

export function useSellerOrders(sellerAddress: string | null) {
  return useQuery({
    queryKey: ['orders', 'seller', sellerAddress],
    queryFn: () => getSellerOrders(sellerAddress!),
    enabled: !!sellerAddress,
    staleTime: 15_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
      txHash,
    }: {
      orderId: string;
      status: OrderStatus;
      txHash?: string;
    }) => updateOrderStatus(orderId, status, txHash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
