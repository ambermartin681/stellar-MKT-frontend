import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  requestAccess,
} from '@stellar/freighter-api';
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
      setBalance(nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : '0.00');
    } catch {
      setBalance('0.00');
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // 1. Check Freighter is installed
      let connectedResult: { isConnected: boolean; error?: unknown };
      try {
        connectedResult = await isConnected();
      } catch {
        throw new Error(
          'Freighter wallet is not installed. Please install it from https://freighter.app and refresh the page.'
        );
      }

      if (!connectedResult.isConnected) {
        throw new Error(
          'Freighter wallet is not installed. Please install it from https://freighter.app and refresh the page.'
        );
      }

      // 2. Check if app is already on the allow list
      const allowedResult = await isAllowed();

      let pubKey: string | undefined;

      if (allowedResult.isAllowed) {
        // Already allowed — silently get address
        const addrResult = await getAddress();
        if (addrResult.error) {
          throw new Error(freighterErrMsg(addrResult.error));
        }
        pubKey = addrResult.address;
      } else {
        // Not yet allowed — prompt user via requestAccess
        const accessResult = await requestAccess();
        if (accessResult.error) {
          throw new Error(freighterErrMsg(accessResult.error));
        }
        pubKey = accessResult.address;
      }

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

  // Auto-reconnect silently on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!wasConnected) return;

    (async () => {
      try {
        const connResult = await isConnected();
        if (!connResult.isConnected) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
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
