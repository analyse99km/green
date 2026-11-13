'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  MapPin, 
  Globe, 
  Coffee, 
  PlusCircle, 
  Store as StoreIcon, 
  ShieldAlert, 
  Menu, 
  X, 
  Coins 
} from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { useCart } from './CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency, availableCurrencies, currentRate, isLiveRate } = useCurrency();
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Map Surf', icon: MapPin },
    { href: '/local', label: 'Local Buy', icon: ShoppingBag },
    { href: '/global', label: 'Global Sellers', icon: Globe },
    { href: '/hospitality', label: 'Cafes & Dining', icon: Coffee },
    { href: '/orders', label: 'Orders', icon: Coins },
    { href: '/create-store', label: 'Open Store', icon: PlusCircle, highlight: true },
    { href: '/dashboard', label: 'Seller Hub', icon: StoreIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">GREEN</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/20">
                P2P Market
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 -mt-1 hidden sm:block">
              Zero Fees • Self-Hosted • Decentralized
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  link.highlight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs'
                    : isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controls: Currency selector, Master Control, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher + Live Rate Pill */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-6"
                title="Change Viewing Currency"
              >
                {Object.values(availableCurrencies).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px]">
                ▼
              </div>
            </div>
            {mounted && currency !== 'USD' && (
              <span
                className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300"
                title={isLiveRate ? 'Live Real-Time Exchange Rate' : 'Reference Exchange Rate'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveRate ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                1 USD = {currentRate < 0.01 ? currentRate.toFixed(6) : currentRate.toFixed(2)} {currency}
              </span>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
            title="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {totalCount}
              </span>
            )}
          </button>

          {/* Discreet Master Admin Control Button */}
          

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  link.highlight
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
