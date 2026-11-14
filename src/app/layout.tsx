import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { CartProvider } from '@/components/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
            <Footer />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
