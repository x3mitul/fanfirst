'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface PrivyProviderProps {
    children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    if (!appId) {
        console.warn('Privy App ID not configured');
        return <>{children}</>;
    }

    return (
        <BasePrivyProvider
            appId={appId}
            config={{
                loginMethods: ['email', 'google', 'wallet'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#22c55e', // Green to match FanFirst
                    logo: '/logo.png',
                    showWalletLoginFirst: false, // Show social login first for novices
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets', // Auto-create for non-crypto users
                    }
                },
                defaultChain: {
                    id: 80002, // Polygon Amoy testnet
                    name: 'Polygon Amoy',
                    network: 'polygon-amoy',
                    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                    rpcUrls: {
                        default: { http: ['https://rpc-amoy.polygon.technology'] }
                    },
                    blockExplorers: {
                        default: { name: 'OKLink', url: 'https://www.oklink.com/amoy' }
                    },
                    testnet: true
                },
                supportedChains: [
                    {
                        id: 80002,
                        name: 'Polygon Amoy',
                        network: 'polygon-amoy',
                        nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                        rpcUrls: {
                            default: { http: ['https://rpc-amoy.polygon.technology'] }
                        },
                        blockExplorers: {
                            default: { name: 'OKLink', url: 'https://www.oklink.com/amoy' }
                        },
                        testnet: true
                    }
                ]
            }}
        >
            {children}
        </BasePrivyProvider>
    );
}
