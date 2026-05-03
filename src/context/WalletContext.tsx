import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  isConnected,
  requestAccess,
  getAddress,
} from '@stellar/freighter-api';
import axios from 'axios';
import type { WalletState } from '../types';

const STORAGE_KEY = 'stellar_wallet_connected';
const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const { data } = await axios.get(`${HORIZON_URL}/accounts/${addr}`);
      const nativeBalance = (
        data.balances as Array<{ asset_type: string; balance: string }>
      ).find((b) => b.asset_type === 'native');
      if (nativeBalance) {
        setBalance(parseFloat(nativeBalance.balance).toFixed(2));
      }
    } catch {
      setBalance('0.00');
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if Freighter is installed
      const connectionResult = await isConnected();
      if (!connectionResult.isConnected) {
        throw new Error(
          'Freighter wallet is not installed. Please install it from https://freighter.app'
        );
      }

      // Request access (prompts user if not already allowed)
      const accessResult = await requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }

      const pubKey = accessResult.address;
      if (!pubKey) {
        throw new Error('Failed to retrieve public key from Freighter');
      }

      setAddress(pubKey);
      localStorage.setItem(STORAGE_KEY, 'true');
      await fetchBalance(pubKey);
    } catch (err) {
      console.error('[WalletContext] connect error:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!wasConnected) return;

    (async () => {
      try {
        const connectionResult = await isConnected();
        if (!connectionResult.isConnected) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        // getAddress returns the key silently if already allowed
        const addressResult = await getAddress();
        if (addressResult.error || !addressResult.address) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        setAddress(addressResult.address);
        await fetchBalance(addressResult.address);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    })();
  }, [fetchBalance]);

  // Refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => fetchBalance(address), 30_000);
    return () => clearInterval(interval);
  }, [address, fetchBalance]);

  const value: WalletState = {
    address,
    balance,
    isConnected: !!address,
    isConnecting,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside <WalletProvider>');
  }
  return ctx;
}
