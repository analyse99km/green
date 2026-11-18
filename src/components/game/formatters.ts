/**
 * Global Currency & Number Formatters for Neon Metropolis
 * 
 * Rules:
 * - 0 to 999: Display as-is (e.g. 0, 42, 999)
 * - 1,000+: Compact suffix (K, M, B, T) with up to 4 significant decimals,
 *   e.g. 1.4323B, 3.78B, 1.28K, 50M.
 * 
 * Consistent Currency Icons:
 * - GREEN Coins: 🪙
 * - Sparks / Dream Points: ⚡
 */

export function formatCompactNumber(num: number | undefined | null, maxDecimals: number = 4): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (abs < 1000) {
    return `${sign}${Math.floor(abs).toLocaleString()}`;
  }

  const units = [
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' },
  ];

  for (const unit of units) {
    if (abs >= unit.value) {
      const val = abs / unit.value;
      const formatted = val.toFixed(maxDecimals).replace(/\.?0+$/, '');
      return `${sign}${formatted}${unit.symbol}`;
    }
  }

  return `${sign}${abs.toString()}`;
}

export const CURRENCY_ICONS = {
  GREEN: '🪙',
  SPARKS: '⚡',
} as const;
