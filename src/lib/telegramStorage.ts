// Telegram WebApp CloudStorage & Session Persistence Utility
// Bridges cross-domain persistence across Cloudflare runner tunnel changes

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function isTelegramEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return false;
  if (tg.initData && tg.initData.length > 0) return true;
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) return true;
  if (tg.platform && tg.platform !== 'unknown') return true;
  const search = window.location.search;
  if (search.includes('tgWebAppData') || search.includes('tgUser') || search.includes('isTelegram=1')) return true;
  return false;
}

export function getTelegramWebApp(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
}

export function parseTelegramInitData(): { user?: TelegramUser; start_param?: string } {
  if (typeof window === 'undefined') return {};
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    return {
      user: tg.initDataUnsafe.user,
      start_param: tg.initDataUnsafe.start_param || '',
    };
  }

  // Parse raw initData string if initDataUnsafe is not yet parsed
  try {
    const raw = tg?.initData;
    if (raw && typeof raw === 'string') {
      const params = new URLSearchParams(raw);
      const userStr = params.get('user');
      const startParam = params.get('start_param') || '';
      if (userStr) {
        return {
          user: JSON.parse(userStr),
          start_param: startParam,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse raw Telegram initData:', err);
  }

  // Check URL query parameters fallback
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const rawTg = urlParams.get('tgUser');
    const ref = urlParams.get('ref') || '';
    if (rawTg) {
      return {
        user: JSON.parse(decodeURIComponent(rawTg)),
        start_param: ref,
      };
    }
  } catch {}

  return {};
}

// Telegram.WebApp.CloudStorage Promisified Helpers
export function tgCloudGet(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    const tg = getTelegramWebApp();
    const cs = tg?.CloudStorage;
    if (!cs || typeof cs.getItem !== 'function') return resolve(null);

    try {
      cs.getItem(key, (err: any, val: string | null) => {
        if (err || !val) {
          resolve(null);
        } else {
          resolve(val);
        }
      });
    } catch {
      resolve(null);
    }
  });
}

export function tgCloudSet(key: string, value: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    const tg = getTelegramWebApp();
    const cs = tg?.CloudStorage;
    if (!cs || typeof cs.setItem !== 'function') return resolve(false);

    try {
      // Telegram CloudStorage has a 4096 character limit per value
      const safeVal = typeof value === 'string' ? value.substring(0, 4090) : '';
      cs.setItem(key, safeVal, (err: any, result: boolean) => {
        if (err) {
          resolve(false);
        } else {
          resolve(Boolean(result));
        }
      });
    } catch {
      resolve(false);
    }
  });
}

export function tgCloudGetItems(keys: string[]): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve({});
    const tg = getTelegramWebApp();
    const cs = tg?.CloudStorage;
    if (!cs || typeof cs.getItems !== 'function') return resolve({});

    try {
      cs.getItems(keys, (err: any, values: Record<string, string>) => {
        if (err || !values) {
          resolve({});
        } else {
          resolve(values);
        }
      });
    } catch {
      resolve({});
    }
  });
}

// Compact save game state for Telegram CloudStorage (under 4090 bytes)
export function getCompactCloudSave(player: any): string {
  try {
    const compact = {
      id: player.id,
      name: player.name,
      level: player.level,
      money: player.money,
      bankMoney: player.bankMoney,
      dreamPoints: player.dreamPoints || player.sparks,
      greenTokens: player.greenTokens,
      rank: player.rank,
      referrals: {
        referralCode: player.referrals?.referralCode,
        referredBy: player.referrals?.referredBy,
        totalRecruits: player.referrals?.totalRecruits || 0,
        unclaimedCommissionGreen: player.referrals?.unclaimedCommissionGreen || 0,
        lifetimeCommissionGreen: player.referrals?.lifetimeCommissionGreen || 0,
      },
      lastSaveTimestamp: player.lastSaveTimestamp || Date.now(),
    };
    return JSON.stringify(compact);
  } catch {
    return '';
  }
}
