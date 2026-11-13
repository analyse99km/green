import { detectCurrencyFromCountry } from './currency';

export interface DetectedLocationResult {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  countryCode?: string;
  source: 'GPS' | 'IP' | 'TIMEZONE' | 'DEFAULT';
  currency: string;
}

const TIMEZONE_COORDS: Record<string, { lat: number; lng: number; city: string; country: string; code: string }> = {
  'Europe/Zurich': { lat: 47.3769, lng: 8.5417, city: 'Zürich', country: 'Switzerland', code: 'CH' },
  'Europe/Berlin': { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany', code: 'DE' },
  'Europe/Paris': { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France', code: 'FR' },
  'Europe/London': { lat: 51.5074, lng: -0.1278, city: 'London', country: 'United Kingdom', code: 'GB' },
  'Europe/Rome': { lat: 41.9028, lng: 12.4964, city: 'Rome', country: 'Italy', code: 'IT' },
  'Europe/Madrid': { lat: 40.4168, lng: -3.7038, city: 'Madrid', country: 'Spain', code: 'ES' },
  'Europe/Vienna': { lat: 48.2082, lng: 16.3738, city: 'Vienna', country: 'Austria', code: 'AT' },
  'Europe/Amsterdam': { lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands', code: 'NL' },
  'Europe/Brussels': { lat: 50.8503, lng: 4.3517, city: 'Brussels', country: 'Belgium', code: 'BE' },
  'Asia/Kolkata': { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India', code: 'IN' },
  'Asia/Calcutta': { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India', code: 'IN' },
  'Asia/Tokyo': { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', code: 'JP' },
  'Asia/Dubai': { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'United Arab Emirates', code: 'AE' },
  'Asia/Singapore': { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', code: 'SG' },
  'America/New_York': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'United States', code: 'US' },
  'America/Los_Angeles': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'United States', code: 'US' },
  'America/Chicago': { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'United States', code: 'US' },
  'America/Toronto': { lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'Canada', code: 'CA' },
  'Australia/Sydney': { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', code: 'AU' },
  'Australia/Melbourne': { lat: -37.8136, lng: 144.9631, city: 'Melbourne', country: 'Australia', code: 'AU' },
};

/**
 * Universally detects user's location & matching currency:
 * 1. Checks localStorage for any cached real user location
 * 2. Tries IP Geolocation first (instant, works seamlessly inside iframes without permission prompts)
 * 3. Tries Browser GPS
 * 4. Falls back to System TimeZone mapping (bypasses all ad-blockers)
 * 5. Ultimate Default: Zürich, Switzerland · Swiss Franc (CHF)
 */
export async function detectUserLocation(): Promise<DetectedLocationResult> {
  // 1. Check if user already had a saved detected location in this session
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('green_detected_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng && parsed.countryCode) {
          return parsed as DetectedLocationResult;
        }
      }
    } catch {}
  }

  // 2. Try fast IP Geolocation first (Works 100% inside iframes, Cloudflare tunnels, mobile, and desktop)
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const countryCode = data.country_code || 'IN';
        const result: DetectedLocationResult = {
          lat: Number(data.latitude.toFixed(6)),
          lng: Number(data.longitude.toFixed(6)),
          city: data.city || data.region || '',
          country: data.country || '',
          countryCode,
          source: 'IP',
          currency: detectCurrencyFromCountry(countryCode),
        };
        try { sessionStorage.setItem('green_detected_location', JSON.stringify(result)); } catch {}
        return result;
      }
    }
  } catch {
    // ipwho.is failed or ad-blocked
  }

  // Fallback IP provider (ipapi.co)
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const countryCode = data.country_code || 'IN';
        const result: DetectedLocationResult = {
          lat: Number(data.latitude.toFixed(6)),
          lng: Number(data.longitude.toFixed(6)),
          city: data.city || '',
          country: data.country_name || '',
          countryCode,
          source: 'IP',
          currency: detectCurrencyFromCountry(countryCode),
        };
        try { sessionStorage.setItem('green_detected_location', JSON.stringify(result)); } catch {}
        return result;
      }
    }
  } catch {
    // ipapi.co blocked
  }

  // 3. Try Browser GPS (if user allows GPS)
  try {
    const gpsRes = await new Promise<DetectedLocationResult>((resolve, reject) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        return reject(new Error('Geolocation not available'));
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          let countryCode = '';
          let city = '';
          let country = '';

          try {
            const rev = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            if (rev.ok) {
              const data = await rev.json();
              countryCode = data.address?.country_code?.toUpperCase() || '';
              city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
              country = data.address?.country || '';
            }
          } catch {}

          const resolvedCountryCode = countryCode || detectCountryFromTimezone();
          const result: DetectedLocationResult = {
            lat,
            lng,
            city,
            country,
            countryCode: resolvedCountryCode,
            source: 'GPS',
            currency: detectCurrencyFromCountry(resolvedCountryCode),
          };
          try { sessionStorage.setItem('green_detected_location', JSON.stringify(result)); } catch {}
          resolve(result);
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
      );
    });

    return gpsRes;
  } catch {
    // GPS rejected or timed out
  }

  // 4. TimeZone Mapping fallback (always succeeds on all devices without any network access)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COORDS[tz]) {
      const info = TIMEZONE_COORDS[tz];
      return {
        lat: info.lat,
        lng: info.lng,
        city: info.city,
        country: info.country,
        countryCode: info.code,
        source: 'TIMEZONE',
        currency: detectCurrencyFromCountry(info.code),
      };
    }
  } catch {}

  // 5. Ultimate Default: Zürich, Switzerland · Swiss Franc (CHF)
  return {
    lat: 47.3769,
    lng: 8.5417,
    city: 'Zürich',
    country: 'Switzerland',
    countryCode: 'CH',
    source: 'DEFAULT',
    currency: 'CHF',
  };
}

function detectCountryFromTimezone(): string {
  if (typeof window === 'undefined') return 'CH';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) return 'IN';
    if (tz.includes('Zurich') || tz.includes('Switzerland')) return 'CH';
    if (tz.includes('London')) return 'GB';
    if (tz.includes('Tokyo')) return 'JP';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'AU';
    if (tz.includes('Toronto') || tz.includes('Vancouver')) return 'CA';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) return 'US';
    if (tz.includes('Europe')) return 'DE';
  } catch {}
  return 'CH';
}
