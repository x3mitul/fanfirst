import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";
import { LazyWalletProviders } from "@/providers/LazyProviders";
import { SocketProvider } from "@/providers/SocketProvider";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FanFirst | Fair Ticketing for Real Fans",
  description: "The AI-powered NFT ticketing platform that prioritizes real fans over bots and scalpers. Get fair access to concerts, festivals, and live events.",
  keywords: ["tickets", "NFT", "concerts", "events", "blockchain", "anti-scalping"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Auth0Provider>
          <SocketProvider>
            <LazyWalletProviders>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </LazyWalletProviders>
          </SocketProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

