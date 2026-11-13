'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Store, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { calculateDistanceKm } from '@/lib/geo';
import { detectUserLocation } from '@/lib/geoClient';
import { useCurrency } from '@/components/CurrencyContext';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Globe, 
  Coffee, 
  CheckCircle, 
  Store as StoreIcon, 
  Sparkles,
  ArrowRight,
  Flame,
  Truck,
  ShieldCheck,
  Coins,
  Navigation,
  Plus
} from 'lucide-react';

// Dynamic import for Leaflet map component (SSR safe)
const DiscoveryMap = dynamic(() => import('@/components/DiscoveryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse flex items-center justify-center text-xs text-neutral-400">
      Loading interactive marketplace map...
    </div>
  ),
});

export default function HomePage() {
  const { currency, setCurrency } = useCurrency();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOCAL' | 'GLOBAL' | 'HOSPITALITY'>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 47.3769, lng: 8.5417 });
  const [locationLabel, setLocationLabel] = useState('Zürich, Switzerland (Default)');
  const [citySearch, setCitySearch] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Auto-detect location & matching currency immediately on site open
  useEffect(() => {
    async function initLocation() {
      try {
        const loc = await detectUserLocation();
        setUserLocation({ lat: loc.lat, lng: loc.lng });
        setLocationLabel(
          loc.city && loc.country
            ? `${loc.city}, ${loc.country}`
            : loc.source === 'GPS'
            ? `GPS Active (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)})`
            : 'Zürich, Switzerland'
        );

        // Auto-switch currency according to detected location if user hasn't explicitly selected one
        const userHasChosen = localStorage.getItem('green_user_currency');
        if (!userHasChosen && loc.currency) {
          setCurrency(loc.currency);
        }

        // If location could not be determined at all (default fallback), show location/currency selection popup
        if (loc.source === 'DEFAULT' && !localStorage.getItem('green_location_confirmed')) {
          setShowLocationPopup(true);
        }
      } catch {
        // Fallback default
        setShowLocationPopup(true);
      }
    }
    initLocation();
  }, [setCurrency]);

  // Load stores and products
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [storesRes, productsRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/products/search'),
        ]);
        const storesData = await storesRes.json();
        const productsData = await productsRes.json();

        if (storesData && storesData.success && Array.isArray(storesData.stores)) {
          setStores(storesData.stores);
        } else {
          setStores([]);
        }

        if (productsData && productsData.success && Array.isArray(productsData.results)) {
          setProducts(productsData.results.map((r: any) => r.product).filter(Boolean));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load marketplace data:', err);
        setStores([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Request/refresh real location (GPS + IP fallback)
  const handleGetLocation = async () => {
    setIsGeocoding(true);
    try {
      const loc = await detectUserLocation();
      setUserLocation({ lat: loc.lat, lng: loc.lng });
      setLocationLabel(
        loc.city && loc.country
          ? `${loc.city}, ${loc.country}`
          : `${loc.source} (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)})`
      );
      if (loc.currency) setCurrency(loc.currency);
    } catch {
      setUserLocation({ lat: 47.3769, lng: 8.5417 });
      setLocationLabel('Zürich, Switzerland');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Real Geocoding search via OpenStreetMap Nominatim
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(citySearch)}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setUserLocation({ lat, lng });
        setLocationLabel(data[0].display_name.split(',').slice(0, 2).join(', '));
      } else {
        alert('Location not found. Try "Zurich HB", "Winterthur", or "Zug".');
      }
    } catch {
      alert('Geocoding error. Check internet connection.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Filter stores according to active tab, verified filter, and search
  const filteredStores = stores
    .filter((s) => {
      if (verifiedOnly && !s.isVerified) return false;
      if (activeTab === 'LOCAL' && s.deliveryType === 'GLOBAL') return false;
      if (activeTab === 'GLOBAL' && s.deliveryType === 'LOCAL') return false;
      if (activeTab === 'HOSPITALITY' && s.category !== 'HOSPITALITY') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStore =
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          `#${s.storeNumber}`.includes(q);
        const matchProduct = products.some(
          (p) => p.storeId === s.id && (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
        );
        return matchStore || matchProduct;
      }
      return true;
    })
    .sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distA - distB;
    });

  // Filter products according to search query and active tab
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const filteredProducts = products.filter((p) => {
    const store = storeMap.get(p.storeId);
    if (!store || store.isSuspended) return false;
    if (verifiedOnly && !store.isVerified) return false;
    if (activeTab === 'LOCAL' && store.deliveryType === 'GLOBAL') return false;
    if (activeTab === 'GLOBAL' && store.deliveryType === 'LOCAL') return false;
    if (activeTab === 'HOSPITALITY' && store.category !== 'HOSPITALITY') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        store.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Hero Platform Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-neutral-900 to-neutral-950 text-white p-6 sm:p-10 border border-emerald-500/20 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Coins className="w-3.5 h-3.5" />
            <span>Zero Platform Fees • 100% P2P Commerce</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Discover Local & Global Stores on the Map.
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Every store is independently operated. Explore local artisans, reserve dining tables, order global electronics, and pay sellers directly with QR or crypto.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/create-store"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <StoreIcon className="w-4 h-4" />
              <span>Open Your Free Store</span>
            </Link>

            <Link
              href="/hospitality"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-colors"
            >
              Explore Cafes & Dining →
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Universal Search & Real Location Service Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items or stores (e.g. sourdough, fondue, keyboard, chocolate)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <form onSubmit={handleCitySearch} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Set location (e.g. Zurich, Zug)..."
              className="flex-1 md:w-52 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs"
            />
            <button
              type="submit"
              disabled={isGeocoding}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shrink-0"
            >
              {isGeocoding ? '...' : 'Set'}
            </button>
          </form>

          <button
            onClick={handleGetLocation}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Navigation className="w-4 h-4" />
            <span>Use My GPS</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-1">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Location: <strong className="text-neutral-800 dark:text-neutral-200">{locationLabel}</strong></span>
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700 dark:text-emerald-400">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Show Verified Stores Only</span>
          </label>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Worldwide Map', icon: Globe },
          { id: 'LOCAL', label: 'Local Buy & Pickup', icon: ShoppingBag },
          { id: 'GLOBAL', label: 'Global Sellers', icon: Truck },
          { id: 'HOSPITALITY', label: 'Cafes & Dining', icon: Coffee },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Leaflet Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Interactive Store Map</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Surf store pins globally. Click any marker to view Store #, delivery perimeter, and catalog.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {filteredStores.length} Stores Available
          </span>
        </div>

        <DiscoveryMap
          stores={filteredStores}
          selectedStoreId={selectedStoreId}
          onSelectStore={(s) => setSelectedStoreId(s.id)}
          userLocation={userLocation}
          height="460px"
        />
      </section>

      {/* Store Directory Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <StoreIcon className="w-5 h-5 text-emerald-600" />
              <span>Featured Storefronts</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Each allocated a unique sequential store number.
            </p>
          </div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="py-14 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-8">
            <StoreIcon className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">No Stores Online Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
              Be the first merchant to open a decentralized store! Zero setup fees, complete data ownership.
            </p>
            <Link
              href="/create-store"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your Store</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStores.map((s) => {
              const distKm = calculateDistanceKm(userLocation.lat, userLocation.lng, s.latitude, s.longitude);
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStoreId(s.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedStoreId === s.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-white dark:bg-neutral-900'
                      : s.isVerified
                      ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-neutral-900 dark:to-neutral-900 hover:border-emerald-500 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                        Store #{String(s.storeNumber).padStart(2, '0')}
                      </span>
                      {s.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-neutral-400">Standard</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {s.logoUrl ? (
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          <StoreIcon className="w-4 h-4 text-neutral-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">{s.name}</h3>
                        <p className="text-[10px] text-emerald-600 font-bold">📍 {distKm} km away</p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-2">{s.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      {s.deliveryType === 'GLOBAL' ? '🌐 Global' : `🛵 ${s.deliveryRadiusKm} km`}
                    </span>
                    <Link
                      href={`/store/${s.slug}`}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Visit Store →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Catalog Grid */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Available Products & Dishes</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Browse products with live flash sale discounts and direct P2P order checkout.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {filteredProducts.length} items
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            <p className="font-semibold text-sm">No items found matching your filter.</p>
            <p className="text-xs text-neutral-400 mt-1">Try searching for other keywords or clear filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const store = storeMap.get(product.storeId);
              if (!store) return null;
              return <ProductCard key={product.id} product={product} store={store} />;
            })}
          </div>
        )}
      </section>

      {/* Region & Currency Selection Popup (Appears if location not detected) */}
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-lg font-bold">
                🇨🇭
              </div>
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  Welcome to GREEN Marketplace
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Default currency: <strong className="text-emerald-600">Swiss Franc (CHF)</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              We couldn't automatically detect your exact location. Select your currency below or continue with Swiss Franc (CHF):
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { code: 'CHF', label: '🇨🇭 Swiss Franc (Default)', symbol: 'CHF' },
                { code: 'EUR', label: '🇪🇺 Euro', symbol: '€' },
                { code: 'USD', label: '🇺🇸 US Dollar', symbol: '$' },
                { code: 'INR', label: '🇮🇳 Indian Rupee', symbol: '₹' },
                { code: 'GBP', label: '🇬🇧 British Pound', symbol: '£' },
                { code: 'JPY', label: '🇯🇵 Japanese Yen', symbol: '¥' },
                { code: 'CAD', label: '🇨🇦 Canadian Dollar', symbol: 'C$' },
                { code: 'AUD', label: '🇦🇺 Australian Dollar', symbol: 'A$' },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    localStorage.setItem('green_location_confirmed', 'true');
                    setShowLocationPopup(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    currency === c.code
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{c.label}</span>
                    <span className="font-mono text-[10px] opacity-60 ml-1">{c.symbol}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrency('CHF');
                  localStorage.setItem('green_location_confirmed', 'true');
                  setShowLocationPopup(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Continue with Swiss Franc (CHF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
