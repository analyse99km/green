'use client';

import React from 'react';
import { AlertCircle, Coins, Zap, Sparkles, ArrowRight, X, ShieldAlert, Store } from 'lucide-react';

export interface InsufficientFundsData {
  isOpen: boolean;
  currency: 'GREEN' | 'SPARKS' | 'ENERGY' | 'NERVE' | 'POINTS' | 'CREDITS' | 'BANK';
  requiredAmount: number;
  currentBalance: number;
  itemName: string;
  actionHint?: string;
}

interface InsufficientFundsModalProps {
  data: InsufficientFundsData | null;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export default function InsufficientFundsModal({
  data,
  onClose,
  onNavigate,
}: InsufficientFundsModalProps) {
  if (!data || !data.isOpen) return null;

  const shortfall = Math.max(0, data.requiredAmount - data.currentBalance);

  const getCurrencyMeta = () => {
    switch (data.currency) {
      case 'SPARKS':
        return {
          name: 'Dream Sparks',
          symbol: '⚡',
          color: 'text-cyan-400',
          bg: 'bg-cyan-950/60',
          border: 'border-cyan-500/40',
          howToEarn: 'Tap the Dream Core in Lucid Dream or upgrade your Botanical Cards to generate auto-harvest yields!',
          navTarget: 'DREAM_TAP',
          navLabel: 'Go to Lucid Dream Generator',
        };
      case 'GREEN':
      case 'BANK':
        return {
          name: 'GREEN Coins',
          symbol: '🌿',
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-500/40',
          howToEarn: 'Execute street crimes, sell contraband at the Bazaar, collect company salary, or convert Dream Sparks in the Market!',
          navTarget: 'CRIMES',
          navLabel: 'Execute Crimes for Cash',
        };
      case 'ENERGY':
        return {
          name: 'Energy',
          symbol: '⚡',
          color: 'text-amber-400',
          bg: 'bg-amber-950/60',
          border: 'border-amber-500/40',
          howToEarn: 'Consume chef meals from your inventory or exchange Dream Sparks in the Lucid Dream Market!',
          navTarget: 'DREAM_TAP',
          navLabel: 'Exchange Sparks for Energy',
        };
      case 'NERVE':
        return {
          name: 'Nerve',
          symbol: '🔥',
          color: 'text-rose-400',
          bg: 'bg-rose-950/60',
          border: 'border-rose-500/40',
          howToEarn: 'Wait for natural nerve regeneration or exchange Dream Sparks for Nerve Nectar in the Dream Market!',
          navTarget: 'DREAM_TAP',
          navLabel: 'Exchange Sparks for Nerve',
        };
      default:
        return {
          name: 'Credits / Points',
          symbol: '💎',
          color: 'text-indigo-400',
          bg: 'bg-indigo-950/60',
          border: 'border-indigo-500/40',
          howToEarn: 'Complete Syndicate agency missions or level up to acquire points!',
          navTarget: 'MISSIONS',
          navLabel: 'View Agency Missions',
        };
    }
  };

  const meta = getCurrencyMeta();

  const handleAction = () => {
    onClose();
    if (onNavigate && meta.navTarget) {
      onNavigate(meta.navTarget);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-neutral-900 border border-amber-500/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="shrink-0 px-4 py-3.5 border-b border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
                Transaction Blocked
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Insufficient Funds & Resources
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-3.5 text-xs font-sans overflow-y-auto">
          {/* Target Item Name Banner */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400 text-xs">Target Purchase:</span>
            <span className="font-bold text-white text-xs text-right max-w-[200px] truncate">
              {data.itemName}
            </span>
          </div>

          {/* Breakdown Card */}
          <div className={`p-3.5 rounded-xl ${meta.bg} border ${meta.border} space-y-2.5`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300">Required {meta.name}:</span>
              <span className={`font-bold ${meta.color} text-sm`}>
                {meta.symbol} {data.requiredAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Current Balance:</span>
              <span className="font-medium text-neutral-200">
                {meta.symbol} {data.currentBalance.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold">Required Shortfall:</span>
              <span className="font-black text-rose-400 text-sm">
                -{meta.symbol} {shortfall.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Guidance / How to earn more */}
          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5 font-mono">
              <span>💡</span> How to Acquire More {meta.name}:
            </span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {meta.howToEarn}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-3.5 border-t border-neutral-800 bg-neutral-950/95 flex flex-col sm:flex-row items-center gap-2">
          {meta.navTarget && (
            <button
              onClick={handleAction}
              className="w-full sm:flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>{meta.navLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-mono font-bold text-xs transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
