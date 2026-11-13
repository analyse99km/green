'use client';

import React, { useState, useEffect } from 'react';
import { Store, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { Globe, Plane, ShieldCheck, Search } from 'lucide-react';

export default function GlobalSellersPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/products/search'),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();
        if (sData.success) {
          setStores(sData.stores.filter((s: Store) => s.deliveryType === 'GLOBAL' || s.deliveryType === 'BOTH'));
        }
        if (pData.success) {
          setProducts(pData.results.map((r: any) => r.product));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const globalProducts = products.filter((p) => {
    const store = storeMap.get(p.storeId);
    if (!store) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        store.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl bg-neutral-900 text-white p-6 sm:p-10 border border-neutral-800 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Globe className="w-3.5 h-3.5" />
          <span>Worldwide Cross-Border Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">Global Sellers & Direct Imports</h1>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Order directly from makers, hardware designers, and manufacturers worldwide with zero middlemen. Pay sellers in your local currency or crypto.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search global items (e.g. keyboards, ceramics, gadgets)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Global Stores Strip */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Plane className="w-4 h-4 text-purple-500" />
          <span>Global Stores Shipping Worldwide</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stores.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  Store #{String(s.storeNumber).padStart(2, '0')}
                </span>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white mt-1">{s.name}</h4>
                <p className="text-xs text-neutral-500">{s.address}</p>
              </div>
              <a href={`/store/${s.slug}`} className="text-xs font-bold text-emerald-600 hover:underline">
                View →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Global Products Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Worldwide Products ({globalProducts.length})
        </h2>

        {globalProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-500">No global products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {globalProducts.map((p) => {
              const store = storeMap.get(p.storeId);
              if (!store) return null;
              return <ProductCard key={p.id} product={p} store={store} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
