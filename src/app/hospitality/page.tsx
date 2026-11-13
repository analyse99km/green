'use client';

import React, { useState, useEffect } from 'react';
import { Store, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ReservationModal from '@/components/ReservationModal';
import { Coffee, Utensils, Sparkles, Calendar, MapPin, Store as StoreIcon } from 'lucide-react';

export default function HospitalityPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reservationStore, setReservationStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/stores?category=HOSPITALITY'),
          fetch('/api/products/search?category=HOSPITALITY'),
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

  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const famousDishes = products.filter((p) => p.isFamousDish);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hospitality Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-900 via-orange-950 to-neutral-950 text-white p-6 sm:p-10 border border-amber-500/20 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Utensils className="w-3.5 h-3.5" />
          <span>Dining, Cafes & Hospitality</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">Famous Dishes & Table Reservations</h1>
        <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
          Browse famous chef specials, organic bakery items, and book tables directly at verified local cafes and bistros with zero reservation fees.
        </p>
      </div>

      {/* Hospitality Venues (Cafes & Restaurants) */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-500" />
          <span>Featured Cafes & Bistros</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-all"
            >
              <div className="sm:w-2/5 h-48 sm:h-auto bg-neutral-200 relative shrink-0">
                <img
                  src={s.bannerUrl || s.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-neutral-900/80 text-white backdrop-blur-xs">
                  Store #{String(s.storeNumber).padStart(2, '0')}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">{s.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{s.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">{s.address}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                  <button
                    onClick={() => setReservationStore(s)}
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Table</span>
                  </button>

                  <a
                    href={`/store/${s.slug}`}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300"
                  >
                    Menu →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Famous Dishes & Specialties Highlight */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Chef's Signature & Famous Dishes</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Highly-rated culinary items crafted by our hospitality partners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {famousDishes.map((p) => {
            const store = storeMap.get(p.storeId);
            if (!store) return null;
            return <ProductCard key={p.id} product={p} store={store} />;
          })}
        </div>
      </section>

      {/* Reservation Modal */}
      {reservationStore && (
        <ReservationModal
          store={reservationStore}
          isOpen={true}
          onClose={() => setReservationStore(null)}
        />
      )}
    </div>
  );
}
