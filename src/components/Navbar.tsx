import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Wallet, LogOut, Star } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/create', label: 'Create Listing' },
  { to: '/orders', label: 'My Orders' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { address, balance, isConnected, isConnecting, connect, disconnect } =
    useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      if (msg === 'NOT_INSTALLED' || msg.includes('not installed') || msg.includes('NOT_INSTALLED')) {
        toast(
          (t) => (
            <span className="text-sm">
              Freighter not found.{' '}
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-stellar-600"
                onClick={() => toast.dismiss(t.id)}
              >
                Install it here
              </a>
              , then <strong>hard-refresh</strong> the page (Ctrl+Shift+R).
            </span>
          ),
          { duration: 10000, icon: '🔌' }
        );
      } else {
        toast.error(msg);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast('Wallet disconnected', { icon: '👋' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-stellar-600 dark:text-stellar-400 hover:opacity-80 transition-opacity"
          >
            <Star className="w-6 h-6 fill-stellar-500 text-stellar-500" />
            StellarMarket
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-stellar-50 dark:bg-stellar-900/30 text-stellar-700 dark:text-stellar-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Wallet section */}
          <div className="hidden md:flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5">
                  <Wallet className="w-4 h-4 text-stellar-500" />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {truncateAddress(address)}
                  </span>
                  {balance !== null && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ⭐ {balance} XLM
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect wallet"
                  className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-stellar-600 hover:bg-stellar-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stellar-50 dark:bg-stellar-900/30 text-stellar-700 dark:text-stellar-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            {isConnected && address ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Wallet className="w-4 h-4 text-stellar-500" />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {truncateAddress(address)}
                  </span>
                  {balance !== null && (
                    <span className="ml-auto text-sm font-semibold text-gray-900 dark:text-white">
                      ⭐ {balance} XLM
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleDisconnect();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleConnect();
                  setMobileOpen(false);
                }}
                disabled={isConnecting}
                className="flex items-center gap-2 w-full bg-stellar-600 hover:bg-stellar-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
