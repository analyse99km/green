'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Store } from '@/lib/types';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Share2, 
  ExternalLink,
  QrCode,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface StoreShareModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreShareModal({ store, isOpen, onClose }: StoreShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setStoreUrl(`${origin}/store/${store.slug}`);
    }
  }, [store.slug]);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(storeUrl || `https://green.direct/store/${store.slug}`)}&margin=12`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = storeUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPng = async () => {
    setIsGeneratingPng(true);
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 960);

      // Top green header accent bar
      ctx.fillStyle = '#059669';
      ctx.fillRect(0, 0, 800, 24);

      // Store Title & details
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(store.name, 400, 90);

      ctx.fillStyle = '#6b7280';
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Store #${String(store.storeNumber).padStart(2, '0')} · ${store.category}`, 400, 125);

      if (store.address) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        const displayAddr = store.address.length > 55 ? store.address.slice(0, 52) + '...' : store.address;
        ctx.fillText(`📍 ${displayAddr}`, 400, 155);
      }

      // Outer QR container border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 190, 600, 600);

      // Load and draw QR image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 120, 210, 560, 560);

        // Footer call to action
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 Scan with any phone camera to visit store', 400, 840);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        ctx.fillText(storeUrl, 400, 880);

        ctx.fillStyle = '#d1d5db';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText('Powered by GREEN Decentralized Marketplace', 400, 920);

        // Trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${store.slug}-store-qr.png`;
        link.href = dataUrl;
        link.click();
        setIsGeneratingPng(false);
      };
      qrImg.src = qrImageUrl;
    } catch (e) {
      console.error('Failed to generate PNG', e);
      setIsGeneratingPng(false);
    }
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: store.name,
          text: `Browse products and order directly from ${store.name}:`,
          url: storeUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`Shop directly at ${store.name}! View catalog and order online: ${storeUrl}`);
  const whatsappUrl = `https://wa.me/?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent(`Shop directly at ${store.name}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:fixed print:inset-0">
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Modal Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Header (Hidden when printing flyer) */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-white">Storefront QR Code</h3>
              <p className="text-xs text-neutral-500">Scan with any smartphone camera to open store catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-center">
          {/* Printable Flyer Header (Always visible) */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              {store.isVerified && <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Store #{String(store.storeNumber).padStart(2, '0')} · {store.category}</span>
            </div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white">{store.name}</h2>
            {store.address && (
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">{store.address}</p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="relative mx-auto w-64 h-64 p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt={`${store.name} QR Code`}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Universal QR: Works with iPhone, Android, Google Lens & Paytm</span>
            </p>
            <p className="text-[11px] text-neutral-400">
              Customers can scan this code to browse products and order directly without installing any app.
            </p>
          </div>

          {/* Store URL Bar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 print:hidden">
            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300 truncate flex-1 text-left px-2">
              {storeUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white border border-neutral-300 dark:border-neutral-600'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Action Buttons (Download, Print, Share) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 print:hidden">
            <button
              onClick={handleDownloadPng}
              disabled={isGeneratingPng}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPng ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handlePrintFlyer}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Tent</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-bold transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>

          {/* Social quick links */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 print:hidden text-xs text-neutral-500">
            <span>Share directly on:</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-600 hover:underline"
            >
              WhatsApp
            </a>
            <span>•</span>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-500 hover:underline"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
