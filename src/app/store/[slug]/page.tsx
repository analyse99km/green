'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Store, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ReservationModal from '@/components/ReservationModal';
import StoreShareModal from '@/components/StoreShareModal';
import { 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Truck, 
  Sparkles,
  AlertTriangle,
  Clock,
  QrCode
} from 'lucide-react';

function StorefrontContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    async function loadStore() {
      setIsLoading(true);
      try {
        const [storeRes, prodRes] = await Promise.all([
          fetch(`/api/stores/${slug}`),
          fetch(`/api/stores/${slug}/products`),
        ]);
        const storeData = await storeRes.json();
        const prodData = await prodRes.json();

        if (!storeData.success) {
          throw new Error(storeData.error || 'Store not found');
        }

        setStore(storeData.store);
        if (prodData.success) {
          setProducts(prodData.products);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
    loadStore();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-neutral-400">
        Loading custom storefront...
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <StoreIcon className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Store Not Found</h2>
        <p className="text-xs text-neutral-500">The requested store does not exist or may have been unlisted.</p>
        <a href="/" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Explore Other Stores
        </a>
      </div>
    );
  }

  // Tags filter
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags || [])));
  const filteredProducts = selectedTag === 'ALL'
    ? products
    : products.filter((p) => p.tags && p.tags.includes(selectedTag));

  const storeNumberFormatted = `#${String(store.storeNumber).padStart(2, '0')}`;

  return (
    <div className="min-h-screen space-y-6">
      {/* Inject Seller Custom CSS if provided */}
      {store.customCss && <style dangerouslySetInnerHTML={{ __html: store.customCss }} />}

      {/* Seller Custom Announcement Bar */}
      {store.themeConfig?.announcementText && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center">
          {store.themeConfig.announcementText}
        </div>
      )}

      {/* Store Suspension Alert (if suspended by Master Admin) */}
      {store.isSuspended && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <strong className="font-bold">Store Temporarily Suspended:</strong>
              <p className="text-xs mt-0.5">{store.suspensionReason || 'This storefront is currently under review by Platform Master Control.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Storefront Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm min-h-[240px] flex items-end">
          {store.bannerUrl && (
            <img
              src={store.bannerUrl}
              alt={store.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
          )}

          <div className="relative z-10 p-6 sm:p-8 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase bg-white/20 text-white backdrop-blur-md">
                  Store {storeNumberFormatted}
                </span>

                {store.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Store
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/10 text-neutral-300 backdrop-blur-md">
                  {store.category}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {store.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={`${store.name} logo`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white/30 shadow-lg shrink-0"
                  />
                )}
                <h1 className="text-2xl sm:text-4xl font-black text-white">{store.name}</h1>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">{store.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{store.address}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{store.phoneNumber}</span>
                </span>
                {store.ownerEmail && (
                  <span className="flex items-center gap-1.5">
                    <span>✉️ {store.ownerEmail}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {store.deliveryType === 'GLOBAL' ? 'Global Shipping' : `Delivery up to ${store.deliveryRadiusKm} km`}
                  </span>
                </span>
              </div>
            </div>

            {/* Action buttons (Share Store QR & Table reservation) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                title="Share Storefront QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span>Share QR</span>
              </button>

              {store.category === 'HOSPITALITY' && (
                <button
                  onClick={() => setIsReservationOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve a Table</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Category / Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTag === 'ALL'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              All Items ({products.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <p className="font-semibold text-sm">No items listed in this section yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        )}
      </div>

      {/* Table Booking Modal */}
      {isReservationOpen && (
        <ReservationModal
          store={store}
          isOpen={true}
          onClose={() => setIsReservationOpen(false)}
        />
      )}

      {/* Store QR Share Modal */}
      {isShareModalOpen && store && (
        <StoreShareModal
          store={store}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-neutral-400">
          Loading custom storefront...
        </div>
      }
    >
      <StorefrontContent />
    </Suspense>
  );
}
