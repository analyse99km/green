'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Gift,
  Coins,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  ExternalLink,
} from 'lucide-react';

interface PreReleaseNoticeModalProps {
  onDismiss?: () => void;
}

export default function PreReleaseNoticeModal({ onDismiss }: PreReleaseNoticeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user silenced it for this session
    const silenced = sessionStorage.getItem('metropolis_prerelease_dismissed');
    if (!silenced) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      sessionStorage.setItem('metropolis_prerelease_dismissed', 'true');
    }
    setIsOpen(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      {/* Modal Dialog Box (Strictly Constrained to 88vh with Fixed Sticky Footer on Mobile) */}
      <div className="relative w-full max-w-md max-h-[88vh] bg-neutral-900 border border-emerald-500/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Glow Ambient Highlights */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header (Fixed, Compact) */}
        <div className="shrink-0 px-4 py-3 border-b border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Rocket className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                Official Pioneer Notice
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Pre-Release Pioneer Edition
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss Notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Body Content (Fits Any Mobile Screen) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-sans scrollbar-thin">
          {/* Announcement 1: Pre-Release Version */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs">
              <span>🚀</span>
              <span>Official Pre-Release Pioneer Phase</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              This is the official <strong>Pre-Release Pioneer Edition</strong> of Neon Metropolis. Full worldwide public launch will deploy globally soon!
            </p>
          </div>

          {/* Announcement 2: Guaranteed Airdrop in Native $GREEN Crypto */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
              <span>🪂</span>
              <span>Guaranteed Native Crypto Airdrop ($GREEN)</span>
            </div>
            <p className="text-neutral-200 text-[11px] leading-relaxed">
              All pioneer operatives will receive an <strong>exclusive airdrop of our native ecosystem cryptocurrency ($GREEN)</strong> as the pre-release matures!
            </p>
            <div className="p-2 rounded-lg bg-neutral-950/90 border border-emerald-500/20 font-mono text-[10px] text-emerald-400 space-y-0.5">
              <span className="font-bold text-white block">📊 Airdrop Score Factors:</span>
              <p>• Player Level & Experience</p>
              <p>• Battle & Gym Training Stats</p>
              <p>• Syndicate Recruits & Referrals</p>
              <p>• Net Liquid 🌿 GREEN Wealth</p>
              <p>• ⚡ Lucid Dream Taps & Tap Stamina Level</p>
              <p>• 🌲 Botanical Cards Unlocked & Harvest Yield</p>
            </div>
          </div>

          {/* Announcement 3: Unrestricted Full Version Continuation */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs">
              <span>⚔️</span>
              <span>Full Version Seamless Continuation</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              After airdrop distribution, the natural full version launches with zero restrictions. Your account, progress, and syndicate will continue seamlessly!
            </p>
          </div>
        </div>

        {/* 3. Footer with Dismiss Checkbox and Sticky Big Action Button */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950/95 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Don't show again this session</span>
            </label>
            <span className="text-[10px] text-neutral-500">P2P v2.0</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-mono font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Enter Neon Metropolis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
