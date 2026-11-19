import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Neon Metropolis | Decentralized Underworld RPG & Tapper',
  description: 'Standalone Cyberpunk Underworld RPG, Botanical Card Tap Generator, and P2P Bazaar Mesh powered by GREEN.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark bg-neutral-950">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async={false}></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-x-hidden w-full max-w-full`}>
        <main className="flex-1 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
