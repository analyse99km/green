'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_CURRENCIES, detectDefaultCurrency, formatPrice, convertPrice } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  availableCurrencies: typeof SUPPORTED_CURRENCIES;
  liveRates: Record<string, number>;
  currentRate: number;
  isLiveRate: boolean;
  lastUpdated: string | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'CHF',
  setCurrency: () => {},
  formatPrice: (amount) => `$${amount.toFixed(2)}`,
  convertPrice: (amount) => amount,
  availableCurrencies: SUPPORTED_CURRENCIES,
  liveRates: {},
  currentRate: 1.0,
  isLiveRate: false,
  lastUpdated: null,
  refreshRates: async () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('CHF');
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});
  const [isLiveRate, setIsLiveRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refreshRates = useCallback(async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setLiveRates(data.rates);
          setIsLiveRate(true);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch {
      // Graceful fallback to built-in rates
      setIsLiveRate(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('green_user_currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setCurrencyState(saved);
    } else {
      const detected = detectDefaultCurrency();
      setCurrencyState(detected);
    }
    refreshRates();
  }, [refreshRates]);

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('green_user_currency', code);
      refreshRates();
    }
  };

  const info = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
  const currentRate = liveRates[currency] || info.rateToUSD;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice: (amount: number) => formatPrice(amount, currency, liveRates),
        convertPrice: (amount: number) => convertPrice(amount, currency, liveRates),
        availableCurrencies: SUPPORTED_CURRENCIES,
        liveRates,
        currentRate,
        isLiveRate,
        lastUpdated,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
