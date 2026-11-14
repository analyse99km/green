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
  'Asia/Kolkata': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India', code: 'IN' },
  'Asia/Calcutta': { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India', code: 'IN' },
  'Asia/Tokyo': { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', code: 'JP' },
  'America/New_York': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'United States', code: 'US' },
  'America/Los_Angeles': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'United States', code: 'US' },
  'America/Chicago': { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'United States', code: 'US' },
  'America/Toronto': { lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'Canada', code: 'CA' },
  'Australia/Sydney': { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', code: 'AU' },
  'Australia/Melbourne': { lat: -37.8136, lng: 144.9631, city: 'Melbourne', country: 'Australia', code: 'AU' },
};

export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string; country: string; countryCode: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const street = addr.road || addr.pedestrian || addr.suburb || '';
      const houseNumber = addr.house_number ? `${addr.house_number} ` : '';
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const country = addr.country || '';
      const countryCode = (addr.country_code || 'ch').toUpperCase();
      const fullDisplay = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      return {
        address: fullDisplay,
        city,
        country,
        countryCode,
      };
    }
  } catch {}
  return {
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: '',
    country: '',
    countryCode: 'CH',
  };
}

/**
 * Universally detects user's location & matching currency:
 * 1. Tries Browser GPS with 12s high-accuracy lock
 * 2. Falls back to IP Geolocation (ipwho.is or ipapi.co)
 * 3. Falls back to System TimeZone mapping (bypasses all ad-blockers)
 * 4. Default fallback: Swiss Franc (CHF)
 */
export async function detectUserLocation(): Promise<DetectedLocationResult> {
  // 1. Try Browser GPS (High Accuracy Satellite / WiFi)
  const gpsPromise = new Promise<DetectedLocationResult>((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Geolocation not available'));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        try {
          const rev = await reverseGeocode(lat, lng);
          resolve({
            lat,
            lng,
            city: rev.city,
            country: rev.country,
            countryCode: rev.countryCode,
            source: 'GPS',
            currency: detectCurrencyFromCountry(rev.countryCode),
          });
        } catch {
          resolve({
            lat,
            lng,
            source: 'GPS',
            currency: 'CHF',
          });
        }
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });

  try {
    return await gpsPromise;
  } catch {
    // GPS failed or permissions blocked (e.g. inside iframe)
  }

  // 2. Try IP Geolocation (ipwho.is)
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        const countryCode = data.country_code || 'CH';
        return {
          lat: Number(data.latitude.toFixed(6)),
          lng: Number(data.longitude.toFixed(6)),
          city: data.city || '',
          country: data.country || '',
          countryCode,
          source: 'IP',
          currency: detectCurrencyFromCountry(countryCode),
        };
      }
    }
  } catch {
    // ipwho.is failed or blocked by ad-blocker
  }

  // 3. Try IP Geolocation fallback (ipapi.co)
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const countryCode = data.country_code || 'CH';
        return {
          lat: Number(data.latitude.toFixed(6)),
          lng: Number(data.longitude.toFixed(6)),
          city: data.city || '',
          country: data.country_name || '',
          countryCode,
          source: 'IP',
          currency: detectCurrencyFromCountry(countryCode),
        };
      }
    }
  } catch {
    // ipapi blocked
  }

  // 4. TimeZone Mapping fallback (always succeeds on all modern browsers without network)
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
  } catch {
    // Timezone check failed
  }

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
