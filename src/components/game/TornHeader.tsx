'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Save, CheckCircle, HardDrive, Volume2, VolumeX, Menu, LogOut, Smartphone } from 'lucide-react';
import BackupModal from './BackupModal';
import { NOTIF_STORAGE_KEY } from './CityPhone';
import { formatCompactNumber, CURRENCY_ICONS } from './formatters';

interface TornHeaderProps {
  onOpenWheel?: () => void;
  onOpenMobileDrawer?: () => void;
  onOpenPhone?: () => void;
}

export default function TornHeader({ onOpenWheel, onOpenMobileDrawer, onOpenPhone }: TornHeaderProps) {
  const { player, isSaving, saveSuccess, saveGame, toggleSound } = useGame();
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);

  useEffect(() => {
    const checkNotifs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const lastRead = Number(localStorage.getItem(NOTIF_STORAGE_KEY) || 0);
          const latest = data.latestTimestamp || 0;
          setHasUnreadNotif(latest > lastRead);
        }
      } catch {}
    };

    checkNotifs();
    const interval = setInterval(checkNotifs, 10000);

    const onReadUpdated = () => setHasUnreadNotif(false);
    window.addEventListener('notif-read-updated', onReadUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notif-read-updated', onReadUpdated);
    };
  }, []);

  return (
    <header className="w-full max-w-full overflow-x-hidden bg-neutral-950 border-b border-neutral-800 text-neutral-100 shadow-md sticky top-0 z-40">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: Mobile Menu + Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 lg:hidden cursor-pointer flex items-center justify-center shrink-0"
              title="Open Navigation Tabs Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-lg">{CURRENCY_ICONS.GREEN}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs sm:text-sm tracking-wider text-emerald-400 uppercase">
                  NEON METROPOLIS
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-900 text-emerald-400 border border-emerald-500/30 hidden xs:inline">
                  CORE
                </span>
              </div>
              <span className="text-[9px] text-neutral-500 font-mono hidden md:block -mt-0.5">
                Decentralized Underworld RPG
              </span>
            </div>
          </div>
        </div>

        {/* Center: Balances (GREEN Coins & Sparks) - Compact format 1-999, 1K, 1M, 1B, 1T */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 font-mono text-xs shrink min-w-0">
          {/* GREEN Coins Reserve */}
          <div
            className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 px-2 sm:px-2.5 py-1 rounded-xl shadow-inner shrink-0"
            title={`Full Balance: ${(player.money || 0).toLocaleString()} GREEN`}
          >
            <span className="text-sm">{CURRENCY_ICONS.GREEN}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] text-neutral-500 font-bold uppercase hidden sm:block">GREEN</span>
              <span className="font-extrabold text-emerald-400 text-xs sm:text-sm">
                {formatCompactNumber(player.money || 0)}
              </span>
            </div>
          </div>

          {/* Sparks / Dream Points */}
          <div
            className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 px-2 sm:px-2.5 py-1 rounded-xl shadow-inner shrink-0"
            title={`Full Sparks: ${(player.dreamPoints || 0).toLocaleString()} Sparks`}
          >
            <span className="text-sm">{CURRENCY_ICONS.SPARKS}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] text-neutral-500 font-bold uppercase hidden sm:block">Sparks</span>
              <span className="font-extrabold text-amber-300 text-xs sm:text-sm">
                {formatCompactNumber(player.dreamPoints || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: FIXED Position Action Buttons (Save, Sound, Phone, Backup, Logout) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          {/* SAVE GAME BUTTON */}
          <button
            onClick={saveGame}
            disabled={isSaving}
            className={`relative flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                : player.hasUnsavedActions
                ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700'
            }`}
            title="Click to save your progress to cluster storage!"
          >
            {isSaving ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="hidden md:inline">Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span className="hidden md:inline">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{player.hasUnsavedActions ? 'Save!' : 'Save'}</span>
              </>
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              player.soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title={player.soundEnabled ? 'Sound FX: ON' : 'Sound FX: OFF'}
          >
            {player.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* City Smartphone Trigger */}
          <button
            onClick={onOpenPhone}
            className="relative p-1.5 rounded-xl border bg-neutral-900 border-neutral-700 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            title="Open City Smartphone (Live Chat & Broadcasts)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold font-mono hidden md:inline">Phone</span>
            {hasUnreadNotif && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 border border-neutral-950" />
              </span>
            )}
          </button>

          {/* Cryptographic Backup Trigger */}
          <button
            onClick={() => setShowBackupModal(true)}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer shrink-0"
            title="Export / Import Save File"
          >
            <HardDrive className="w-3.5 h-3.5" />
          </button>

          {/* Secure Logout / Switch Operative */}
          <button
            onClick={async () => {
              if (window.confirm(`Log out of Operative ${player.name}?`)) {
                try {
                  await saveGame();
                } catch {}
                try {
                  await fetch('/api/auth/email', { method: 'DELETE' });
                } catch {}
                localStorage.removeItem('metropolis_auth_user');
                window.location.href = '/';
              }
            }}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/60 transition-colors cursor-pointer shrink-0"
            title="Log Out / Switch Account"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <BackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </header>
  );
}
