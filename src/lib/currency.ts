export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rate units of this currency (fallback)
  isCrypto?: boolean;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', rateToUSD: 0.88 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 84.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 154.0 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.55 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.40 },
  USDT: { code: 'USDT', symbol: '₮', name: 'Tether USDT', rateToUSD: 1.0, isCrypto: true },
  BTC: { code: 'BTC', symbol: '₿', name: 'Bitcoin', rateToUSD: 0.0000105, isCrypto: true },
  ETH: { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', rateToUSD: 0.000375, isCrypto: true },
  GREEN: { code: 'GREEN', symbol: '🌿', name: 'Green Native Coin', rateToUSD: 10.0, isCrypto: true },
};

/**
 * Maps country code (ISO 2/3 letter) to currency.
 * Default fallback is Swiss Franc (CHF) as requested.
 */
export function detectCurrencyFromCountry(countryCode?: string): string {
  if (!countryCode) return 'CHF';
  const code = countryCode.toUpperCase().trim();
  if (code === 'CH' || code === 'CHE' || code === 'SWITZERLAND') return 'CHF';
  if (code === 'IN' || code === 'IND' || code === 'INDIA') return 'INR';
  if (code === 'US' || code === 'USA' || code === 'UNITED STATES') return 'USD';
  if (code === 'GB' || code === 'GBR' || code === 'UNITED KINGDOM') return 'GBP';
  if (code === 'JP' || code === 'JPN' || code === 'JAPAN') return 'JPY';
  if (code === 'AU' || code === 'AUS' || code === 'AUSTRALIA') return 'AUD';
  if (code === 'CA' || code === 'CAN' || code === 'CANADA') return 'CAD';
  
  const eurozone = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR', 'SK', 'SI', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY', 'HR'];
  if (eurozone.includes(code)) return 'EUR';
  
  return 'CHF'; // Default fallback is Swiss Franc
}

/**
 * Automatically detects default currency based on system locale or timezone.
 * Defaults to Swiss Franc (CHF) if not resolved.
 */
export function detectDefaultCurrency(): string {
  if (typeof window === 'undefined') return 'CHF';
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Zurich') || timeZone.includes('Switzerland')) return 'CHF';
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
      return 'INR';
    }
    if (timeZone.includes('London')) return 'GBP';
    if (timeZone.includes('Tokyo')) return 'JPY';
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne')) return 'AUD';
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver')) return 'CAD';
    if (timeZone.includes('New_York') || timeZone.includes('Los_Angeles') || timeZone.includes('Chicago')) return 'USD';
    if (timeZone.includes('Europe')) return 'EUR';

    const locale = navigator.language || '';
    if (locale.includes('CH')) return 'CHF';
    if (locale.includes('en-IN') || locale.includes('hi')) return 'INR';
    if (locale.includes('en-US')) return 'USD';
    if (locale.includes('en-GB')) return 'GBP';
    if (locale.includes('ja')) return 'JPY';
    if (locale.includes('de') || locale.includes('fr') || locale.includes('it') || locale.includes('es')) return 'EUR';
  } catch {
    // fallback
  }
  return 'CHF'; // Default fallback Swiss Franc
}

/**
 * Converts price in base currency (USD) to target currency using optional live rate map
 */
export function convertPrice(
  amountInUSD: number,
  targetCurrency: string,
  liveRates?: Record<string, number>
): number {
  const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  const rate = (liveRates && liveRates[targetCurrency]) ? liveRates[targetCurrency] : info.rateToUSD;
  const converted = amountInUSD * rate;
  if (info.isCrypto && (targetCurrency === 'BTC' || targetCurrency === 'ETH')) {
    return Math.round(converted * 1000000) / 1000000;
  }
  return Math.round(converted * 100) / 100;
}

/**
 * Formats price for display with symbol
 */
export function formatPrice(
  amountInUSD: number,
  targetCurrency: string,
  liveRates?: Record<string, number>
): string {
  const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  const value = convertPrice(amountInUSD, targetCurrency, liveRates);
  if (info.isCrypto) {
    return `${info.symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: targetCurrency === 'GREEN' ? 2 : 4, maximumFractionDigits: 6 })}`;
  }
  return `${info.symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
