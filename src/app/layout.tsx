import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { CartProvider } from '@/components/CartContext';
import Navbar from '@/components/Navbar';
import CartCheckoutModal from '@/components/CartCheckoutModal';

import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GREEN | Self-Hosted Decentralized Marketplace',
  description: 'Zero fees, open-source, self-hosted marketplace with interactive map discovery, multi-cloud & GitHub storage, direct P2P payments, and hospitality table booking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}>
        <CurrencyProvider>
          <CartProvider>
            <Suspense fallback={<div className="h-16 w-full border-b border-neutral-200 dark:border-neutral-800" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 pb-16">{children}</main>
            <CartCheckoutModal />
            <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-8 px-4 text-center text-xs text-neutral-500">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">GREEN Marketplace</span>
                  <span>•</span>
                  <span>Open Source & Self-Hosted</span>
                </div>
                <div>
                  Zero platform fees • Direct P2P seller payments • All rights owned by store owners
                </div>
              </div>
            </footer>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
