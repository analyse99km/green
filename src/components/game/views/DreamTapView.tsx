'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import {
  Zap,
  Sparkles,
  Utensils,
  Shield,
  Activity,
  Smile,
  Check,
  Lock,
  BatteryCharging,
  TrendingUp,
  Sprout,
  TreeDeciduous,
  Leaf,
  Layers,
  ArrowUpRight,
  Users,
  X,
  Gift,
  Award,
  ChevronRight,
  Clock,
  Info,
} from 'lucide-react';
import ReferralView from './ReferralView';
import { SoundEngine } from '../gameAudio';
import { loadCatalogData, DynamicCatalogData, BotanicalCardDef, getTodayDailyCombo, DailyComboDef, INITIAL_DREAM_MARKET_ITEMS, DreamMarketItemDef } from '../gameCatalog';
import DynamicIcon from '../DynamicIcon';
import { formatCompactNumber, CURRENCY_ICONS } from '../formatters';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface DreamTapViewProps {
  onNavigateToCity?: () => void;
}

export default function DreamTapView({ onNavigateToCity }: DreamTapViewProps = {}) {
  const {
    player,
    tapDreamEnergy,
    exchangeDreamSparks,
    upgradeDreamCard,
    unlockTapperSkin,
    equipTapperSkin,
    claimDailyStreak,
  } = useGame();

  const [activeSubTab, setActiveSubTab] = useState<
    'TAP_CORE' | 'CARDS_STORE' | 'MARKET' | 'PLANTS' | 'REFERRALS'
  >('TAP_CORE');

  const [catalog, setCatalog] = useState<DynamicCatalogData>({
    categories: [],
    cards: [],
    customItems: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [dailyWeekTab, setDailyWeekTab] = useState<number>(1);

  const todayCombo = getTodayDailyCombo(catalog);

  const [comboCountdownStr, setComboCountdownStr] = useState('02:18:07');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diffSec = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      const hrs = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');
      setComboCountdownStr(`${hrs}:${mins}:${secs}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load catalog data
  useEffect(() => {
    const data = loadCatalogData();
    setCatalog(data);
  }, []);

  const isAwakened = Boolean(
    (player.money || 0) > 0 &&
    (player.energy || 0) > 0 &&
    (player.nerve || 0) > 0 &&
    (player.happy || 0) > 0 &&
    (player.life || 0) > 0 &&
    (player.food || 0) > 0
  );

  const cards = player.dreamCards || {};
  const unlockedPlants = player.unlockedTapperSkins || ['tree_sprout'];
  const activePlant = player.activeTapperSkinId || 'tree_sprout';

  // Calculate dynamic auto sparks per second
  const autoSparksPerSec = (catalog.cards || []).reduce((acc, card) => {
    const lvl = cards[card.id] || 0;
    return acc + lvl * (card.sparksPerSec || 1);
  }, 0);

  // Plant stage definitions
  const plantStages = [
    { id: 'tree_sprout', name: 'Chlorophyll Sprout', icon: '🌱', bonus: '+1/tap', sparksPerTap: 1 },
    { id: 'tree_mint', name: 'Peppermint Shrub', icon: '🌿', bonus: '+3/tap', sparksPerTap: 3 },
    { id: 'tree_bonsai', name: 'Ancient Zen Bonsai', icon: '🪴', bonus: '+8/tap', sparksPerTap: 8 },
    { id: 'tree_bamboo', name: 'Cybernetic Bamboo', icon: '🎋', bonus: '+20/tap', sparksPerTap: 20 },
    { id: 'tree_oak', name: 'Sacred Banyan Canopy', icon: '🌳', bonus: '+50/tap', sparksPerTap: 50 },
  ];

  const currentPlant = plantStages.find((p) => p.id === activePlant) || plantStages[0];

  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if ((player.tapStamina ?? 500) <= 0) {
      setFeedback('⚠️ Tap Stamina exhausted! Refills +10 every 15 seconds.');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    const res = tapDreamEnergy();
    SoundEngine.playTap(player.soundEnabled);
    setCombo(res.comboStreak);

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newFloater: FloatingText = {
      id: Date.now() + Math.random(),
      text: res.comboStreak % 10 === 0 ? `🌿 +${res.sparksEarned} Sparks & +1 ENERGY!` : `+${res.sparksEarned}`,
      x: (clientX % 80) + 40,
      y: (clientY % 50) + 20,
      color: res.comboStreak > 10 ? 'text-amber-300' : 'text-emerald-300',
    };

    setFloaters((prev) => [...prev.slice(-6), newFloater]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== newFloater.id));
    }, 900);
  };

  const handleCardUpgrade = (cardId: string) => {
    const res = upgradeDreamCard(cardId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleClaimDaily = () => {
    const res = claimDailyStreak();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  // 7-Day Rewards for Daily Login Streak (balanced gradual progression)
  const dailyStreakRewards = [
    { day: 1, label: 'Day 1', reward: '+5 GREEN, +15⚡', icon: '🌱', type: 'green' },
    { day: 2, label: 'Day 2', reward: '+10 GREEN, +30⚡', icon: '🌿', type: 'green' },
    { day: 3, label: 'Day 3', reward: '+15 GREEN, +50⚡', icon: '🪴', type: 'green' },
    { day: 4, label: 'Day 4', reward: '+20 GREEN, +75⚡', icon: '🎋', type: 'green' },
    { day: 5, label: 'Day 5', reward: '+30 GREEN, +100⚡', icon: '🌳', type: 'green' },
    { day: 6, label: 'Day 6', reward: '+45 GREEN, +150⚡', icon: '⚡', type: 'green' },
    { day: 7, label: 'Day 7', reward: '👑 +60 GREEN, +250⚡', icon: '👑', type: 'green' },
  ];

  const currentStreakDay = player.dailyStreak || 1;
  const canClaim = player.canClaimDailyStreak ?? true;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* LUCID TAP TOP HEADER: Sparks Counter, Coin, and Direct Home Button  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-neutral-900 via-emerald-950/40 to-neutral-900 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner animate-pulse">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm uppercase text-white tracking-wider">
                LUCID DREAM MINTING CORE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                Tap Coin
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-400">
              Operative: <strong className="text-emerald-300">{player.name}</strong> &bull; Level {player.level}
            </div>
          </div>
        </div>

        {onNavigateToCity && (
          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              onNavigateToCity();
            }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs font-mono shadow-lg shadow-emerald-900/50 transition-all cursor-pointer active:scale-95 flex items-center gap-2 shrink-0"
          >
            <span>🏙️ Enter Metropolis (Home)</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TOP NAVIGATION PILLS                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar text-xs font-mono select-none">
          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveSubTab('TAP_CORE');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'TAP_CORE'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-1 ring-emerald-400'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <span>⚡ Plant Core (Direct Play)</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveSubTab('CARDS_STORE');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'CARDS_STORE'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <span>🃏 Cards Store ({catalog.cards.length})</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveSubTab('MARKET');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'MARKET'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <span>🛒 Dream Market</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveSubTab('PLANTS');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'PLANTS'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <span>🌳 Tree Evolution</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveSubTab('REFERRALS');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'REFERRALS'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <span>👥 Syndicate Referrals</span>
          </button>
        </div>

        {/* Global Sparks Balance Pill */}
        <div className="flex items-center gap-2 font-mono text-xs px-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-black">{(player.dreamPoints || 0).toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500 font-normal">Sparks</span>
          </div>
          <span className="text-[11px] text-cyan-400 font-bold hidden sm:inline">
            +{autoSparksPerSec} /s
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs text-center font-bold">
          {feedback}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. DIRECT PLAY: 100% ZERO-SCROLL TAPPING VIEWPORT (HAMSTER STYLE)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'TAP_CORE' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-neutral-800 rounded-3xl p-3 sm:p-5 shadow-2xl relative flex flex-col justify-between">
          {/* TOP STATS TRIO (Exact Hamster Kombat Pill Headers) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 text-center">
              <div className="text-[10px] text-neutral-400 font-mono uppercase">Earn per tap</div>
              <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-sm sm:text-base mt-0.5">
                <span>{CURRENCY_ICONS.SPARKS}</span>
                <span>{currentPlant.bonus}</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 text-center">
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Coins to lvl up</div>
              <div className="flex items-center justify-center gap-1 text-cyan-300 font-black text-sm sm:text-base mt-0.5 font-mono">
                <span>{formatCompactNumber(5000 * (player.level || 1))}</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 text-center">
              <div className="text-[10px] text-emerald-400 font-mono uppercase">Profit per sec</div>
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-black text-sm sm:text-base mt-0.5 font-mono">
                <span>📈</span>
                <span>+{formatCompactNumber(autoSparksPerSec)}</span>
              </div>
            </div>
          </div>

          {/* MAIN BALANCE & LEVEL STATUS */}
          <div className="text-center my-1.5 sm:my-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl animate-bounce">{CURRENCY_ICONS.SPARKS}</span>
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {formatCompactNumber(player.dreamPoints || 0)}
              </span>
            </div>

            {/* Level Bar */}
            <div className="max-w-md mx-auto mt-1 sm:mt-2 px-2">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 mb-0.5 sm:mb-1">
                <span className="font-bold text-zinc-300">
                  {CURRENCY_ICONS.GREEN} {currentPlant.name}
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  Level {player.level || 1}/10
                </span>
              </div>
              <div className="w-full bg-neutral-900 h-2 sm:h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.min(100, ((player.dreamPoints || 0) / (5000 * (player.level || 1))) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* QUICK ACTION ROW (Daily Reward, Daily Combo, Quick Awake) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 max-w-lg mx-auto w-full my-1">
            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setShowDailyRewardModal(true);
              }}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-1.5 sm:p-2 text-center transition flex flex-col items-center justify-center gap-0.5 sm:gap-1 group"
            >
              <div className="relative">
                <span className="text-base sm:text-lg">🎁</span>
                {canClaim && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-neutral-200">Daily Reward</span>
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono">
                {canClaim ? 'CLAIM NOW' : `Day ${currentStreakDay}`}
              </span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setActiveSubTab('CARDS_STORE');
              }}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-1.5 sm:p-2 text-center transition flex flex-col items-center justify-center gap-0.5 sm:gap-1"
            >
              <span className="text-base sm:text-lg">🃏</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-neutral-200">Daily Combo</span>
              <span className="text-[8px] sm:text-[9px] text-amber-300 font-mono">+{formatCompactNumber(todayCombo.rewardSparks)} Sparks</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setActiveSubTab('REFERRALS');
              }}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-1.5 sm:p-2 text-center transition flex flex-col items-center justify-center gap-0.5 sm:gap-1"
            >
              <span className="text-base sm:text-lg">👥</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-neutral-200">Friends</span>
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono">+50G Direct</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setActiveSubTab('MARKET');
              }}
              className="hidden sm:flex bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-2 text-center transition flex-col items-center justify-center gap-1"
            >
              <span className="text-lg">🛒</span>
              <span className="text-[10px] font-bold text-neutral-200">Bazaar Store</span>
              <span className="text-[9px] text-zinc-400 font-mono">P2P Mesh</span>
            </button>
          </div>

          {/* CENTER: THE BIG CIRCULAR GLOWING ARENA (DIRECT PLAY - ENLARGED COIN) */}
          <div className="relative flex items-center justify-center my-2 sm:my-4 select-none">
            {/* Ambient Multi-Ring Glow */}
            <div className="w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/25 to-cyan-500/30 blur-2xl absolute pointer-events-none animate-pulse" />

            <button
              onClick={handleTap}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              className={`relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full p-2.5 bg-gradient-to-b from-emerald-400 via-teal-600 to-emerald-950 shadow-2xl transition-all duration-100 flex items-center justify-center cursor-pointer outline-none ${
                isPressing ? 'scale-95 shadow-inner' : 'hover:scale-102 hover:shadow-emerald-500/40'
              }`}
            >
              {/* Inner Circle Disc */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-neutral-900 to-black border-4 border-emerald-400/40 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-6xl sm:text-8xl filter drop-shadow-[0_0_20px_rgba(52,211,153,0.7)] transform transition-transform duration-100 select-none">
                  {currentPlant.icon}
                </span>

                <div className="absolute bottom-2.5 sm:bottom-4 text-center">
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
                    TAP TO MINT
                  </div>
                </div>
              </div>
            </button>

            {/* Floating numbers on click */}
            {floaters.map((f) => (
              <span
                key={f.id}
                style={{ top: `${f.y}%`, left: `${f.x}%` }}
                className={`absolute pointer-events-none font-black text-xl sm:text-2xl font-mono animate-bounce drop-shadow ${f.color}`}
              >
                {f.text}
              </span>
            ))}
          </div>

          {/* BOTTOM ARENA CONTROLS: Stamina & Boost on the left, right side kept completely clear */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 px-2 sm:px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">
                  {player.tapStamina ?? 500} / {player.maxTapStamina || 500}
                </span>
              </div>

              <button
                onClick={() => {
                  SoundEngine.playVictory(player.soundEnabled);
                  setFeedback('🚀 Boost Surge activated! +100 Max Stamina temporary boost.');
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                <span>🚀</span>
                <span>Boost</span>
              </button>
            </div>

            {/* Empty reserved space so floating City Smartphone never overlaps any element */}
            <div className="w-16 h-8 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CARDS STORE (MINE - Exact Hamster Kombat Screenshot 3)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'CARDS_STORE' && (
        <div className="space-y-3.5">
          {/* Daily Combo Card Banner (Hamster Kombat Style) */}
          <div className="bg-[#171a21] border border-[#262c36] rounded-3xl p-3.5 sm:p-4 shadow-xl space-y-3">
            {/* Header: "Daily combo" + 3 Dots + Timer + Reward Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-wide">Daily combo</span>
                <div className="flex items-center gap-1.5 ml-1">
                  {todayCombo.cardIds.map((cid, i) => {
                    const isFound = (cards[cid] || 0) > 0;
                    return (
                      <span
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          isFound
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                            : 'bg-[#2b313d] border border-neutral-700/60'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded-lg border border-neutral-800">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{comboCountdownStr}</span>
                </div>
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-black text-xs px-2.5 sm:px-3 py-1 rounded-xl flex items-center gap-1 shadow-md shadow-purple-950/40">
                  <span>{CURRENCY_ICONS.SPARKS}</span>
                  <span>+{formatCompactNumber(todayCombo.rewardSparks)}</span>
                </div>
              </div>
            </div>

            {/* 3 Mystery Card Slots */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {todayCombo.cardIds.map((cid, slot) => {
                const isGuessed = (cards[cid] || 0) > 0;
                const foundCard = catalog.cards.find((c) => c.id === cid);
                return (
                  <div
                    key={slot}
                    className={`rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between aspect-[3/4] relative overflow-hidden transition-all shadow-inner ${
                      isGuessed
                        ? 'bg-gradient-to-b from-emerald-950/70 to-neutral-950 border-2 border-emerald-500/70 shadow-emerald-950/40'
                        : 'bg-[#1e232d] hover:bg-[#252c38] border-2 border-indigo-500/35 hover:border-indigo-500/60'
                    }`}
                  >
                    {isGuessed ? (
                      <>
                        <div className="w-full flex justify-end">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-neutral-950 text-[10px] font-black flex items-center justify-center">✓</span>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center my-auto">
                          <DynamicIcon icon={foundCard?.icon} alt={foundCard?.title} imgClassName="w-10 h-10 object-contain rounded" className="text-3xl" fallback="🌱" />
                        </div>
                        <div className="text-[11px] font-bold text-emerald-300 text-center line-clamp-1 w-full">
                          {foundCard?.title || cid}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-3" />
                        <div className="my-auto flex flex-col items-center justify-center">
                          <span className="text-3xl sm:text-4xl text-amber-400 font-black drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]">?</span>
                        </div>
                        <div className="text-base sm:text-lg">✨💰</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Centered Prominent Balance Row (Exact Hamster Kombat Match) */}
          <div className="flex items-center justify-center gap-2.5 py-1">
            <span className="text-3xl sm:text-4xl">{CURRENCY_ICONS.SPARKS}</span>
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {formatCompactNumber(player.dreamPoints || 0)}
            </span>
          </div>

          {/* Category Tabs (Dynamic from Catalog - Rounded Horizontal Bar) */}
          <div className="bg-[#14161b] border border-[#252a33] rounded-2xl p-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none text-xs font-semibold">
            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setSelectedCategory('ALL');
              }}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#252a34] text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Sections
            </button>
            {catalog.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  SoundEngine.playTick(player.soundEnabled);
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#252a34] text-white font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <DynamicIcon icon={cat.icon} alt={cat.name} imgClassName="w-3.5 h-3.5 object-contain rounded" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* 2-Column Cards Grid (Hamster Kombat Pattern: Compact, Space-Efficient) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {catalog.cards
              .filter((card) => selectedCategory === 'ALL' || card.category === selectedCategory)
              .map((card) => {
                const currentLvl = cards[card.id] || 0;
                const nextCost = Math.round(card.baseCost * Math.pow(card.costMultiplier || 1.35, currentLvl));
                const canAfford = (player.dreamPoints || 0) >= nextCost;

                // Check Prerequisite
                let isLocked = false;
                let lockMsg = '';
                if (card.requiredCardId) {
                  const reqCard = catalog.cards.find((c) => c.id === card.requiredCardId);
                  const reqLvl = card.requiredCardLevel || 1;
                  const currentReqLvl = cards[card.requiredCardId] || 0;
                  if (currentReqLvl < reqLvl) {
                    isLocked = true;
                    lockMsg = `${reqCard?.title || card.requiredCardId} lvl ${reqLvl}`;
                  }
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (!isLocked && canAfford) {
                        handleCardUpgrade(card.id);
                      }
                    }}
                    className={`bg-[#1a1d24] border rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all relative overflow-hidden select-none ${
                      isLocked
                        ? 'border-neutral-800/80 bg-neutral-950/70 opacity-60 cursor-not-allowed'
                        : canAfford
                        ? 'border-[#2d3340] hover:border-amber-400/60 hover:bg-[#20242e] cursor-pointer shadow-md'
                        : 'border-[#2d3340] opacity-80 cursor-pointer'
                    }`}
                  >
                    {/* Top Row: Icon on Left, Title + Profit per hour on Right */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-inner">
                        <DynamicIcon
                          icon={card.icon}
                          alt={card.title}
                          imgClassName="w-full h-full object-contain rounded"
                          className="text-2xl"
                          fallback="🌱"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm leading-tight truncate">
                          {card.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1 leading-none">Profit per hour</div>
                        <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5 font-mono">
                          <span className="text-amber-300 text-[11px]">{CURRENCY_ICONS.SPARKS}</span>
                          <span>+{formatCompactNumber(card.sparksPerSec * 3600 || card.sparksPerSec)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-neutral-800/80 my-2" />

                    {/* Bottom Row: Lvl on Left, Cost on Right */}
                    {isLocked ? (
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-400/90 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/20">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span className="truncate text-[10px]">{lockMsg}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-400 text-[11px] font-semibold">
                          lvl {currentLvl}
                        </span>
                        <div
                          className={`flex items-center gap-1 font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg border transition ${
                            canAfford
                              ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white'
                              : 'bg-neutral-950/80 border-neutral-800/60 text-neutral-500'
                          }`}
                        >
                          <span className="text-amber-300">{CURRENCY_ICONS.SPARKS}</span>
                          <span>{formatCompactNumber(nextCost)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. DREAM MARKET / BAZAAR                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'MARKET' && (() => {
        const marketItems: DreamMarketItemDef[] = (catalog.dreamMarketItems && catalog.dreamMarketItems.length > 0)
          ? catalog.dreamMarketItems
          : INITIAL_DREAM_MARKET_ITEMS;

        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <span>⚡</span> Botanical Dream Market & Vitals Store
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Convert your minted Sparks into physical Energy, Food Satiety, Nerve, Happiness, Life, and liquid GREEN coins.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
                <span className="text-xs text-neutral-400">Balance:</span>
                <span className="text-amber-400 text-sm font-bold flex items-center gap-1 font-mono">
                  <span>{CURRENCY_ICONS.SPARKS}</span>
                  <span>{formatCompactNumber(player.dreamPoints || 0)}</span>
                </span>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {marketItems.map((item) => {
                const canAfford = (player.dreamPoints || 0) >= item.sparkCost;
                const isLocked = Boolean(
                  item.requiredCardId &&
                  ((player.dreamCards || {})[item.requiredCardId] || 0) < (item.requiredCardLevel || 1)
                );

                return (
                  <div
                    key={item.id}
                    className={`bg-neutral-950 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                      isLocked
                        ? 'border-neutral-800/50 opacity-75'
                        : canAfford
                        ? 'border-neutral-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-950/20'
                        : 'border-neutral-800/80'
                    }`}
                  >
                    <div>
                      {/* Top Header: Icon, Title & Price */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                            <DynamicIcon
                              icon={item.icon}
                              alt={item.title}
                              imgClassName="w-7 h-7 object-contain rounded"
                              className="text-2xl"
                              fallback="⚡"
                            />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold mt-0.5">
                              <span>{CURRENCY_ICONS.SPARKS}</span>
                              <span>{formatCompactNumber(item.sparkCost)} Sparks</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          disabled={!canAfford || isLocked}
                          onClick={() => {
                            const res = exchangeDreamSparks(item.id);
                            setFeedback(res.message);
                            setTimeout(() => setFeedback(null), 3000);
                          }}
                          className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                            isLocked
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : canAfford
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/30'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 cursor-pointer'
                          }`}
                        >
                          {isLocked ? 'Locked' : canAfford ? 'Exchange' : 'Need Sparks'}
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Vitals & Restorations Badges */}
                    <div className="mt-3 pt-3 border-t border-neutral-850 flex flex-wrap items-center gap-1.5">
                      {Boolean(item.givesEnergy) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                          <span>⚡</span> +{item.givesEnergy} Energy
                        </span>
                      )}
                      {Boolean(item.givesFood) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-300 flex items-center gap-1">
                          <span>🍞</span> +{item.givesFood} Satiety
                        </span>
                      )}
                      {Boolean(item.givesNerve) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                          <span>🧪</span> +{item.givesNerve} Nerve
                        </span>
                      )}
                      {Boolean(item.givesHappy) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 flex items-center gap-1">
                          <span>😊</span> +{item.givesHappy} Happy
                        </span>
                      )}
                      {Boolean(item.givesLife) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                          <span>❤️</span> +{item.givesLife} Life
                        </span>
                      )}
                      {Boolean(item.givesGreen) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                          <span>{CURRENCY_ICONS.GREEN}</span> +{item.givesGreen} GREEN
                        </span>
                      )}

                      {/* Prerequisite Indicator */}
                      {isLocked && item.requiredCardId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          Req: {item.requiredCardId} Lvl {item.requiredCardLevel || 1}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. TREE EVOLUTION                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'PLANTS' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <span>🌳</span> Chlorophyll Tree Evolution Stages
          </h2>
          <p className="text-xs text-neutral-400">
            Evolve your central plant organism to dramatically multiply the spark minting efficiency per tap.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {plantStages.map((stage) => {
              const isEquipped = activePlant === stage.id;
              const isUnlocked = unlockedPlants.includes(stage.id);
              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-xl border transition ${
                    isEquipped
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-lg'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                      {stage.icon}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-100 text-sm">{stage.name}</div>
                      <div className="text-xs text-emerald-400 font-mono font-bold">{stage.bonus}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {isEquipped ? (
                      <button
                        disabled
                        className="w-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-2 rounded-lg"
                      >
                        Active Stage
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => equipTapperSkin(stage.id)}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2 rounded-lg transition"
                      >
                        Equip Stage
                      </button>
                    ) : (
                      <button
                        onClick={() => unlockTapperSkin(stage.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition"
                      >
                        Unlock Stage
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. REFERRALS VIEW                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'REFERRALS' && (
        <ReferralView />
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DAILY REWARD 7-DAY MODAL (Exact Hamster Kombat Screenshot 2)        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showDailyRewardModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-neutral-900 to-black border border-neutral-700 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Daily reward
                </h3>
              </div>
              <button
                onClick={() => setShowDailyRewardModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Get sparks, keys and GREEN tokens for logging into Metropolis daily without skipping!
            </p>

            {/* Week Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((w) => (
                <button
                  key={w}
                  onClick={() => setDailyWeekTab(w)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    dailyWeekTab === w
                      ? 'bg-neutral-800 border border-cyan-400 text-cyan-300 shadow'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="text-sm font-black">{w}</div>
                  <div className="text-[10px]">week</div>
                </button>
              ))}
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {dailyStreakRewards.map((r, idx) => {
                const isCurrent = currentStreakDay === r.day;
                const isPassed = currentStreakDay > r.day;
                return (
                  <div
                    key={r.day}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center relative ${
                      isCurrent
                        ? 'bg-neutral-900 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                        : isPassed
                        ? 'bg-neutral-950/40 border-emerald-500/30 opacity-70'
                        : 'bg-neutral-950 border-neutral-800'
                    } ${idx === 6 ? 'col-span-2' : ''}`}
                  >
                    <div className="text-[10px] text-neutral-400 font-mono mb-1">{r.label}</div>
                    <span className="text-xl my-0.5">{r.icon}</span>
                    <div className="text-[10px] font-bold text-white line-clamp-1">{r.reward}</div>
                    {isPassed && (
                      <span className="absolute top-1 right-1 text-emerald-400 text-xs">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Big Action Claim Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  handleClaimDaily();
                  setShowDailyRewardModal(false);
                }}
                disabled={!canClaim}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-lg ${
                  canClaim
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/25 cursor-pointer'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                }`}
              >
                {canClaim ? `Claim Day ${currentStreakDay} Reward` : 'Come Back Tomorrow!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
