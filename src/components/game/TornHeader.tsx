'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Save, CheckCircle, HardDrive, Volume2, VolumeX, Menu, LogOut, Smartphone, X, ShieldAlert } from 'lucide-react';
import BackupModal from './BackupModal';
import { NOTIF_STORAGE_KEY } from './CityPhone';
import { CURRENCY_ICONS } from './formatters';

interface TornHeaderProps {
  onOpenWheel?: () => void;
  onOpenMobileDrawer?: () => void;
  onOpenPhone?: () => void;
}

export default function TornHeader({ onOpenWheel, onOpenMobileDrawer, onOpenPhone }: TornHeaderProps) {
  const { player, isSaving, saveSuccess, saveGame, toggleSound } = useGame();
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);
  const [saveReminderActive, setSaveReminderActive] = useState(false);
  const [showReminderToast, setShowReminderToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check phone notifications
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

  // Time-to-time save reminder popup & red dot alert (every 45-60 seconds)
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      if (player.hasUnsavedActions) {
        setSaveReminderActive(true);
        setToastMessage('⚠️ Unsaved actions detected! Tap SAVE to lock your progress.');
        setShowReminderToast(true);
        setTimeout(() => setShowReminderToast(false), 5000);
      }
    }, 45000); // Check every 45s

    return () => clearInterval(reminderInterval);
  }, [player.hasUnsavedActions]);

  // When saved successfully (manual or auto-save), show clean confirmation popup & clear alerts
  useEffect(() => {
    if (saveSuccess) {
      setSaveReminderActive(false);
      setToastMessage('💾 Game progress securely saved & synced to cluster!');
      setShowReminderToast(true);
      const timer = setTimeout(() => setShowReminderToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Turn off red dot when player clicks save
  const handleSaveClick = async () => {
    setSaveReminderActive(false);
    setShowReminderToast(false);
    await saveGame();
  };

  const showRedDot = player.hasUnsavedActions || saveReminderActive;

  return (
    <header className="relative z-30 w-full max-w-full overflow-x-hidden bg-neutral-950 border-b border-neutral-800 text-neutral-100 shadow-md">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Navigation Drawer Button + Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-emerald-400 lg:hidden cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
              title="Open Navigation Tabs Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{CURRENCY_ICONS.GREEN}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-base tracking-wider text-emerald-400 uppercase">
                  NEON METROPOLIS
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold hidden xs:inline">
                  CORE
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono hidden md:block -mt-0.5">
                Decentralized Underworld RPG
              </span>
            </div>
          </div>
        </div>

        {/* Right: CLEAR, UNCLUTTERED ACTION CONTROLS WITH BIGGER SAVE BUTTON */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          {/* BIGGER, PROMINENT SAVE GAME BUTTON WITH CELLPHONE-STYLE RED ALERT DOT */}
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`relative flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer shrink-0 ${
              saveSuccess
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-900/50 ring-2 ring-emerald-400'
                : showRedDot
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-neutral-950 animate-pulse shadow-amber-900/60 ring-2 ring-amber-400'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700 hover:border-emerald-500/60'
            }`}
            title="Click to save your progress to cluster storage!"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>SAVED!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>{showRedDot ? 'SAVE NOW!' : 'SAVE'}</span>
              </>
            )}

            {/* TIME-TO-TIME PULSING RED BEACON DOT (EXACT CELLPHONE STYLE) */}
            {showRedDot && !saveSuccess && !isSaving && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 border-2 border-neutral-950 shadow-md" />
              </span>
            )}
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              player.soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
            title={player.soundEnabled ? 'Sound FX: ON' : 'Sound FX: OFF'}
          >
            {player.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* City Smartphone Trigger (With Cellphone Red Dot on Unread) */}
          <button
            onClick={onOpenPhone}
            className="relative p-2 sm:p-2.5 rounded-xl border bg-neutral-900 border-neutral-700 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Open City Smartphone (Live Chat & Broadcasts)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[11px] font-bold font-mono hidden md:inline">Phone</span>
            {hasUnreadNotif && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 border border-neutral-950" />
              </span>
            )}
          </button>

          {/* Cryptographic Backup Trigger */}
          <button
            onClick={() => setShowBackupModal(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer shrink-0"
            title="Export / Import Save File"
          >
            <HardDrive className="w-4 h-4" />
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
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/60 transition-colors cursor-pointer shrink-0"
            title="Log Out / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FLOATING SAVE REMINDER POPUP / TOAST (Placed at Top so it never collides with Bottom Navigation) */}
      {showReminderToast && toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[100] bg-neutral-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs text-neutral-200">
            {toastMessage.includes('⚠️') ? (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="leading-snug font-medium">{toastMessage}</span>
          </div>

          {toastMessage.includes('⚠️') && (
            <button
              onClick={handleSaveClick}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-lg shrink-0 transition"
            >
              SAVE
            </button>
          )}

          <button
            onClick={() => setShowReminderToast(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <BackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </header>
  );
}
