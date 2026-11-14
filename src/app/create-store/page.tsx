'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { StorageProviderType } from '@/lib/types';
import { detectUserLocation } from '@/lib/geoClient';
import StoreShareModal from '@/components/StoreShareModal';
import { 
  Store as StoreIcon, 
  MapPin, 
  ShieldCheck, 
  Upload, 
  QrCode, 
  GitBranch, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Coins,
  Cloud
} from 'lucide-react';

export default function CreateStorePage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [category, setCategory] = useState<'RETAIL' | 'HOSPITALITY' | 'DIGITAL' | 'SERVICES'>('RETAIL');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Bahnhofstrasse, 8001 Zürich, Switzerland');
  const [latitude, setLatitude] = useState<number>(47.3769);
  const [longitude, setLongitude] = useState<number>(8.5417);
  const [deliveryType, setDeliveryType] = useState<'LOCAL' | 'GLOBAL' | 'BOTH'>('LOCAL');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(10);
  const [allowSelfPickup, setAllowSelfPickup] = useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Storage configuration
  const [storageProvider, setStorageProvider] = useState<StorageProviderType>('GITHUB');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubTestStatus, setGithubTestStatus] = useState<{ testing: boolean; message?: string; ok?: boolean }>({ testing: false });

  // Cloud Storage Credentials (AWS, Azure, GCP, OCI, IBM, DO, R2, Vercel)
  const [cloudAccessKey, setCloudAccessKey] = useState('');
  const [cloudSecretKey, setCloudSecretKey] = useState('');
  const [cloudBucket, setCloudBucket] = useState('');
  const [cloudRegion, setCloudRegion] = useState('us-east-1');
  const [cloudEndpoint, setCloudEndpoint] = useState('');
  const [azureAccountName, setAzureAccountName] = useState('');
  const [azureContainerName, setAzureContainerName] = useState('');
  const [azureSasToken, setAzureSasToken] = useState('');
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpBucket, setGcpBucket] = useState('');
  const [gcpAccessToken, setGcpAccessToken] = useState('');
  const [vercelBlobToken, setVercelBlobToken] = useState('');

  // Payment configuration
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [cryptoBtc, setCryptoBtc] = useState('');
  const [cryptoEth, setCryptoEth] = useState('');
  const [cryptoUsdt, setCryptoUsdt] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdStore, setCreatedStore] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState<{ loading: boolean; message?: string }>({ loading: false });

  // Handle direct QR code photo/screenshot upload
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQrCodeUrl(reader.result);
        setQrCodePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Universal Geolocation helper (GPS + IP Geolocation + Timezone Fallback)
  const handleDetectLocation = async () => {
    setLocationStatus({ loading: true, message: 'Detecting location...' });
    try {
      const loc = await detectUserLocation();
      setLatitude(loc.lat);
      setLongitude(loc.lng);
      if (loc.city || loc.country) {
        setAddress(`${loc.city || ''}${loc.city && loc.country ? ', ' : ''}${loc.country || ''}`);
      }
      setLocationStatus({
        loading: false,
        message: `Location set (${loc.source}): ${loc.city ? loc.city + ', ' : ''}${loc.country || 'Coordinates set'}`,
      });
    } catch {
      setLocationStatus({
        loading: false,
        message: 'Could not detect location. Type your city in Store Address and click "Find".',
      });
    }
  };

  // Forward geocode address to coordinates
  const handleFindAddress = async () => {
    if (!address.trim()) return;
    setLocationStatus({ loading: true, message: 'Looking up address...' });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(parseFloat(data[0].lat).toFixed(6));
        const lng = Number(parseFloat(data[0].lon).toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationStatus({ loading: false, message: `Found coordinates (${lat}, ${lng})` });
      } else {
        setLocationStatus({ loading: false, message: 'Address not found. Try a city or street name.' });
      }
    } catch {
      setLocationStatus({ loading: false, message: 'Address lookup failed.' });
    }
  };

  // Test GitHub token & repo connectivity
  const handleTestGithub = async () => {
    if (!githubToken || !githubRepo) {
      setGithubTestStatus({ testing: false, ok: false, message: 'Please enter both token and repository name.' });
      return;
    }
    setGithubTestStatus({ testing: true });
    try {
      const res = await fetch('/api/storage/test-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken, repo: githubRepo }),
      });
      const data = await res.json();
      if (data.ok && data.resolvedRepo) {
        setGithubRepo(data.resolvedRepo);
      }
      setGithubTestStatus({ testing: false, ok: data.ok, message: data.message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setGithubTestStatus({ testing: false, ok: false, message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !ownerEmail.trim() || !phoneNumber.trim()) {
      setErrorMessage('Store Name, Owner Full Name, Contact Email, and Phone Number are mandatory verification fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ownerName,
          ownerEmail,
          phoneNumber,
          sellerId,
          sellerPassword,
          category,
          description,
          address,
          latitude: Number.isFinite(latitude) ? latitude : 47.3769,
          longitude: Number.isFinite(longitude) ? longitude : 8.5417,
          deliveryType,
          deliveryRadiusKm,
          allowSelfPickup,
          storageProvider,
          storageConfig:
            storageProvider === 'GITHUB'
              ? { githubRepo, githubToken, githubBranch }
              : storageProvider === 'AZURE_BLOB'
              ? { azureAccountName, azureContainerName, azureSasToken }
              : storageProvider === 'GCP_STORAGE'
              ? { gcpProjectId, gcpBucket, gcpAccessToken }
              : storageProvider === 'VERCEL_BLOB'
              ? { vercelBlobToken }
              : storageProvider !== 'LOCAL'
              ? {
                  accessKeyId: cloudAccessKey,
                  secretAccessKey: cloudSecretKey,
                  bucket: cloudBucket,
                  region: cloudRegion,
                  endpoint: cloudEndpoint || undefined,
                }
              : undefined,
          paymentConfig: {
            qrCodeUrl: qrCodeUrl.trim()
              ? qrCodeUrl.trim()
              : upiId.trim()
              ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(name)}`
              : undefined,
            upiId: upiId.trim() || undefined,
            cryptoAddresses: (cryptoBtc.trim() || cryptoEth.trim() || cryptoUsdt.trim())
              ? {
                  btc: cryptoBtc.trim() || undefined,
                  eth: cryptoEth.trim() || undefined,
                  usdt: cryptoUsdt.trim() || undefined,
                }
              : undefined,
            bankDetails: bankAccountNumber.trim() ? {
              accountName: bankAccountName.trim(),
              accountNumber: bankAccountNumber.trim(),
              bankName: bankName.trim(),
              ifscOrRouting: bankIfsc.trim(),
            } : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create store');
      }

      setCreatedStore(data.store);
      setStep(4);

      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <StoreIcon className="w-3.5 h-3.5" />
          <span>Instant Seller Onboarding</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white">Open Your Free Store</h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
          No listing fees. No commission cuts. You own your data and receive direct payments directly to your wallet or bank.
        </p>
      </div>

      {/* Wizard Steps indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-3 text-xs font-bold">
          <span className={`px-3 py-1 rounded-lg ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
            1. Store Details
          </span>
          <span>→</span>
          <span className={`px-3 py-1 rounded-lg ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
            2. Storage Setup
          </span>
          <span>→</span>
          <span className={`px-3 py-1 rounded-lg ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
            3. Direct Payments
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Basic Store Info & Location */}
      {step === 1 && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Store Identity & Location</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Blue Ridge Artisan Coffee"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Owner Full Name (Mandatory Verification) *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Samantha Smith"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Owner Phone / WhatsApp (Mandatory) *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +41 44 500 11 22"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Owner Contact Email (Mandatory) *
              </label>
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="e.g. owner@zurichstore.ch"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seller Dashboard Login ID *
                </label>
                <input
                  type="text"
                  required
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                  placeholder="e.g. brew-admin"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seller Dashboard Password *
                </label>
                <input
                  type="password"
                  required
                  value={sellerPassword}
                  onChange={(e) => setSellerPassword(e.target.value)}
                  placeholder="Enter a secure merchant password"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                >
                  <option value="RETAIL">Retail Goods & Electronics</option>
                  <option value="HOSPITALITY">Hospitality (Cafe, Bistro, Hotel, Dining)</option>
                  <option value="DIGITAL">Digital Downloads & Art</option>
                  <option value="SERVICES">Local Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Delivery Scope
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                >
                  <option value="LOCAL">Local Delivery Only</option>
                  <option value="GLOBAL">Global Shipping Only</option>
                  <option value="BOTH">Both Local & Global</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Store Description / Bio
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers what your store specializes in..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
              />
            </div>

            {/* Location & Map coordinates */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Map Coordinates & Address
                </span>
                <button
                  type="button"
                  disabled={locationStatus.loading}
                  onClick={handleDetectLocation}
                  className="text-[11px] font-bold text-emerald-600 hover:underline disabled:opacity-50"
                >
                  {locationStatus.loading ? '⏳ Detecting...' : '📍 Detect My Current Location'}
                </button>
              </div>

              {locationStatus.message && (
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                  {locationStatus.message}
                </div>
              )}

              <div>
                <label className="block text-xs text-neutral-500 mb-1">Store Physical Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, Neighborhood, City"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleFindAddress}
                    disabled={locationStatus.loading}
                    className="px-3 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shrink-0"
                  >
                    Find
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={Number.isFinite(latitude) ? latitude : ''}
                    onChange={(e) => setLatitude(e.target.value === '' ? NaN : parseFloat(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={Number.isFinite(longitude) ? longitude : ''}
                    onChange={(e) => setLongitude(e.target.value === '' ? NaN : parseFloat(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Default Delivery Radius: <span className="text-emerald-600">{deliveryRadiusKm} km</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600 mt-1"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={allowSelfPickup}
                    onChange={(e) => setAllowSelfPickup(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span>Allow In-Person Pickup</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!name || !ownerName || !ownerEmail || !phoneNumber || !sellerId || !sellerPassword) {
                  setErrorMessage('Please fill in Store Name, Owner Name, Email, Phone, Seller ID, and Password.');
                  return;
                }
                setErrorMessage('');
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Continue to Storage Setup →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Storage Engine */}
      {step === 2 && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Choose Your Media Storage Backend</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select where your store images and catalog photos will be saved.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setStorageProvider('LOCAL')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                storageProvider === 'LOCAL'
                  ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <HardDrive className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Self-Hosted / Local Disk</h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Images are stored on this local machine in <code className="font-mono">/uploads</code>.
              </p>
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mt-1.5 leading-snug">
                Note: Not recommended — needs 24/7 internet and electricity on this machine to use this feature; if it fails, the store goes offline!
              </p>
            </div>

            <div
              onClick={() => setStorageProvider('GITHUB')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                storageProvider === 'GITHUB'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <GitBranch className="w-5 h-5 text-purple-600 mb-2" />
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Free GitHub Repo CDN (Recommended)</h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Zero server storage! Photos, store data & private credentials live in your own GitHub repos, served via jsDelivr CDN.
              </p>
            </div>
          </div>

          {/* Separate Box: Enterprise & Private Cloud Storage Options */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Private Cloud Storage Providers (All Major Clouds)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'AWS_S3', label: 'AWS S3' },
                { id: 'AZURE_BLOB', label: 'Microsoft Azure' },
                { id: 'GCP_STORAGE', label: 'Google Cloud (GCP)' },
                { id: 'ORACLE_OCI', label: 'Oracle Cloud (OCI)' },
                { id: 'IBM_COS', label: 'IBM Cloud COS' },
                { id: 'DIGITALOCEAN_SPACES', label: 'DigitalOcean Spaces' },
                { id: 'CLOUDFLARE_R2', label: 'Cloudflare R2' },
                { id: 'VERCEL_BLOB', label: 'Vercel Blob' },
              ].map((cloud) => (
                <button
                  key={cloud.id}
                  type="button"
                  onClick={() => setStorageProvider(cloud.id as StorageProviderType)}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                    storageProvider === cloud.id
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                >
                  {cloud.label}
                </button>
              ))}
            </div>

            {/* Dynamic Cloud Credential Inputs */}
            {['AWS_S3', 'ORACLE_OCI', 'IBM_COS', 'DIGITALOCEAN_SPACES', 'CLOUDFLARE_R2'].includes(storageProvider) && (
              <div className="pt-2 space-y-2.5 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                  {storageProvider.replace(/_/g, ' ')} Credentials
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={cloudAccessKey}
                    onChange={(e) => setCloudAccessKey(e.target.value)}
                    placeholder="Access Key ID *"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                  <input
                    type="password"
                    value={cloudSecretKey}
                    onChange={(e) => setCloudSecretKey(e.target.value)}
                    placeholder="Secret Access Key *"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                  <input
                    type="text"
                    value={cloudBucket}
                    onChange={(e) => setCloudBucket(e.target.value)}
                    placeholder="Bucket / Space Name *"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                  <input
                    type="text"
                    value={cloudRegion}
                    onChange={(e) => setCloudRegion(e.target.value)}
                    placeholder="Region (e.g. us-east-1, auto, eu-central-1)"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                </div>
                <input
                  type="url"
                  value={cloudEndpoint}
                  onChange={(e) => setCloudEndpoint(e.target.value)}
                  placeholder="Custom Endpoint URL (Required for R2, DO Spaces, OCI, IBM COS)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
            )}

            {storageProvider === 'AZURE_BLOB' && (
              <div className="pt-2 space-y-2.5 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Microsoft Azure Blob Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={azureAccountName}
                    onChange={(e) => setAzureAccountName(e.target.value)}
                    placeholder="Storage Account Name *"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                  <input
                    type="text"
                    value={azureContainerName}
                    onChange={(e) => setAzureContainerName(e.target.value)}
                    placeholder="Container Name *"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                </div>
                <input
                  type="password"
                  value={azureSasToken}
                  onChange={(e) => setAzureSasToken(e.target.value)}
                  placeholder="Azure SAS Token (sv=...&sig=...) *"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
            )}

            {storageProvider === 'GCP_STORAGE' && (
              <div className="pt-2 space-y-2.5 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Google Cloud Storage (GCP) Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={gcpProjectId}
                    onChange={(e) => setGcpProjectId(e.target.value)}
                    placeholder="GCP Project ID"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                  <input
                    type="text"
                    value={gcpBucket}
                    onChange={(e) => setGcpBucket(e.target.value)}
                    placeholder="GCS Bucket Name *"
                    className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                  />
                </div>
                <input
                  type="password"
                  value={gcpAccessToken}
                  onChange={(e) => setGcpAccessToken(e.target.value)}
                  placeholder="GCP OAuth Access Token *"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
            )}

            {storageProvider === 'VERCEL_BLOB' && (
              <div className="pt-2 space-y-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Vercel Blob Credentials</span>
                <input
                  type="password"
                  value={vercelBlobToken}
                  onChange={(e) => setVercelBlobToken(e.target.value)}
                  placeholder="BLOB_READ_WRITE_TOKEN (vercel_blob_rw_...) *"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
            )}
          </div>

          {storageProvider === 'GITHUB' && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">GitHub Integration Credentials</span>
              
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">GitHub Username or Repo (username or owner/repo) *</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="e.g. your-github-username or username/repo"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">GitHub Personal Access Token (repo scope) *</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestGithub}
                  disabled={githubTestStatus.testing}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {githubTestStatus.testing ? 'Testing connection...' : 'Test Connection'}
                </button>

                {githubTestStatus.message && (
                  <span className={`text-[11px] font-semibold ${githubTestStatus.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                    {githubTestStatus.message}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Continue to Payments Setup →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment Details */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Direct P2P Payment Configuration</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure how buyers pay you directly. You can provide a QR code, UPI address, Crypto wallet, or Bank wire.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                UPI ID or Payment Handle (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mystore@okaxis or payments@store"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Direct QR Code (Twint / UPI / Bank / Wallet QR)
              </label>

              {/* Upload QR Image Box */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload QR Code Image (Photo / Screenshot)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-neutral-400">or enter image URL below:</span>
              </div>

              <input
                type="text"
                value={qrCodeUrl}
                onChange={(e) => {
                  setQrCodeUrl(e.target.value);
                  setQrCodePreview(e.target.value);
                }}
                placeholder="https://.../my-qr-code.png or upload image above (or leave blank to auto-generate from UPI)"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
              />

              {qrCodePreview && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <img
                    src={qrCodePreview}
                    alt="Seller QR Preview"
                    className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-neutral-200 shadow-xs"
                  />
                  <div>
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct QR Loaded Successfully
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Buyers can scan this QR code directly during checkout to pay you with zero commission.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Crypto Wallets */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" /> Cryptocurrency Wallet Addresses (Optional)
              </span>

              <div className="space-y-2">
                <input
                  type="text"
                  value={cryptoUsdt}
                  onChange={(e) => setCryptoUsdt(e.target.value)}
                  placeholder="USDT Address (e.g. TRC-20 or ERC-20)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
                <input
                  type="text"
                  value={cryptoEth}
                  onChange={(e) => setCryptoEth(e.target.value)}
                  placeholder="Ethereum / EVM Address (0x...)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
                <input
                  type="text"
                  value={cryptoBtc}
                  onChange={(e) => setCryptoBtc(e.target.value)}
                  placeholder="Bitcoin Address (bc1q...)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
            </div>

            {/* Bank details */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Bank Transfer Details (Optional)</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Account Holder Name"
                  className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Storefront...' : 'Launch Storefront 🚀'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Storefront Launched Celebration */}
      {step === 4 && createdStore && (
        <div className="p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
              Allotted Store #{String(createdStore.storeNumber).padStart(2, '0')}
            </div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white">{createdStore.name} is Live!</h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Your store is pinned on the interactive marketplace map and accessible worldwide via your dedicated slug or Store Number.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
            <div>URL: <span className="text-emerald-600 font-bold">/store/{createdStore.slug}</span></div>
            <div>Store ID: {createdStore.id}</div>
            <div>Owner: {createdStore.ownerName}</div>
            <div>Phone: {createdStore.phoneNumber}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href={`/store/${createdStore.slug}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              View Live Storefront →
            </a>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-xs flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Get Store QR & Flyer</span>
            </button>
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
            >
              Open Seller Dashboard
            </a>
          </div>
        </div>
      )}

      {/* Store QR Share Modal */}
      {isShareModalOpen && createdStore && (
        <StoreShareModal
          store={createdStore}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
