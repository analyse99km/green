'use client';

import React, { useState, useEffect } from 'react';
import { Store, Product, Order, Reservation } from '@/lib/types';
import { useCurrency } from '@/components/CurrencyContext';
import { 
  Store as StoreIcon, 
  Package, 
  ShoppingBag, 
  Calendar, 
  Code2, 
  Palette, 
  Plus, 
  Check, 
  X, 
  Upload, 
  Trash2, 
  Pencil,
  Sparkles, 
  Flame, 
  Clock, 
  AlertCircle,
  Truck,
  CheckCircle2,
  Copy
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { formatPrice } = useCurrency();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS' | 'RESERVATIONS' | 'CUSTOMIZER' | 'DEV_API'>('PRODUCTS');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Add / Edit Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [inventory, setInventory] = useState('50');
  const [customDeliveryRadiusKm, setCustomDeliveryRadiusKm] = useState('');
  const [fakeStockAlarm, setFakeStockAlarm] = useState('');
  const [saleDurationHours, setSaleDurationHours] = useState('0');
  const [isFamousDish, setIsFamousDish] = useState(false);
  const [allowCod, setAllowCod] = useState(true);
  const [addons, setAddons] = useState<{ id: string; name: string; price: number }[]>([]);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Customizer & Store Profile Edit State
  const [storeNameEdit, setStoreNameEdit] = useState('');
  const [storeDescEdit, setStoreDescEdit] = useState('');
  const [storeAddressEdit, setStoreAddressEdit] = useState('');
  const [storeLogoUrl, setStoreLogoUrl] = useState('');
  const [storeBannerUrl, setStoreBannerUrl] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [primaryColor, setPrimaryColor] = useState('emerald');
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Dev API State
  const [jsonInventoryPayload, setJsonInventoryPayload] = useState('{\n  "items": [\n    { "productId": "prod-101", "inventory": 25, "fakeStockAlarm": 3 }\n  ]\n}');
  const [devApiOutput, setDevApiOutput] = useState<string | null>(null);

  const [copiedUrl, setCopiedUrl] = useState(false);

  // Storage & GitHub CDN State
  const [storageProvider, setStorageProvider] = useState<'LOCAL' | 'GITHUB'>('LOCAL');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [storageStatusMsg, setStorageStatusMsg] = useState('');
  const [assets, setAssets] = useState<{ name: string; url: string; provider: string }[]>([]);

  // Seller Authentication Gate State
  const [loginStoreId, setLoginStoreId] = useState('');
  const [loginSellerId, setLoginSellerId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginGithubPat, setLoginGithubPat] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Restore authenticated seller session if present
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('green_seller_store');
      const savedPat = sessionStorage.getItem('green_seller_pat');
      if (savedPat) setLoginGithubPat(savedPat);
      if (saved) {
        setSelectedStore(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/stores/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeIdentifier: loginStoreId,
          sellerId: loginSellerId,
          password: loginPassword,
          githubToken: loginGithubPat,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setLoginError(data.error || 'Authentication failed');
      } else {
        setSelectedStore(data.store);
        sessionStorage.setItem('green_seller_store', JSON.stringify(data.store));
        if (loginGithubPat) sessionStorage.setItem('green_seller_pat', loginGithubPat);
      }
    } catch {
      setLoginError('Network error during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch store data when selectedStore changes
  useEffect(() => {
    if (!selectedStore) return;
    const currentStore = selectedStore;

    setStoreNameEdit(currentStore.name || '');
    setStoreDescEdit(currentStore.description || '');
    setStoreAddressEdit(currentStore.address || '');
    setStoreLogoUrl(currentStore.logoUrl || '');
    setStoreBannerUrl(currentStore.bannerUrl || '');
    setAnnouncementText(currentStore.themeConfig?.announcementText || '');
    setPrimaryColor(currentStore.themeConfig?.primaryColor || 'emerald');
    setCustomCss(currentStore.customCss || '');
    setCustomJs(currentStore.customJs || '');
    setStorageProvider(currentStore.storageProvider === 'GITHUB' ? 'GITHUB' : 'LOCAL');
    setGithubRepo(currentStore.storageConfig?.githubRepo || '');
    setGithubToken(currentStore.storageConfig?.githubToken || '');
    setGithubBranch(currentStore.storageConfig?.githubBranch || 'main');

    async function loadStoreData() {
      try {
        const [prodRes, ordRes, resRes, assetsRes] = await Promise.all([
          fetch(`/api/stores/${currentStore.slug}/products`),
          fetch(`/api/orders?storeId=${currentStore.id}`),
          fetch(`/api/reservations?storeId=${currentStore.id}`),
          fetch(`/api/storage/assets?slug=${currentStore.slug}`),
        ]);
        const pData = await prodRes.json();
        const oData = await ordRes.json();
        const rData = await resRes.json();
        const aData = await assetsRes.json();

        if (pData.success) setProducts(pData.products);
        if (oData.success) setOrders(oData.orders);
        if (rData.success) setReservations(rData.reservations);
        if (aData.success) setAssets(aData.assets || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadStoreData();
  }, [selectedStore]);

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStore) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: selectedStore.id,
            fileName: file.name,
            fileBase64: base64,
            provider: selectedStore.storageProvider,
            storageConfig: selectedStore.storageConfig,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setImageUrl(data.url);
        } else {
          alert(`Upload failed: ${data.error}`);
        }
      } catch (err) {
        alert('File upload error');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      const countdownEndsAt = parseInt(saleDurationHours, 10) > 0
        ? new Date(Date.now() + parseInt(saleDurationHours, 10) * 3600000).toISOString()
        : undefined;

      const res = await fetch(`/api/stores/${selectedStore.slug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price,
          originalPrice: originalPrice || undefined,
          inventory: parseInt(inventory, 10),
          customDeliveryRadiusKm: customDeliveryRadiusKm ? parseFloat(customDeliveryRadiusKm) : undefined,
          fakeStockAlarm: fakeStockAlarm ? parseInt(fakeStockAlarm, 10) : undefined,
          saleCountdownEndsAt: countdownEndsAt,
          isFamousDish,
          allowCod,
          addons,
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
          images: imageUrl ? [imageUrl] : [],
          githubToken: loginGithubPat || githubToken || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts([data.product, ...products]);
        cancelProductForm();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err) {
      alert('Error creating product');
    }
  };

  // Start Editing an Existing Product
  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setIsAddingProduct(false);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setPrice(p.price !== undefined ? p.price.toString() : '');
    setOriginalPrice(p.originalPrice !== undefined ? p.originalPrice.toString() : '');
    setInventory(p.inventory !== undefined ? p.inventory.toString() : '50');
    setImageUrl(p.images?.[0] || '');
    setFakeStockAlarm(p.fakeStockAlarm !== undefined ? p.fakeStockAlarm.toString() : '');
    setCustomDeliveryRadiusKm(p.customDeliveryRadiusKm !== undefined ? p.customDeliveryRadiusKm.toString() : '');
    setIsFamousDish(!!p.isFamousDish);
    setAllowCod(p.allowCod !== false);
    setAddons(p.addons || []);
    setTags(p.tags ? p.tags.join(', ') : '');
  };

  // Cancel Add / Edit Product Form
  const cancelProductForm = () => {
    setEditingProduct(null);
    setIsAddingProduct(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setInventory('50');
    setImageUrl('');
    setFakeStockAlarm('');
    setCustomDeliveryRadiusKm('');
    setIsFamousDish(false);
    setAllowCod(true);
    setAddons([]);
    setTags('');
    setSaleDurationHours('0');
  };

  // Submit Product Update (Price, Stock, Details, Addons, Images, Urgency)
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !editingProduct) return;
    setIsSavingProduct(true);

    try {
      const countdownEndsAt = parseInt(saleDurationHours, 10) > 0
        ? new Date(Date.now() + parseInt(saleDurationHours, 10) * 3600000).toISOString()
        : editingProduct.saleCountdownEndsAt;

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price) || 0,
          originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
          inventory: parseInt(inventory, 10) || 0,
          customDeliveryRadiusKm: customDeliveryRadiusKm ? parseFloat(customDeliveryRadiusKm) : undefined,
          fakeStockAlarm: fakeStockAlarm ? parseInt(fakeStockAlarm, 10) : undefined,
          saleCountdownEndsAt: countdownEndsAt,
          isFamousDish,
          allowCod,
          addons,
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          images: imageUrl ? [imageUrl] : (editingProduct.images || []),
          githubToken: loginGithubPat || githubToken || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? data.product : p)));
        cancelProductForm();
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (err) {
      alert('Error updating product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Quick Inline Stock Increment / Decrement
  const handleQuickStockChange = async (productId: string, newInventory: number) => {
    const safeStock = Math.max(0, newInventory);
    // Optimistic UI update
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, inventory: safeStock } : p)));
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: safeStock,
          githubToken: loginGithubPat || githubToken || undefined,
        }),
      });
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  // Update order status (Confirm payment, mark shipped)
  const handleUpdateOrderStatus = async (orderId: string, status: string, note?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sellerNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // Update reservation status
  const handleUpdateReservationStatus = async (resId: string, status: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setReservations(reservations.map((r) => (r.id === resId ? data.reservation : r)));
      }
    } catch (err) {
      alert('Failed to update reservation status');
    }
  };

  // Save Store Theme & Dev Code
  const handleSaveTheme = async () => {
    if (!selectedStore) return;
    setIsSavingTheme(true);
    try {
      const res = await fetch(`/api/stores/${selectedStore.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeNameEdit,
          description: storeDescEdit,
          address: storeAddressEdit,
          logoUrl: storeLogoUrl,
          bannerUrl: storeBannerUrl,
          themeConfig: {
            ...selectedStore.themeConfig,
            primaryColor,
            announcementText,
          },
          customCss,
          customJs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedStore(data.store);
        sessionStorage.setItem('green_seller_store', JSON.stringify(data.store));
        if (loginGithubPat) sessionStorage.setItem('green_seller_pat', loginGithubPat);
        alert('Store profile, logo, background & theme saved successfully!');
      }
    } catch (err) {
      alert('Failed to save theme settings');
    } finally {
      setIsSavingTheme(false);
    }
  };

  // Execute Dev API payload test
  const handleTestDevApi = async () => {
    if (!selectedStore) return;
    try {
      const parsed = JSON.parse(jsonInventoryPayload);
      const res = await fetch(`/api/stores/${selectedStore.slug}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setDevApiOutput(JSON.stringify(data, null, 2));

      // Refresh products
      const pRes = await fetch(`/api/stores/${selectedStore.slug}/products`);
      const pData = await pRes.json();
      if (pData.success) setProducts(pData.products);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setDevApiOutput(`Error: ${message}`);
    }
  };

  if (!selectedStore) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Seller Dashboard Login</h1>
          <p className="text-xs text-neutral-500">
            Enter your Store #, Seller ID, and Password to access your merchant dashboard.
          </p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form
          onSubmit={handleSellerLogin}
          className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Store Number or Slug *
            </label>
            <input
              type="text"
              required
              value={loginStoreId}
              onChange={(e) => setLoginStoreId(e.target.value)}
              placeholder="e.g. 01, 11, or brew"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Seller Login ID *
            </label>
            <input
              type="text"
              required
              value={loginSellerId}
              onChange={(e) => setLoginSellerId(e.target.value)}
              placeholder="Your Seller ID (demo: demo)"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Seller Password *
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Your password (demo: demo123)"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              GitHub Access Token (If your store uses GitHub Storage)
            </label>
            <input
              type="password"
              value={loginGithubPat}
              onChange={(e) => setLoginGithubPat(e.target.value)}
              placeholder="ghp_... (leave blank for non-GitHub stores)"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
          >
            {isLoggingIn ? 'Verifying Credentials...' : 'Unlock My Store Dashboard'}
          </button>

          <p className="text-[11px] text-center text-neutral-500 pt-1">
            New vendor?{' '}
            <a href="/create-store" className="text-emerald-600 font-bold hover:underline">
              Open a Free Store →
            </a>
          </p>
        </form>
      </div>
    );
  }

  const storeNumberFormatted = `#${String(selectedStore.storeNumber).padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Store Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-black text-sm">
            {storeNumberFormatted}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-neutral-900 dark:text-white">{selectedStore.name}</h1>
              {selectedStore.isVerified && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Verified ✓
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Owner: <span className="font-semibold">{selectedStore.ownerName}</span> • Phone: {selectedStore.phoneNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedStore.githubVaultRepo && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              🔒 Encrypted Cloud Storage Connected
            </span>
          )}

          <a
            href={`/store/${selectedStore.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
          >
            Preview Storefront ↗
          </a>

          <button
            onClick={() => {
              sessionStorage.removeItem('green_seller_store');
              sessionStorage.removeItem('green_seller_pat');
              setSelectedStore(null);
            }}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 text-xs font-bold"
          >
            Lock / Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800 scrollbar-none text-xs font-bold">
        {[
          { id: 'PRODUCTS', label: `Products & Stock (${products.length})`, icon: Package },
          { id: 'ORDERS', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'RESERVATIONS', label: `Reservations (${reservations.length})`, icon: Calendar },
          { id: 'CUSTOMIZER', label: 'Theme & Customizer', icon: Palette },
          { id: 'DEV_API', label: 'Developer Mode & API', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS & INVENTORY */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Product Catalog & Inventory</h2>
              <p className="text-xs text-neutral-500">
                Manage stock, promotional strikethrough pricing, and artificial stock alarms.
              </p>
            </div>

            <button
              onClick={() => {
                if (editingProduct || isAddingProduct) {
                  cancelProductForm();
                } else {
                  setIsAddingProduct(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              {editingProduct || isAddingProduct ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingProduct ? 'Cancel Edit' : isAddingProduct ? 'Cancel' : 'Add New Product'}</span>
            </button>
          </div>

          {/* Add / Edit Product Form */}
          {(isAddingProduct || editingProduct) && (
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${editingProduct ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                    {editingProduct ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Create New Catalog Item'}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {editingProduct ? `Editing product ID ${editingProduct.id} — updates price, stock, details & add-ons` : 'Add an item to your direct P2P decentralized storefront'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cancelProductForm}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sourdough Loaf / Wireless Keycaps"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. Bread, Organic, Vegan"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, dimensions, features..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>

              {/* Pricing & Promotional Urgency Settings */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40 space-y-3">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Promotional Pricing & Urgency Engine (Seller Facility)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                      Selling Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 15.00"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 mb-0.5">
                      Original / Strikethrough Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 25.00 (slashed)"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                      Real Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-600 mb-0.5">
                      Fake Stock Alarm (FOMO)
                    </label>
                    <input
                      type="number"
                      value={fakeStockAlarm}
                      onChange={(e) => setFakeStockAlarm(e.target.value)}
                      placeholder="e.g. 'Only 3 left!'"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                      Flash Sale Timer (Hours from now)
                    </label>
                    <select
                      value={saleDurationHours}
                      onChange={(e) => setSaleDurationHours(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    >
                      <option value="0">No Flash Sale Timer</option>
                      <option value="2">2 Hours Countdown</option>
                      <option value="6">6 Hours Countdown</option>
                      <option value="12">12 Hours Countdown</option>
                      <option value="24">24 Hours Countdown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-0.5">
                      Custom Delivery Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={customDeliveryRadiusKm}
                      onChange={(e) => setCustomDeliveryRadiusKm(e.target.value)}
                      placeholder="Default: store radius"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-300">
                      <input
                        type="checkbox"
                        checked={isFamousDish}
                        onChange={(e) => setIsFamousDish(e.target.checked)}
                        className="accent-amber-600 rounded"
                      />
                      <span>Mark as "Famous Dish / Chef's Special"</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <input
                        type="checkbox"
                        checked={allowCod}
                        onChange={(e) => setAllowCod(e.target.checked)}
                        className="accent-emerald-600 rounded"
                      />
                      <span>Allow Cash on Delivery (COD) for this product</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Optional Product Add-Ons Builder */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Product Add-Ons (Optional Extras Buyers Can Tick)
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    placeholder="Add-on name (e.g. Gift Wrapping / Extra Cheese)"
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(e.target.value)}
                    placeholder="Price ($)"
                    className="w-28 text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAddonName.trim() || !newAddonPrice) return;
                      setAddons([
                        ...addons,
                        { id: `add-${Date.now()}`, name: newAddonName.trim(), price: parseFloat(newAddonPrice) },
                      ]);
                      setNewAddonName('');
                      setNewAddonPrice('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold"
                  >
                    + Add Extra
                  </button>
                </div>

                {addons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {addons.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
                      >
                        <span>{a.name} (+${a.price.toFixed(2)})</span>
                        <button
                          type="button"
                          onClick={() => setAddons(addons.filter((x) => x.id !== a.id))}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload with Storage Provider */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Image (Stored via {selectedStore.storageProvider === 'GITHUB' ? 'GitHub Repo CDN' : 'Local Disk'})
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://.../photo.jpg or upload below"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                  />
                  <label className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelProductForm}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSavingProduct ? 'Saving...' : editingProduct ? 'Update Product & Sync' : 'Save Product'}
                </button>
              </div>
            </form>
          )}

          {/* Product Items Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Promotional Urgency</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                        />
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{p.title}</span>
                            {p.isFamousDish && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                Famous
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">ID: {p.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                        {formatPrice(p.price)}
                        {p.originalPrice && (
                          <span className="text-[10px] text-neutral-400 line-through ml-1.5">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            p.inventory <= 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {p.inventory > 0 ? `${p.inventory} in stock` : 'Out of Stock'}
                          </span>
                          <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-800">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, Math.max(0, p.inventory - 1))}
                              className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 font-bold text-[10px]"
                              title="Quick decrement stock"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, p.inventory + 1)}
                              className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 font-bold text-[10px] border-l border-neutral-200 dark:border-neutral-700"
                              title="Quick increment stock"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {p.fakeStockAlarm && (
                          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Alarm: {p.fakeStockAlarm} left
                          </div>
                        )}
                        {p.saleCountdownEndsAt && (
                          <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Flash Sale Active
                          </div>
                        )}
                        {!p.fakeStockAlarm && !p.saleCountdownEndsAt && <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {p.customDeliveryRadiusKm ? `${p.customDeliveryRadiusKm} km` : 'Store default'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEditProduct(p)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Edit product, price, stock, details & add-ons"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Archive ${p.title}?`)) {
                                await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
                                setProducts(products.filter((x) => x.id !== p.id));
                              }
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Archive product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING ORDERS & P2P VERIFICATION */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Customer Orders & Direct Verification</h2>
            <p className="text-xs text-neutral-500">
              Zero platform commissions. Verify buyer's submitted Transaction Reference ID in your bank/crypto wallet, then confirm!
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
              <ShoppingBag className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
              <p className="font-bold text-sm">No orders received yet.</p>
              <p className="text-xs text-neutral-400 mt-0.5">Share your storefront link to start taking direct orders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-600">{ord.orderNumber}</span>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{ord.buyerName}</h3>
                      <p className="text-xs text-neutral-500">
                        Contact: <span className="font-mono font-semibold">{ord.buyerContact}</span> • {new Date(ord.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'AWAITING_SELLER_CONFIRMATION'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          : ord.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : ord.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Items and Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">Items Ordered:</span>
                      <ul className="mt-1 space-y-1">
                        {ord.items.map((i, idx) => (
                          <li key={idx} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                            <span>{i.quantity}x {i.title}</span>
                            <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-1 border-t border-neutral-100 dark:border-neutral-800 font-bold flex justify-between">
                        <span>Total:</span>
                        <span className="text-sm font-black text-emerald-600">{formatPrice(ord.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <span className="font-bold">Fulfillment:</span> {ord.deliveryType === 'SELF_PICKUP' ? '🏪 In-Store Pickup' : '🛵 Self-Delivery'}
                      </div>
                      <div>
                        <span className="font-bold">Address:</span> {ord.deliveryAddress}
                      </div>
                      <div className="pt-1 border-t border-neutral-200 dark:border-neutral-800">
                        <span className="font-bold text-emerald-600">Payment Reference:</span>
                        <div className="font-mono text-[11px] bg-white dark:bg-neutral-900 p-1.5 rounded mt-0.5 border border-neutral-200 dark:border-neutral-800 break-all">
                          {ord.transactionId || 'No TxID provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    {ord.status === 'AWAITING_SELLER_CONFIRMATION' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'CONFIRMED', 'Payment verified by seller.')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Confirm Payment</span>
                      </button>
                    )}

                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'SHIPPED', 'Order is out for self-delivery/pickup.')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Out for Delivery</span>
                      </button>
                    )}

                    {ord.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED', 'Delivered successfully.')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Mark Completed ✓
                      </button>
                    )}

                    {ord.status !== 'CANCELLED' && ord.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          const note = prompt('Reason for rejection/cancellation:');
                          if (note) handleUpdateOrderStatus(ord.id, 'CANCELLED', note);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TABLE RESERVATIONS */}
      {activeTab === 'RESERVATIONS' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Hospitality Table Reservations</h2>
            <p className="text-xs text-neutral-500">
              Manage incoming table booking requests from guests for your cafe or restaurant.
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
              <Calendar className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
              <p className="font-bold text-sm">No table reservations pending.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{r.customerName}</h4>
                      <p className="text-xs text-neutral-500">Phone: {r.customerContact}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      r.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : r.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl text-xs space-y-1">
                    <div><span className="font-bold">Party Size:</span> {r.guestCount} Guests</div>
                    <div><span className="font-bold">Date & Time:</span> {r.reservationDate} at {r.reservationTime}</div>
                    {r.specialRequests && <div><span className="font-bold">Requests:</span> {r.specialRequests}</div>}
                  </div>

                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateReservationStatus(r.id, 'CONFIRMED')}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Confirm Table
                      </button>
                      <button
                        onClick={() => handleUpdateReservationStatus(r.id, 'CANCELLED')}
                        className="px-4 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: THEME CUSTOMIZER & DEV STYLES */}
      {activeTab === 'CUSTOMIZER' && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Storefront Customizer</h2>
            <p className="text-xs text-neutral-500">
              Customize the appearance of your storefront or inject developer CSS and scripts.
            </p>
          </div>

          <div className="space-y-4">
            {/* Store Profile, Logo & Background / Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeNameEdit}
                  onChange={(e) => setStoreNameEdit(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Store Address
                </label>
                <input
                  type="text"
                  value={storeAddressEdit}
                  onChange={(e) => setStoreAddressEdit(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Description
              </label>
              <textarea
                rows={2}
                value={storeDescEdit}
                onChange={(e) => setStoreDescEdit(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Store Logo URL (or Upload)
                </label>
                <div className="flex items-center gap-2">
                  {storeLogoUrl && (
                    <img src={storeLogoUrl} alt="Logo preview" className="w-9 h-9 rounded-full object-cover border shrink-0" />
                  )}
                  <input
                    type="url"
                    value={storeLogoUrl}
                    onChange={(e) => setStoreLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <Upload className="w-3 h-3" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const res = await fetch('/api/storage/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            storeId: selectedStore.id,
                            fileName: file.name,
                            fileBase64: reader.result,
                            provider: selectedStore.storageProvider,
                            storageConfig: selectedStore.storageConfig,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) setStoreLogoUrl(data.url);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Store Background / Banner URL (or Upload)
                </label>
                <div className="flex items-center gap-2">
                  {storeBannerUrl && (
                    <img src={storeBannerUrl} alt="Banner preview" className="w-14 h-9 rounded-lg object-cover border shrink-0" />
                  )}
                  <input
                    type="url"
                    value={storeBannerUrl}
                    onChange={(e) => setStoreBannerUrl(e.target.value)}
                    placeholder="https://.../background.jpg"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <Upload className="w-3 h-3" />
                  <span>Upload Background</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const res = await fetch('/api/storage/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            storeId: selectedStore.id,
                            fileName: file.name,
                            fileBase64: reader.result,
                            provider: selectedStore.storageProvider,
                            storageConfig: selectedStore.storageConfig,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) setStoreBannerUrl(data.url);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Free pastry with every coffee order today!"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Brand Accent Theme
              </label>
              <div className="flex gap-3">
                {[
                  { name: 'emerald', bg: 'bg-emerald-500' },
                  { name: 'violet', bg: 'bg-violet-500' },
                  { name: 'amber', bg: 'bg-amber-500' },
                  { name: 'ocean', bg: 'bg-sky-500' },
                  { name: 'rose', bg: 'bg-rose-500' },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setPrimaryColor(c.name)}
                    className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center text-white transition-all ${
                      primaryColor === c.name ? 'ring-4 ring-emerald-500/30 scale-110' : 'opacity-80'
                    }`}
                  >
                    {primaryColor === c.name && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Developer CSS & JS Editor */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Developer Mode: Custom CSS & Styling Injection</span>
              </span>

              <textarea
                rows={4}
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder="/* Custom CSS overrides for your store */&#10;.custom-banner { border-radius: 40px; }"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={handleSaveTheme}
              disabled={isSavingTheme}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              {isSavingTheme ? 'Saving Theme...' : 'Save Customizations'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: DEVELOPER MODE, GITHUB CDN & PROGRAMMATIC INVENTORY API */}
      {activeTab === 'DEV_API' && (
        <div className="space-y-6">
          {/* Free GitHub Repo CDN & Storage Configuration */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Free GitHub Repo CDN & Store Media Folder
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Connect your GitHub repository & Personal Access Token. We auto-create <code className="font-mono">store-assets/{selectedStore.id}/</code> and serve all uploaded images via <code className="font-mono">cdn.jsdelivr.net</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Storage Mode</label>
                <select
                  value={storageProvider}
                  onChange={(e) => setStorageProvider(e.target.value as 'LOCAL' | 'GITHUB')}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-bold"
                >
                  <option value="LOCAL">Local Server Disk</option>
                  <option value="GITHUB">Free GitHub Repo CDN</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">GitHub Repo (owner/repo)</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="username/store-assets"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  setStorageStatusMsg('Saving & initializing folder...');
                  const res = await fetch('/api/storage/assets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      slug: selectedStore.slug,
                      storageProvider,
                      storageConfig: storageProvider === 'GITHUB' ? { githubRepo, githubToken, githubBranch } : undefined,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSelectedStore(data.store);
                    setStorageStatusMsg(data.folderResult?.message || 'Storage settings saved!');
                  } else {
                    setStorageStatusMsg(data.error || 'Failed to save storage settings');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Save & Auto-Create GitHub Folder
              </button>
              {storageStatusMsg && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{storageStatusMsg}</span>
              )}
            </div>

            {/* Store Media & CDN Links Gallery */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Uploaded Store Images & CDN Links ({assets.length})
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch(`/api/storage/assets?slug=${selectedStore.slug}`);
                    const data = await res.json();
                    if (data.success) setAssets(data.assets || []);
                  }}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  Refresh Assets
                </button>
              </div>
              {assets.length === 0 ? (
                <p className="text-xs text-neutral-400">No uploaded files yet. Upload a product image to see its CDN link here.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assets.map((a) => (
                    <div
                      key={a.url}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={a.url} alt={a.name} className="w-8 h-8 rounded object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold truncate">{a.name}</div>
                          <div className="text-[10px] font-mono text-neutral-500 truncate">{a.url}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(a.url)}
                        className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold shrink-0"
                      >
                        Copy Link
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Developer Mode: Programmatic Inventory Sync</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sellers can write code or connect external inventory scripts to sync stock levels automatically via REST webhook.
              </p>
            </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-700 dark:text-neutral-300">Endpoint URL:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/stores/${selectedStore.slug}/inventory`);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUrl ? 'Copied!' : 'Copy Endpoint'}</span>
              </button>
            </div>
            <code className="block p-2 rounded-lg bg-neutral-200 dark:bg-neutral-900 font-mono text-[11px] break-all">
              POST /api/stores/{selectedStore.slug}/inventory
            </code>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Interactive JSON Payload Tester:
            </label>
            <textarea
              rows={6}
              value={jsonInventoryPayload}
              onChange={(e) => setJsonInventoryPayload(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
            />
            <button
              onClick={handleTestDevApi}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs"
            >
              Execute Inventory Sync Webhook
            </button>
          </div>

          {devApiOutput && (
            <div className="p-4 rounded-2xl bg-neutral-950 text-neutral-200 font-mono text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Response Output:</span>
              <pre className="overflow-x-auto text-[11px]">{devApiOutput}</pre>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
