"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
    RainbowKitProvider,
    getDefaultConfig,
    darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { polygonAmoy, polygon, mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Create config with RainbowKit's getDefaultConfig for proper wallet modal support
const config = getDefaultConfig({
    appName: 'FanFirst',
    projectId: projectId,
    chains: [polygon, mainnet, polygonAmoy, sepolia],
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [polygonAmoy.id]: http(),
        [sepolia.id]: http(),
    },
    ssr: true,
});

// Stable QueryClient for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config} reconnectOnMount={false}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#ccff00',
                        accentColorForeground: '#000000',
                        borderRadius: 'medium',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    })}
                    modalSize="compact"
                    initialChain={polygon}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
