'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductAddon, Store } from '@/lib/types';

export interface CartItem {
  cartKey: string; // Unique key combining productId + sorted addon ids
  product: Product;
  quantity: number;
  selectedAddons: ProductAddon[];
}

interface CartContextType {
  items: CartItem[];
  store: Store | null;
  addToCart: (product: Product, store: Store, quantity?: number, selectedAddons?: ProductAddon[], openDrawer?: boolean) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotalUSD: number;
  canUseCod: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  store: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  totalCount: 0,
  subtotalUSD: 0,
  canUseCod: false,
});

function makeCartKey(productId: string, addons: ProductAddon[]): string {
  const addonIds = addons.map((a) => a.id).sort().join(',');
  return `${productId}::${addonIds}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('green_cart_items');
      const savedStore = localStorage.getItem('green_cart_store');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Normalize legacy items without cartKey
        const normalized = Array.isArray(parsed)
          ? parsed.map((i: any) => ({
              ...i,
              selectedAddons: i.selectedAddons || [],
              cartKey: i.cartKey || makeCartKey(i.product.id, i.selectedAddons || []),
            }))
          : [];
        setItems(normalized);
      }
      if (savedStore) setStore(JSON.parse(savedStore));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('green_cart_items', JSON.stringify(items));
      if (store) {
        localStorage.setItem('green_cart_store', JSON.stringify(store));
      } else {
        localStorage.removeItem('green_cart_store');
      }
    } catch {}
  }, [items, store]);

  const addToCart = (
    product: Product,
    newStore: Store,
    quantity = 1,
    selectedAddons: ProductAddon[] = [],
    openDrawer = true
  ) => {
    const key = makeCartKey(product.id, selectedAddons);

    if (store && store.id !== newStore.id && items.length > 0) {
      if (
        confirm(
          `Your cart already contains items from "${store.name}". Clear cart and start a new order with "${newStore.name}"?`
        )
      ) {
        setItems([{ cartKey: key, product, quantity, selectedAddons }]);
        setStore(newStore);
        if (openDrawer) setIsCartOpen(true);
      }
      return;
    }

    setStore(newStore);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === key);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.inventory) }
            : i
        );
      }
      return [...prev, { cartKey: key, product, quantity: Math.min(quantity, product.inventory), selectedAddons }];
    });
    if (openDrawer) setIsCartOpen(true);
  };

  const removeFromCart = (cartKey: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.cartKey !== cartKey);
      if (filtered.length === 0) setStore(null);
      return filtered;
    });
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.cartKey === cartKey ? { ...i, quantity: Math.min(quantity, i.product.inventory) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setStore(null);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUSD = items.reduce((sum, item) => {
    const addonsTotal = (item.selectedAddons || []).reduce((aSum, a) => aSum + a.price, 0);
    return sum + (item.product.price + addonsTotal) * item.quantity;
  }, 0);
  const canUseCod = items.length > 0 && items.every((i) => Boolean(i.product.allowCod));

  return (
    <CartContext.Provider
      value={{
        items,
        store,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotalUSD,
        canUseCod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
