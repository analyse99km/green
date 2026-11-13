'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useCart } from './CartContext';
import { useCurrency } from './CurrencyContext';
import { PaymentMethodType } from '@/lib/types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  QrCode,
  Truck,
  Store as StoreIcon,
  CheckCircle2,
  Copy,
  AlertCircle,
  Clock,
  Sparkles,
  Banknote,
  ExternalLink,
} from 'lucide-react';

export default function CartCheckoutModal() {
  const {
    items,
    store,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotalUSD,
    canUseCod,
  } = useCart();
  const { formatPrice, currency, setCurrency, availableCurrencies, currentRate, isLiveRate } = useCurrency();

  const [step, setStep] = useState<'CART' | 'CHECKOUT' | 'PAYMENT' | 'SUCCESS'>('CART');
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'SELF_PICKUP'>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('QR_UPI');
  const [transactionId, setTransactionId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasQrUpi = Boolean(store?.paymentConfig?.qrCodeUrl || store?.paymentConfig?.upiId);
  const hasCrypto = Boolean(
    store?.paymentConfig?.cryptoAddresses &&
      Object.values(store.paymentConfig.cryptoAddresses).some((v) => Boolean(v && String(v).trim()))
  );
  const hasBank = Boolean(store?.paymentConfig?.bankDetails?.accountNumber);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerContact.trim()) {
      setErrorMessage('Please provide your name and contact phone number.');
      return;
    }
    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your delivery address.');
      return;
    }
    setErrorMessage('');
    if (canUseCod) {
      setPaymentMethod('CASH_ON_DELIVERY');
    } else if (hasBank) {
      setPaymentMethod('BANK_TRANSFER');
    } else if (hasQrUpi) {
      setPaymentMethod('QR_UPI');
    } else if (hasCrypto) {
      setPaymentMethod('CRYPTO');
    }
    setStep('PAYMENT');
  };

  const handleSubmitOrder = async () => {
    if (!store) return;
    if (paymentMethod !== 'CASH_ON_DELIVERY' && !transactionId.trim()) {
      setErrorMessage('Please enter the Transaction Reference ID or Hash provided after payment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          buyerName,
          buyerContact,
          deliveryAddress: deliveryType === 'SELF_PICKUP' ? 'Store Pickup' : deliveryAddress,
          deliveryType,
          items: items.map((i) => ({
            productId: i.product.id,
            title: i.product.title,
            price: i.product.price + (i.selectedAddons || []).reduce((s, a) => s + a.price, 0),
            quantity: i.quantity,
            imageUrl: i.product.images?.[0],
            selectedAddons: i.selectedAddons || [],
          })),
          totalAmount: subtotalUSD,
          currency,
          paymentMethod,
          transactionId: paymentMethod === 'CASH_ON_DELIVERY' ? 'CASH_ON_DELIVERY' : transactionId,
          proofUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      setConfirmedOrder(data.order);
      setStep('SUCCESS');
      clearCart();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === 'SUCCESS') {
      setStep('CART');
      setConfirmedOrder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 h-full flex flex-col shadow-2xl border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Your Cart</span>
              {store && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Store #{String(store.storeNumber).padStart(2, '0')}
                </span>
              )}
            </h2>
            {store && <p className="text-xs text-neutral-500 truncate max-w-xs">{store.name}</p>}
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {step === 'CART' && (
            <>
              {items.length === 0 ? (
                <div className="py-16 text-center text-neutral-500">
                  <p className="font-medium text-sm">Your cart is currently empty.</p>
                  <p className="text-xs text-neutral-400 mt-1">Explore stores and click "+ Cart" to bundle multiple items!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(({ cartKey, product, quantity, selectedAddons }) => {
                    const addonsTotal = (selectedAddons || []).reduce((s, a) => s + a.price, 0);
                    const unitPrice = product.price + addonsTotal;
                    return (
                      <div
                        key={cartKey}
                        className="flex gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50"
                      >
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover bg-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {product.title}
                          </h4>
                          {selectedAddons && selectedAddons.length > 0 && (
                            <div className="text-[10px] text-neutral-500 mt-0.5 space-y-0.5">
                              {selectedAddons.map((a) => (
                                <div key={a.id}>+ {a.name} ({formatPrice(a.price)})</div>
                              ))}
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {formatPrice(unitPrice)} × {quantity} = {formatPrice(unitPrice * quantity)}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 px-1 py-0.5">
                              <button
                                onClick={() => updateQuantity(cartKey, quantity - 1)}
                                className="p-1 hover:text-red-500"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1.5">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(cartKey, quantity + 1)}
                                disabled={quantity >= product.inventory}
                                className="p-1 hover:text-emerald-500 disabled:opacity-40"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(cartKey)}
                              className="text-neutral-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex gap-2">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Platform Delivery Network: Coming Soon 🔒</strong>
                      <p className="text-neutral-600 dark:text-amber-300/80 mt-0.5">
                        The seller directly handles order fulfillment via self-delivery or in-person pickup. Zero platform cuts!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'CHECKOUT' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs">
                <span className="font-bold">Ordering from:</span> {store?.name} (Store #{String(store?.storeNumber).padStart(2, '0')})
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Lukas Meier"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mobile Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={buyerContact}
                  onChange={(e) => setBuyerContact(e.target.value)}
                  placeholder="e.g. +41 79 123 45 67"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Fulfillment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('DELIVERY')}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      deliveryType === 'DELIVERY'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Seller Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('SELF_PICKUP')}
                    disabled={!store?.allowSelfPickup}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      deliveryType === 'SELF_PICKUP'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <StoreIcon className="w-4 h-4" />
                    <span>In-Store Pickup</span>
                  </button>
                </div>
              </div>

              {deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, Building, Postal Code, Zurich"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              )}
            </form>
          )}

          {step === 'PAYMENT' && store && (
            <div className="space-y-4">
              {/* Currency & Live Rate Selector inside Payment Step */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-semibold">Viewing Currency:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-emerald-500/30"
                  >
                    {Object.values(availableCurrencies).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                    {formatPrice(subtotalUSD)}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500">
                    {isLiveRate ? '🟢 Live Rate:' : 'Rate:'} 1 USD = {currentRate < 0.01 ? currentRate.toFixed(6) : currentRate.toFixed(4)} {currency}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Select Seller Payment Option:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!canUseCod}
                    onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                      !canUseCod
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 text-neutral-400 cursor-not-allowed opacity-60'
                        : paymentMethod === 'CASH_ON_DELIVERY'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Cash on Delivery</span>
                    {!canUseCod && <span className="text-[9px] font-normal text-red-500">Unavailable for this seller</span>}
                  </button>

                  <button
                    type="button"
                    disabled={!hasQrUpi}
                    onClick={() => setPaymentMethod('QR_UPI')}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                      !hasQrUpi
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 text-neutral-400 cursor-not-allowed opacity-60'
                        : paymentMethod === 'QR_UPI'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> QR Code / Twint</span>
                    {!hasQrUpi && <span className="text-[9px] font-normal text-red-500">Unavailable for this seller</span>}
                  </button>

                  <button
                    type="button"
                    disabled={!hasCrypto}
                    onClick={() => setPaymentMethod('CRYPTO')}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                      !hasCrypto
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 text-neutral-400 cursor-not-allowed opacity-60'
                        : paymentMethod === 'CRYPTO'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><span>₿</span> Crypto Address</span>
                    {!hasCrypto && <span className="text-[9px] font-normal text-red-500">Unavailable for this seller</span>}
                  </button>

                  <button
                    type="button"
                    disabled={!hasBank}
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                      !hasBank
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 text-neutral-400 cursor-not-allowed opacity-60'
                        : paymentMethod === 'BANK_TRANSFER'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><span>🏦</span> Bank Wire</span>
                    {!hasBank && <span className="text-[9px] font-normal text-red-500">Unavailable for this seller</span>}
                  </button>
                </div>
              </div>

              {/* Payment Details Display */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
                {paymentMethod === 'CASH_ON_DELIVERY' && (
                  <div className="text-center space-y-2 py-2">
                    <Banknote className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Cash on Delivery (COD) Enabled
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Pay <span className="font-bold text-emerald-600">{formatPrice(subtotalUSD)}</span> directly in cash when the seller delivers your order or at pickup.
                    </p>
                  </div>
                )}

                {paymentMethod === 'QR_UPI' && (
                  <div className="text-center space-y-2">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      Scan Seller Direct QR with your Payment / Twint / UPI app:
                    </p>
                    {store.paymentConfig.qrCodeUrl ? (
                      <div className="inline-block p-2 bg-white rounded-xl shadow-xs">
                        <img
                          src={store.paymentConfig.qrCodeUrl}
                          alt="Seller Payment QR"
                          className="w-44 h-44 mx-auto object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">Seller QR not uploaded yet.</p>
                    )}

                    {store.paymentConfig.upiId && (
                      <div className="flex items-center justify-center gap-2 text-xs font-mono bg-white dark:bg-neutral-900 py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <span>ID: {store.paymentConfig.upiId}</span>
                        <button
                          onClick={() => handleCopy(store.paymentConfig.upiId!, 'upi')}
                          className="text-neutral-500 hover:text-emerald-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedKey === 'upi' && <span className="text-[10px] text-emerald-600">Copied!</span>}
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'CRYPTO' && store.paymentConfig.cryptoAddresses && (
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-neutral-600 dark:text-neutral-400">
                      Send to Seller Wallet Address:
                    </p>
                    {Object.entries(store.paymentConfig.cryptoAddresses)
                      .filter(([, addr]) => Boolean(addr))
                      .map(([token, addr]) => (
                        <div key={token} className="p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <span className="font-bold uppercase text-[10px] text-emerald-600">{token} Address:</span>
                          <div className="flex items-center justify-between gap-1 font-mono text-[11px] break-all mt-0.5">
                            <span>{addr}</span>
                            <button onClick={() => handleCopy(addr!, token)} className="shrink-0 p-1 hover:text-emerald-600">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {paymentMethod === 'BANK_TRANSFER' && store.paymentConfig.bankDetails && (
                  <div className="text-xs space-y-1.5">
                    <p className="font-semibold text-neutral-600 dark:text-neutral-400">Bank Transfer Details:</p>
                    <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg space-y-1 font-mono text-[11px]">
                      <div>Name: {store.paymentConfig.bankDetails.accountName}</div>
                      <div>A/C / IBAN: {store.paymentConfig.bankDetails.accountNumber}</div>
                      <div>Bank: {store.paymentConfig.bankDetails.bankName}</div>
                      <div>BIC/Routing: {store.paymentConfig.bankDetails.ifscOrRouting}</div>
                    </div>
                  </div>
                )}
              </div>

              {paymentMethod !== 'CASH_ON_DELIVERY' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Transaction ID / Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TWINT-98218942 / TxHash 0x8a3..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                    />
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      The seller manually verifies this ID before confirming your order.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'SUCCESS' && confirmedOrder && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Order Placed Directly</span>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                  {confirmedOrder.orderNumber}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Submitted to <span className="font-semibold">{store?.name}</span>
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Seller Confirmation
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Mode:</span>
                  <span className="font-bold">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total:</span>
                  <span className="font-bold">{formatPrice(confirmedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/orders"
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Order Full View</span>
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        {step !== 'SUCCESS' && items.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 font-medium">Subtotal ({items.length} items)</span>
              <span className="font-black text-neutral-900 dark:text-white text-base">
                {formatPrice(subtotalUSD)}
              </span>
            </div>

            {step === 'CART' && (
              <button
                onClick={() => setStep('CHECKOUT')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                Proceed to Checkout ({items.reduce((s, i) => s + i.quantity, 0)} units)
              </button>
            )}

            {step === 'CHECKOUT' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('CART')}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 'PAYMENT' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('CHECKOUT')}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitOrder}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? 'Submitting Order...'
                      : paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'Confirm COD Order'
                      : 'Submit Payment Proof'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
