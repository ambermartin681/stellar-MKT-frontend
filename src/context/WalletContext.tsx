import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { requestAccess, getAddress, isAllowed } from '@stellar/freighter-api';
import axios from 'axios';
import type { WalletState } from '../types';

const STORAGE_KEY = 'stellar_wallet_connected';
const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

const WalletContext = createContext<WalletState | null>(null);

/** Normalise Freighter error — can be a string or { message: string } */
function freighterErrMsg(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

/** Check if Freighter extension is present in the window object */
function isFreighterInstalled(): boolean {
  return (
    typeof window !== 'undefined' &&
    // Freighter injects window.freighter or window.freighterApi
    (('freighter' in window && !!(window as Record<string, unknown>).freighter) ||
      ('freighterApi' in window && !!(window as Record<string, unknown>).freighterApi))
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const { data } = await axios.get(`${HORIZON_URL}/accounts/${addr}`, {
        timeout: 8000,
      });
      const nativeBalance = (
        data.balances as Array<{ asset_type: string; balance: string }>
      ).find((b) => b.asset_type === 'native');
      setBalance(
        nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : '0.00'
      );
    } catch {
      setBalance('0.00');
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check window object directly — most reliable way to detect Freighter
      if (!isFreighterInstalled()) {
        throw new Error('NOT_INSTALLED');
      }

      // requestAccess() prompts the user if not yet allowed,
      // or silently returns the key if already on the allow list.
      const accessResult = await requestAccess();

      if (accessResult.error) {
        const msg = freighterErrMsg(accessResult.error);
        // User rejected the popup
        if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('denied')) {
          throw new Error('Connection rejected. Please approve the request in Freighter.');
        }
        throw new Error(msg);
      }

      const pubKey = accessResult.address;
      if (!pubKey) {
        throw new Error('Freighter did not return a public key. Please try again.');
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

  // Auto-reconnect silently on mount if previously connected + already allowed
  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!wasConnected) return;
    if (!isFreighterInstalled()) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    (async () => {
      try {
        const allowResult = await isAllowed();
        if (!allowResult.isAllowed) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        const addrResult = await getAddress();
        if (addrResult.error || !addrResult.address) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        setAddress(addrResult.address);
        await fetchBalance(addrResult.address);
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
