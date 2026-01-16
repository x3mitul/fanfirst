'use client';

import dynamic from 'next/dynamic';
import { type ReactNode, Suspense } from 'react';

// Loading component for suspense fallback
function ProvidersLoading({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

// Dynamically import heavy wallet providers - only loaded when needed
const WalletProvider = dynamic(
    () => import('./WalletProvider').then((mod) => mod.WalletProvider),
    {
        ssr: false,
        loading: () => null
    }
);

const SolanaWalletProvider = dynamic(
    () => import('./SolanaWalletProvider').then((mod) => mod.SolanaWalletProvider),
    {
        ssr: false,
        loading: () => null
    }
);

interface LazyProvidersProps {
    children: ReactNode;
}

/**
 * Lazy-loaded providers wrapper for heavy blockchain dependencies.
 * This component defers loading of RainbowKit, Wagmi, and Solana wallet
 * adapters until the client is ready, reducing initial bundle size.
 */
export function LazyWalletProviders({ children }: LazyProvidersProps) {
    return (
        <Suspense fallback={<ProvidersLoading>{children}</ProvidersLoading>}>
            <SolanaWalletProvider>
                <WalletProvider>
                    {children}
                </WalletProvider>
            </SolanaWalletProvider>
        </Suspense>
    );
}
