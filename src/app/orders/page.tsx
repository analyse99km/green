'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, Store } from '@/lib/types';
import { useCurrency } from '@/components/CurrencyContext';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Store as StoreIcon,
  Banknote,
  QrCode,
} from 'lucide-react';

export default function OrdersFullViewPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [oRes, sRes] = await Promise.all([fetch('/api/orders'), fetch('/api/stores')]);
        const oData = await oRes.json();
        const sData = await sRes.json();
        if (oData.success) {
          setOrders(oData.orders || []);
          if (oData.orders?.length > 0) setSelectedOrder(oData.orders[0]);
        }
        if (sData.success) setStores(sData.stores || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const storeMap = new Map(stores.map((s) => [s.id, s]));

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q) ||
      o.buyerContact.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600" />
            <span>Order Full View & Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Inspect full order breakdowns, selected add-ons, COD/P2P payment status, and seller updates.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order #, Name, or Phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-neutral-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="font-bold text-sm text-neutral-800 dark:text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-neutral-500">Add items to your cart from any store and place an order to see its full view here.</p>
          <Link href="/" className="inline-block px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
            Explore Stores
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredOrders.map((ord) => {
              const store = storeMap.get(ord.storeId);
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white dark:bg-neutral-900 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-emerald-600">{ord.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white mt-1">
                    {store?.name || 'Store'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-2">
                    <span>{ord.items.length} item(s) • {ord.paymentMethod}</span>
                    <span className="font-black text-neutral-900 dark:text-white">{formatPrice(ord.totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Order Full View */}
          <div className="lg:col-span-7">
            {selectedOrder && (
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-600">{selectedOrder.orderNumber}</span>
                    <h2 className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                      Full Order Summary
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    {selectedOrder.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span>{selectedOrder.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Store & Buyer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                    <span className="font-bold text-neutral-500 uppercase text-[10px] flex items-center gap-1">
                      <StoreIcon className="w-3.5 h-3.5" /> Seller Store
                    </span>
                    {(() => {
                      const st = storeMap.get(selectedOrder.storeId);
                      return st ? (
                        <>
                          <div className="font-bold text-sm text-neutral-900 dark:text-white">{st.name}</div>
                          <div className="text-neutral-500">{st.address}</div>
                          <div className="font-mono text-emerald-600">{st.phoneNumber}</div>
                        </>
                      ) : (
                        <div>Store ID: {selectedOrder.storeId}</div>
                      );
                    })()}
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                    <span className="font-bold text-neutral-500 uppercase text-[10px] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Buyer & Fulfillment
                    </span>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white">{selectedOrder.buyerName}</div>
                    <div className="font-mono text-neutral-600 dark:text-neutral-400">{selectedOrder.buyerContact}</div>
                    <div className="text-neutral-500">
                      {selectedOrder.deliveryType === 'SELF_PICKUP' ? '🏪 In-Store Pickup' : `🛵 Delivery to: ${selectedOrder.deliveryAddress}`}
                    </div>
                  </div>
                </div>

                {/* Items & Add-ons Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Items & Add-Ons</h3>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-neutral-100" />
                          )}
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">
                              {item.quantity} × {item.title}
                            </div>
                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                Add-ons: {item.selectedAddons.map((a) => `${a.name} (+${formatPrice(a.price)})`).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-neutral-900 dark:text-white shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & Total */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                      {selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? (
                        <Banknote className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <QrCode className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>Payment Method: {selectedOrder.paymentMethod.replace(/_/g, ' ')}</span>
                    </div>
                    {selectedOrder.transactionId && (
                      <div className="font-mono text-[11px] text-neutral-500">
                        Reference / TxID: {selectedOrder.transactionId}
                      </div>
                    )}
                    {selectedOrder.sellerNote && (
                      <div className="text-emerald-600 font-semibold">Seller Note: {selectedOrder.sellerNote}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500">Total Amount</span>
                    <div className="text-2xl font-black text-emerald-600">{formatPrice(selectedOrder.totalAmount)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
