'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Shield, Sparkles, Check, User, ArrowRight, X } from 'lucide-react';
import { SoundEngine } from './gameAudio';
import { parseTelegramInitData, tgCloudSet } from '@/lib/telegramStorage';

interface OperativeIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

export default function OperativeIdModal({ isOpen, onClose, canDismiss = true }: OperativeIdModalProps) {
  const { player, updatePlayerName, saveGame, redeemInviteCode } = useGame();
  const [customName, setCustomName] = useState(player.name || '');
  const [sponsorCode, setSponsorCode] = useState(player.referrals?.referredBy || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Suggest Telegram username or first name if player has a generic default
      const { user: tgUser } = parseTelegramInitData();
      const current = player.name || '';
      const isDefault = !current || current === 'Operative' || current.startsWith('Operative #') || current.startsWith('tg_operative_');

      if (isDefault) {
        if (tgUser?.username) {
          setCustomName(tgUser.username);
        } else if (tgUser?.first_name) {
          setCustomName([tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '));
        } else {
          setCustomName('');
        }
      } else {
        setCustomName(current);
      }

      if (!player.referrals?.referredBy) {
        const { start_param } = parseTelegramInitData();
        if (start_param) setSponsorCode(start_param);
      }
    }
  }, [isOpen, player.name, player.referrals?.referredBy]);

  useEffect(() => {
    if (!isOpen || !canDismiss) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, canDismiss, onClose]);

  if (!isOpen) return null;

  const handleSaveId = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed || trimmed.length < 2) {
      setErrorMsg('Please enter an ID with at least 2 characters.');
      return;
    }
    if (trimmed.length > 24) {
      setErrorMsg('ID must be 24 characters or less.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      // 1. Update player name & mark custom ID
      const nameRes = updatePlayerName(trimmed);
      if (!nameRes.success) {
        setErrorMsg(nameRes.message);
        setIsSaving(false);
        return;
      }

      // 2. Optional sponsor code redemption
      if (sponsorCode && !player.referrals?.referredBy) {
        try {
          await redeemInviteCode(sponsorCode.trim().toUpperCase());
        } catch {}
      }

      // 3. Mark hasCustomId in player state
      player.hasCustomId = true;
      player.name = trimmed;

      // 4. Update session storage & Telegram CloudStorage
      let authUser: any = {};
      try {
        const rawAuth = localStorage.getItem('metropolis_auth_user');
        if (rawAuth) authUser = JSON.parse(rawAuth);
      } catch {}

      authUser.name = trimmed;
      localStorage.setItem('metropolis_auth_user', JSON.stringify(authUser));

      // Dual save to Telegram CloudStorage so user NEVER has to enter credentials again
      tgCloudSet('metropolis_auth_user', JSON.stringify(authUser)).catch(() => {});

      // 5. Trigger cluster cloud save
      await saveGame();

      SoundEngine.playVictory(player.soundEnabled);
      setSuccessMsg(`✓ Operative ID "${trimmed}" permanently registered and saved!`);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save Operative ID');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-5 text-neutral-100 relative">
        {canDismiss && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-mono tracking-wide text-white uppercase">
            Operative Identity Setup
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Create your permanent Operative Codename. This ID will be saved for your Telegram account so you never need to re-enter credentials!
          </p>
        </div>

        <form onSubmit={handleSaveId} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-mono text-neutral-300 font-bold block">
              OPERATIVE CODENAME / ID <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. ShadowViper, Agent99, Dhruv"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-neutral-600 outline-none transition"
                autoFocus
                maxLength={24}
              />
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Visible on leaderboards, downlines, and syndicate chat.
            </span>
          </div>

          {!player.referrals?.referredBy && (
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-mono text-neutral-300 font-bold block">
                RECRUITER / SPONSOR CODE <span className="text-neutral-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value.toUpperCase())}
                placeholder="e.g. NEON-XXXXX"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-xs font-mono text-emerald-300 uppercase placeholder-neutral-600 outline-none transition"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-mono text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono text-center animate-fadeIn">
              {successMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs font-mono tracking-wider uppercase shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Binding Identity to Telegram...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lock In ID & Save to Telegram</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
