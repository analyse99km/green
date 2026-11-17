'use client';

import React from 'react';
import { useGame } from './GameContext';
import { ShieldAlert, Key, Clock, AlertTriangle, Scale, Shield } from 'lucide-react';

export default function JailModal() {
  const { player, bailFromJail } = useGame();

  if (player.jailTimeRemainingSeconds <= 0) return null;

  const minutes = Math.floor(player.jailTimeRemainingSeconds / 60);
  const seconds = player.jailTimeRemainingSeconds % 60;

  // Calculate dynamic bail: matches fine (50% item/crime value + 1/3 per level)
  const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
  const bailCost =
    player.currentBailAmount && player.currentBailAmount > 0
      ? player.currentBailAmount
      : Math.max(100, Math.round(300 * levelMultiplier));

  const totalPlayerCapital = (player.money || 0) + (player.bankMoney || 0);
  const canAfford = totalPlayerCapital >= bailCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-neutral-950 border-2 border-rose-600/60 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Steel Bars Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-between px-6">
          <div className="w-2 h-full bg-white" />
          <div className="w-2 h-full bg-white" />
          <div className="w-2 h-full bg-white" />
          <div className="w-2 h-full bg-white" />
          <div className="w-2 h-full bg-white" />
        </div>

        <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-lg shadow-rose-950/50">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wide uppercase">You Are in City Jail!</h2>
        
        {/* Crime Reason Tag */}
        <div className="mt-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs font-mono text-rose-300">
          <span className="text-[10px] text-rose-400 uppercase font-bold block">Charge / Offense:</span>
          <span>{player.lastCrimeReason || 'Caught committing street underworld offenses'}</span>
        </div>

        {/* Timer Box */}
        <div className="my-4 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono">
          <span className="text-[11px] text-neutral-500 block mb-0.5">Sentence Remaining</span>
          <span className="text-3xl font-black text-rose-400">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Bail Calculation Breakdown */}
        <div className="p-3 mb-4 rounded-xl bg-neutral-900/90 border border-neutral-800 text-left font-mono text-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" /> Bail Bond Requirement:
            </span>
            <span className="font-bold text-emerald-400 text-sm">
              🌿 {bailCost.toLocaleString()} GREEN
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Formula Basis:</span>
            <span>50% Item / Crime Value</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Heat Level Multiplier:</span>
            <span className="text-amber-400">Level {player.level} (+{Math.round((levelMultiplier - 1) * 100)}% Heat)</span>
          </div>
        </div>

        {/* Action: Post Bail */}
        <button
          onClick={bailFromJail}
          className={`w-full py-3 rounded-2xl font-mono font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            canAfford
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'
              : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700'
          }`}
        >
          <Key className="w-4 h-4 text-amber-300" />
          <span>Post 🌿 {bailCost.toLocaleString()} GREEN Bail Bond</span>
        </button>

        <p className="text-[11px] text-neutral-500 mt-3 font-mono">
          Or wait out your detention clock. Energy regenerates in holding cells.
        </p>
      </div>
    </div>
  );
}
