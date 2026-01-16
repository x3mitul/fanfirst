'use client';

import { useMemo, useCallback, useState, createContext, useContext, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletError, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Import Solana wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Custom modal context to handle wallet selection with deduplication
interface CustomWalletModalContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CustomWalletModalContext = createContext<CustomWalletModalContextType>({
  visible: false,
  setVisible: () => { },
});

export const useCustomWalletModal = () => useContext(CustomWalletModalContext);

// Custom Wallet Modal that filters duplicates
function CustomWalletModal() {
  const { visible, setVisible } = useCustomWalletModal();
  const { wallets, select } = useWallet();

  // Filter out duplicate wallets by name
  const uniqueWallets = useMemo(() => {
    const seen = new Set<string>();
    return wallets.filter((wallet) => {
      const name = wallet.adapter.name;
      if (seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    });
  }, [wallets]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
      onClick={() => setVisible(false)}
    >
      <div
        className="bg-[#1a1a2e] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-bold">Connect a wallet on Solana to continue</h2>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {uniqueWallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => {
                select(wallet.adapter.name);
                setVisible(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="w-8 h-8 rounded"
                />
                <span className="text-white font-medium">{wallet.adapter.name}</span>
              </div>
              <span className="text-gray-400 text-sm">
                {wallet.readyState === 'Installed' ? 'Detected' : 'Not Installed'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Custom Modal Provider
function CustomWalletModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <CustomWalletModalContext.Provider value={{ visible, setVisible }}>
      {children}
      <CustomWalletModal />
    </CustomWalletModalContext.Provider>
  );
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Use devnet for development
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Use empty array to rely on Wallet Standard detection only
  const wallets = useMemo(() => [], []);

  // Error handler for wallet errors
  const onError = useCallback((error: WalletError) => {
    console.error('Wallet error:', error.name, error.message);
    // Don't show alert for user rejections
    if (error.message?.includes('User rejected') || error.message?.includes('user denied')) {
      return;
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        localStorageKey="solana-wallet"
        onError={onError}
      >
        <CustomWalletModalProvider>{children}</CustomWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
