'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { SolanaWalletModal } from './SolanaWalletModal';
import { Wallet } from 'lucide-react';
import { Button } from './Button';

export function DualWalletButton() {
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showSolanaModal, setShowSolanaModal] = useState(false);
  const { isConnected: evmConnected, address: evmAddress } = useAccount();
  const { connected: solanaConnected, shortAddress: solanaAddress, disconnect: disconnectSolana } = useSolanaWallet();
  const { select, wallets, connect } = useWallet();

  // Debug logging
  useEffect(() => {
    console.log('Wallet Status:', { evmConnected, solanaConnected, evmAddress, solanaAddress });
    console.log('Available Solana wallets:', wallets.map(w => w.adapter.name));
  }, [evmConnected, solanaConnected, evmAddress, solanaAddress, wallets]);

  const handleSolanaConnect = () => {
    console.log('Opening Solana wallet modal...');
    setShowSolanaModal(true);
    setShowChainSelector(false);
  };

  const hasAnyConnection = evmConnected || solanaConnected;
  const hasBothConnections = evmConnected && solanaConnected;

  if (!hasAnyConnection) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowChainSelector(!showChainSelector)}
          variant="primary"
          size="md"
          className="gap-2"
        >
          <Wallet className="w-4 h-4" />
          CONNECT WALLET
        </Button>

        {showChainSelector && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] z-50">
            <div className="p-4 space-y-2">
              <div className="text-xs font-bold tracking-wider text-white mb-3">
                SELECT CHAIN
              </div>

              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => {
                  console.log('ConnectButton render:', { openConnectModal, mounted });
                  return (
                    <button
                      onClick={() => {
                        console.log('EVM Connect clicked', { openConnectModal });
                        if (openConnectModal) {
                          openConnectModal();
                        } else {
                          console.error('openConnectModal is undefined');
                        }
                        setShowChainSelector(false);
                      }}
                      disabled={!mounted}
                      className="w-full px-4 py-3 bg-black text-white font-bold text-sm tracking-wider border-2 border-white hover:bg-white hover:text-black transition-colors text-left disabled:opacity-50"
                    >
                      ETHEREUM / EVM
                      <div className="text-xs opacity-60 mt-1">For ticket purchases</div>
                    </button>
                  );
                }}
              </ConnectButton.Custom>

              <button
                onClick={handleSolanaConnect}
                className="w-full px-4 py-3 bg-black text-white font-bold text-sm tracking-wider border-2 border-white hover:bg-white hover:text-black transition-colors text-left"
              >
                SOLANA
                <div className="text-xs opacity-60 mt-1">For community features</div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show both connected wallets
  return (
    <>
      <div className="flex items-center gap-3 lg:gap-6">
        {/* EVM Wallet */}
        {evmConnected ? (
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold tracking-wider border-2 border-zinc-700 hover:border-white transition-all flex items-center gap-2.5"
              >
                <span className="text-lg">Ξ</span>
                <span className="hidden sm:inline">EVM</span>
              </button>
            )}
          </ConnectButton.Custom>
        )}

        {/* Solana Wallet */}
        {solanaConnected ? (
          <button
            onClick={() => setShowSolanaModal(true)}
            className="px-5 py-2.5 bg-[#14F195] text-black text-sm font-bold tracking-wider border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2.5 whitespace-nowrap"
          >
            <span className="text-lg">◎</span>
            <span>{solanaAddress}</span>
          </button>
        ) : (
          <button
            onClick={handleSolanaConnect}
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold tracking-wider border-2 border-zinc-700 hover:border-[#14F195] transition-all flex items-center gap-2.5"
          >
            <span className="text-lg">◎</span>
            <span className="hidden sm:inline">SOL</span>
          </button>
        )}
      </div>

      {/* Custom Solana Wallet Modal */}
      <SolanaWalletModal
        visible={showSolanaModal}
        onClose={() => setShowSolanaModal(false)}
      />
    </>
  );
}
