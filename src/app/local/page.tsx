'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Store, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { calculateDistanceKm } from '@/lib/geo';
import { detectUserLocation } from '@/lib/geoClient';
import { ShoppingBag, MapPin, SlidersHorizontal, Store as StoreIcon, ShieldCheck } from 'lucide-react';

const DiscoveryMap = dynamic(() => import('@/components/DiscoveryMap'), {
  ssr: false,
  loading: () => <div className="h-[360px] bg-neutral-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />,
});

export default function LocalBuyPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(15);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null); // Default Zurich center
  const [allowPickupOnly, setAllowPickupOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-detect real user location
    async function initLoc() {
      try {
        const loc = await detectUserLocation();
        setUserLocation({ lat: loc.lat, lng: loc.lng });
      } catch {}
    }
    initLoc();

    async function load() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/products/search'),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();
        if (sData.success) setStores(sData.stores);
        if (pData.success) setProducts(pData.results.map((r: any) => r.product));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filter local stores within radius or with pickup
  const localStores = stores.filter((s) => {
    const dist = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, s.latitude, s.longitude) : 0;
    const withinRadius = dist <= Math.min(s.deliveryRadiusKm, maxRadiusKm);
    if (allowPickupOnly) return s.allowSelfPickup;
    return withinRadius || s.allowSelfPickup;
  });

  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const localProducts = products.filter((p) => {
    const store = storeMap.get(p.storeId);
    if (!store) return false;
    const dist = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, store.latitude, store.longitude) : 0;
    const effectiveRadius = p.customDeliveryRadiusKm ?? store.deliveryRadiusKm;
    if (allowPickupOnly) return store.allowSelfPickup;
    return dist <= Math.min(effectiveRadius, maxRadiusKm) || store.allowSelfPickup;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Hyper-Local Commerce</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white">Local Buy & Neighborhood Stores</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Discover neighborhood shops, artisan bakers, and local eateries within your custom delivery perimeter.
          </p>
        </div>

        {/* Radius Filter Control */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2 min-w-[280px]">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Max Delivery Distance:
            </span>
            <span className="text-emerald-600 font-extrabold">{maxRadiusKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={maxRadiusKm}
            onChange={(e) => setMaxRadiusKm(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />

          <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPickupOnly}
                onChange={(e) => setAllowPickupOnly(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span>In-Person Pickup Only</span>
            </label>
            <span>{localStores.length} stores nearby</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <DiscoveryMap stores={localStores} userLocation={userLocation} height="380px" />

      {/* Local Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Local Items Deliverable to You ({localProducts.length})
          </h2>
          <span className="text-xs text-neutral-500">
            Based on current coordinates ({userLocation ? `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}` : 'Detecting...'})
          </span>
        </div>

        {localProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <p className="font-bold text-sm">No local products found within {maxRadiusKm} km.</p>
            <p className="text-xs text-neutral-400 mt-1">Try increasing the distance slider above or explore worldwide sellers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {localProducts.map((p) => {
              const store = storeMap.get(p.storeId);
              if (!store) return null;
              return <ProductCard key={p.id} product={p} store={store} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
