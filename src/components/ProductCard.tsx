'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ProductAddon, Store } from '@/lib/types';
import { useCurrency } from './CurrencyContext';
import { useCart } from './CartContext';
import { Sparkles, Flame, Clock, ShoppingBag, Plus, Check, ShieldCheck, Banknote } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  store: Store;
}

export default function ProductCard({ product, store }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product.saleCountdownEndsAt) return;

    const updateTimer = () => {
      const difference = new Date(product.saleCountdownEndsAt!).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft('Sale ended');
        return;
      }
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product.saleCountdownEndsAt]);

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalUnitPrice = product.price + addonsTotal;

  const isOutOfStock = product.inventory <= 0;
  const storeNumberFormatted = `#${String(store.storeNumber).padStart(2, '0')}`;

  const imageSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  const handleAddOnly = () => {
    addToCart(product, store, 1, selectedAddons, false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      className={`group relative bg-white dark:bg-neutral-900 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
        store.isVerified
          ? 'border-emerald-500/30 hover:border-emerald-500 hover:shadow-lg'
          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 hover:shadow-md'
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={imageSrc}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Left Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isFamousDish && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
              <Sparkles className="w-3 h-3" /> Famous Dish
            </span>
          )}

          {timeLeft && timeLeft !== 'Sale ended' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm">
              <Clock className="w-3 h-3 animate-pulse" /> {timeLeft}
            </span>
          )}
        </div>

        {/* Top Right COD Badge */}
        {product.allowCod && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900/80 text-emerald-300 backdrop-blur-xs border border-emerald-500/30">
              <Banknote className="w-3 h-3" /> COD
            </span>
          </div>
        )}

        {/* Fake Stock Alarm */}
        {product.fakeStockAlarm && !isOutOfStock && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-900/85 text-amber-300 backdrop-blur-xs border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400" /> Only {product.fakeStockAlarm} left!
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Store Identification with Logo & Verified Seal */}
          <Link
            href={`/store/${store.slug}`}
            className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold mb-2 transition-colors"
          >
            {store.logoUrl && (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-5 h-5 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
              />
            )}
            <span className="truncate">
              {storeNumberFormatted} • {store.name}
            </span>
            {store.isVerified && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0"
                title="Verified Store"
              >
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </Link>

          <h3 className="font-bold text-neutral-900 dark:text-white text-base line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Optional Add-Ons Selector */}
          {product.addons && product.addons.length > 0 && (
            <div className="mt-3 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Available Add-ons:
              </span>
              {product.addons.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    className="flex items-center justify-between gap-2 text-[11px] cursor-pointer py-0.5 hover:text-emerald-600"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddon(addon)}
                        className="accent-emerald-600 rounded"
                      />
                      <span className="truncate">{addon.name}</span>
                    </span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
                      +{formatPrice(addon.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing & Dual Cart Actions */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {formatPrice(totalUnitPrice)}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] font-semibold text-neutral-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {product.customDeliveryRadiusKm
                ? `🛵 ${product.customDeliveryRadiusKm} km`
                : store.deliveryType === 'GLOBAL'
                ? '🌐 Global'
                : `🛵 ${store.deliveryRadiusKm} km`}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddOnly}
              disabled={isOutOfStock}
              title="Add to Cart & Keep Browsing"
              className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                isOutOfStock
                  ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                  : justAdded
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              {justAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{justAdded ? 'Added' : 'Cart'}</span>
            </button>

            <button
              onClick={() => addToCart(product, store, 1, selectedAddons, true)}
              disabled={isOutOfStock}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                isOutOfStock
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
