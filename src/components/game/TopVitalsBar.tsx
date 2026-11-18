'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import {
  Zap,
  Shield,
  Smile,
  Activity,
  Utensils,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatCompactNumber, CURRENCY_ICONS } from './formatters';

interface TopVitalsBarProps {
  onOpenStreak?: () => void;
  onOpenDreamTap?: () => void;
  onOpenForge?: () => void;
}

export default function TopVitalsBar({
  onOpenStreak,
  onOpenDreamTap,
  onOpenForge,
}: TopVitalsBarProps) {
  const { player, claimDailyStreak } = useGame();
  const [streakClaimedMsg, setStreakClaimedMsg] = useState<string | null>(null);

  // Auto-updating countdown display
  const [timerText, setTimerText] = useState('02:15');

  useEffect(() => {
    const sec = 135;
    let current = sec;
    const interval = setInterval(() => {
      current = current <= 0 ? 135 : current - 1;
      const m = Math.floor(current / 60);
      const s = current % 60;
      setTimerText(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimStreak = () => {
    const res = claimDailyStreak();
    setStreakClaimedMsg(res.message);
    setTimeout(() => setStreakClaimedMsg(null), 3500);
  };

  const xpPct = Math.min(100, Math.round(((player.xp || 0) / (player.xpNeeded || 250)) * 100));
  const isStarving = (player.food ?? 70) <= 20;

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-neutral-900/95 border-b border-neutral-800 text-xs font-mono shadow-sm">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 space-y-2">
        {/* Row 1: Player Tag, Level progress, GREEN Coins, Dream Sparks & Daily Clipper */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-neutral-800/60">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Player Identity Badge */}
            <div className="flex items-center gap-1.5 bg-neutral-950 px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-200">
              <span className="text-emerald-400">👤</span>
              <span className="font-bold text-xs text-white max-w-[120px] sm:max-w-[180px] truncate">{player.name}</span>
              <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">[{player.xid}]</span>
            </div>

            {/* Level Badge with mini XP bar */}
            <div className="flex items-center gap-1.5 bg-neutral-950 px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-800">
              <span className="text-emerald-400 font-bold text-xs">Lv.{player.level}</span>
              <div className="w-14 sm:w-20 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400">{xpPct}%</span>
            </div>

            {/* GREEN Coins */}
            <div
              className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-mono text-xs"
              title={`Full Balance: ${(player.money || 0).toLocaleString()} GREEN`}
            >
              <span>{CURRENCY_ICONS.GREEN}</span>
              <span>{formatCompactNumber(player.money || 0)}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">GREEN</span>
            </div>

            {/* Dream Sparks Bank */}
            <button
              onClick={onOpenDreamTap}
              className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-colors font-mono text-xs"
              title={`Full Sparks: ${(player.dreamPoints || 0).toLocaleString()} Sparks`}
            >
              <span>{CURRENCY_ICONS.SPARKS}</span>
              <span>{formatCompactNumber(player.dreamPoints || 0)}</span>
              <span className="text-[10px] text-amber-300 font-semibold">Sparks</span>
            </button>
          </div>

          {/* Daily Streak Clipper Pill Button */}
          <div className="flex items-center gap-2">
            {streakClaimedMsg ? (
              <span className="text-emerald-400 font-bold text-[11px] animate-fadeIn">
                ✓ {streakClaimedMsg}
              </span>
            ) : player.canClaimDailyStreak ? (
              <button
                onClick={handleClaimStreak}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs shadow-md animate-pulse cursor-pointer transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Claim Day {player.dailyStreak || 1} Streak!</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                <Calendar className="w-3 h-3" />
                <span>Day {player.dailyStreak || 1} Claimed ✓</span>
              </span>
            )}
          </div>
        </div>

        {/* Row 2: The 5 Authentic Vitals Bars (Energy, Nerve, Happy, Life, Food) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          {/* Energy */}
          <div className="bg-neutral-950/80 p-1.5 px-2.5 rounded-lg border border-neutral-800">
            <div className="flex justify-between items-center mb-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Zap className="w-3 h-3" /> Energy
              </span>
              <span className="text-neutral-400">
                {player.energy}/{player.maxEnergy}
                <span className="text-neutral-500 text-[10px] ml-1">{timerText}</span>
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded transition-all duration-300"
                style={{ width: `${Math.min(100, (player.energy / player.maxEnergy) * 100)}%` }}
              />
            </div>
          </div>

          {/* Nerve */}
          <div className="bg-neutral-950/80 p-1.5 px-2.5 rounded-lg border border-neutral-800">
            <div className="flex justify-between items-center mb-1">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Shield className="w-3 h-3" /> Nerve
              </span>
              <span className="text-neutral-400">
                {player.nerve}/{player.maxNerve}
                <span className="text-emerald-400 text-[10px] ml-1">
                  {player.nerve >= player.maxNerve ? 'FULL' : timerText}
                </span>
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded transition-all duration-300"
                style={{ width: `${Math.min(100, (player.nerve / player.maxNerve) * 100)}%` }}
              />
            </div>
          </div>

          {/* Happy */}
          <div className="bg-neutral-950/80 p-1.5 px-2.5 rounded-lg border border-neutral-800">
            <div className="flex justify-between items-center mb-1">
              <span className="flex items-center gap-1 text-blue-400 font-bold">
                <Smile className="w-3 h-3" /> Happy
              </span>
              <span className="text-neutral-400">
                {player.happy}/{player.maxHappy}
                <span className="text-emerald-400 text-[10px] ml-1">
                  {player.happy >= player.maxHappy ? 'FULL' : timerText}
                </span>
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded transition-all duration-300"
                style={{ width: `${Math.min(100, (player.happy / player.maxHappy) * 100)}%` }}
              />
            </div>
          </div>

          {/* Life */}
          <div className="bg-neutral-950/80 p-1.5 px-2.5 rounded-lg border border-neutral-800">
            <div className="flex justify-between items-center mb-1">
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <Activity className="w-3 h-3" /> Life
              </span>
              <span className="text-neutral-400">
                {player.life}/{player.maxLife}
                <span className="text-emerald-400 text-[10px] ml-1">
                  {player.life >= player.maxLife ? 'FULL' : 'HEAL'}
                </span>
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded transition-all duration-300"
                style={{ width: `${Math.min(100, (player.life / player.maxLife) * 100)}%` }}
              />
            </div>
          </div>

          {/* Food / Satiety */}
          <div className={`col-span-2 sm:col-span-1 p-1.5 px-2.5 rounded-lg border transition-all ${
            isStarving
              ? 'bg-red-950/40 border-red-500/80 animate-pulse'
              : 'bg-neutral-950/80 border-neutral-800'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="flex items-center gap-1 text-orange-400 font-bold">
                <Utensils className="w-3 h-3" /> Satiety
                {isStarving && (
                  <span className="text-[9px] text-red-400 font-black ml-1 flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> STARVING!
                  </span>
                )}
              </span>
              <span className={isStarving ? 'text-red-400 font-bold' : 'text-neutral-400'}>
                {player.food ?? 70}/{player.maxFood ?? 100}
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded h-1.5 overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-300 ${
                  isStarving
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, ((player.food ?? 70) / (player.maxFood ?? 100)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
