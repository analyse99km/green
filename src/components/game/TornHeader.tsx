'use client';

import React, { useState } from 'react';
import { useGame } from './GameContext';
import { Save, CheckCircle, HardDrive, Volume2, VolumeX, Menu, LogOut } from 'lucide-react';
import BackupModal from './BackupModal';

interface TornHeaderProps {
  onOpenWheel?: () => void;
  onOpenMobileDrawer?: () => void;
}

export default function TornHeader({ onOpenWheel, onOpenMobileDrawer }: TornHeaderProps) {
  const { player, isSaving, saveSuccess, saveGame, toggleSound } = useGame();
  const [showBackupModal, setShowBackupModal] = useState(false);

  return (
    <header className="w-full max-w-full overflow-x-hidden bg-neutral-950 border-b border-neutral-800 text-neutral-100 shadow-md">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Mobile Drawer Button, Brand & Title */}
        <div className="flex items-center gap-2 shrink-0">
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
            <span className="text-lg">🌿</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm tracking-wider text-emerald-400 uppercase">
                  NEON METROPOLIS
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-emerald-400 border border-emerald-500/30">
                  GREEN Core
                </span>
              </div>
              <span className="text-[9px] text-neutral-500 font-mono hidden sm:block -mt-0.5">
                Decentralized Underworld RPG
              </span>
            </div>
          </div>
        </div>

        {/* Right: Currency Reserves, Save Game Button & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* GREEN Coins Reserve */}
          <div className="text-right text-xs font-mono">
            <span className="text-[9px] text-neutral-500 block">Reserves</span>
            <span className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center gap-0.5">
              <span>🌿</span>
              <span>{(player.money || 0).toLocaleString()}</span>
              <span className="text-[10px] text-emerald-500 font-semibold ml-0.5">GREEN</span>
            </span>
          </div>

          {/* SAVE GAME BUTTON (Cleanly Sized for Mobile & Desktop) */}
          <button
            onClick={saveGame}
            disabled={isSaving}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                : player.hasUnsavedActions
                ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700'
            }`}
            title="Click to save your progress before leaving!"
          >
            {isSaving ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{player.hasUnsavedActions ? 'Save!' : 'Save'}</span>
              </>
            )}
          </button>

          {/* Audio Synthesizer Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              player.soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title={player.soundEnabled ? 'Sound FX: ON' : 'Sound FX: OFF'}
          >
            {player.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Cryptographic Backup Trigger */}
          <button
            onClick={() => setShowBackupModal(true)}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Export / Import Save File"
          >
            <HardDrive className="w-3.5 h-3.5" />
          </button>

          {/* Secure Logout / Switch Operative */}
          <button
            onClick={async () => {
              if (window.confirm(`Log out of Operative ${player.name}?`)) {
                try {
                  await fetch('/api/auth/email', { method: 'DELETE' });
                } catch {}
                localStorage.removeItem('metropolis_auth_user');
                window.location.href = '/';
              }
            }}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/60 transition-colors cursor-pointer"
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
