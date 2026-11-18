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
} from 'lucide-react';
import ReferralView from './ReferralView';
import { SoundEngine } from '../gameAudio';
import { loadCatalogData, DynamicCatalogData, BotanicalCardDef } from '../gameCatalog';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export default function DreamTapView() {
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

  // 7-Day Rewards for Daily Login Streak
  const dailyStreakRewards = [
    { day: 1, label: 'Day 1', reward: '100K Cash', icon: '🪙', type: 'cash' },
    { day: 2, label: 'Day 2', reward: '1 Key', icon: '🔑', type: 'key' },
    { day: 3, label: 'Day 3', reward: '500K Cash', icon: '🪙', type: 'cash' },
    { day: 4, label: 'Day 4', reward: '2 Keys', icon: '🔑', type: 'key' },
    { day: 5, label: 'Day 5', reward: '1M Cash', icon: '🪙', type: 'cash' },
    { day: 6, label: 'Day 6', reward: '3 Keys', icon: '🔑', type: 'key' },
    { day: 7, label: 'Day 7', reward: 'Exclusive Skin', icon: '🌿', type: 'skin' },
  ];

  const currentStreakDay = player.dailyStreak || 1;
  const canClaim = player.canClaimDailyStreak ?? true;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3">
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
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative flex flex-col justify-between min-h-[580px]">
          {/* TOP STATS TRIO (Exact Hamster Kombat Pill Headers) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 text-center">
              <div className="text-[10px] text-neutral-400 font-mono uppercase">Earn per tap</div>
              <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-sm sm:text-base mt-0.5">
                <span>🪙</span>
                <span>{currentPlant.bonus}</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 text-center">
              <div className="text-[10px] text-cyan-400 font-mono uppercase">Coins to lvl up</div>
              <div className="flex items-center justify-center gap-1 text-cyan-300 font-black text-sm sm:text-base mt-0.5 font-mono">
                <span>{(5000 * (player.level || 1)).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 text-center">
              <div className="text-[10px] text-emerald-400 font-mono uppercase">Profit per sec</div>
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-black text-sm sm:text-base mt-0.5">
                <span>📈</span>
                <span>+{autoSparksPerSec}</span>
              </div>
            </div>
          </div>

          {/* MAIN BALANCE & LEVEL STATUS */}
          <div className="text-center my-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl animate-bounce">🪙</span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                {(player.dreamPoints || 0).toLocaleString()}
              </span>
            </div>

            {/* Level Bar */}
            <div className="max-w-md mx-auto mt-2 px-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span className="font-bold text-zinc-300">
                  🌿 {currentPlant.name}
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  Level {player.level || 1}/10
                </span>
              </div>
              <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.min(100, ((player.dreamPoints || 0) / (5000 * (player.level || 1))) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* QUICK ACTION ROW (Daily Reward, Daily Combo, Quick Awake) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg mx-auto w-full my-1">
            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setShowDailyRewardModal(true);
              }}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-2 text-center transition flex flex-col items-center justify-center gap-1 group"
            >
              <div className="relative">
                <span className="text-lg">🎁</span>
                {canClaim && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-bold text-neutral-200">Daily Reward</span>
              <span className="text-[9px] text-emerald-400 font-mono">
                {canClaim ? 'CLAIM NOW' : `Day ${currentStreakDay}`}
              </span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setActiveSubTab('CARDS_STORE');
              }}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-2 text-center transition flex flex-col items-center justify-center gap-1"
            >
              <span className="text-lg">🃏</span>
              <span className="text-[10px] font-bold text-neutral-200">Daily Combo</span>
              <span className="text-[9px] text-amber-400 font-mono">+5M Sparks</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setActiveSubTab('REFERRALS');
              }}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl p-2 text-center transition flex flex-col items-center justify-center gap-1"
            >
              <span className="text-lg">👥</span>
              <span className="text-[10px] font-bold text-neutral-200">Friends</span>
              <span className="text-[9px] text-cyan-400 font-mono">Royalty +50G</span>
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

          {/* CENTER: THE BIG CIRCULAR GLOWING ARENA (DIRECT PLAY) */}
          <div className="relative flex items-center justify-center my-3 select-none">
            {/* Ambient Multi-Ring Glow */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-cyan-500/30 blur-2xl absolute pointer-events-none animate-pulse" />

            <button
              onClick={handleTap}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              className={`relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 bg-gradient-to-b from-emerald-400 via-teal-600 to-emerald-950 shadow-2xl transition-all duration-100 flex items-center justify-center cursor-pointer outline-none ${
                isPressing ? 'scale-95 shadow-inner' : 'hover:scale-102 hover:shadow-emerald-500/30'
              }`}
            >
              {/* Inner Circle Disc */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-neutral-900 to-black border-4 border-emerald-400/40 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-7xl sm:text-8xl filter drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] transform transition-transform duration-100 select-none">
                  {currentPlant.icon}
                </span>

                <div className="absolute bottom-3 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
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

          {/* BOTTOM ARENA CONTROLS: Stamina Left | Boost Right */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 px-2 sm:px-4">
            <div className="flex items-center gap-2 text-xs font-mono">
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
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg transition"
            >
              <span>🚀</span>
              <span>Boost</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CARDS STORE (MINE - Exact Hamster Kombat Screenshot 3)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'CARDS_STORE' && (
        <div className="space-y-4">
          {/* Daily Combo 3 Mystery Cards Banner */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Daily combo</span>
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow">
                <span>🪙</span> +5,000,000 Sparks
              </div>
            </div>

            {/* 3 Mystery Slots */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((slot) => (
                <div
                  key={slot}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[90px] relative overflow-hidden"
                >
                  <span className="text-3xl text-amber-400/80 font-black">?</span>
                  <div className="text-[10px] text-neutral-400 mt-1">Secret Card</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Tabs (Dynamic from Catalog) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar pb-1 text-xs font-mono">
            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    lockMsg = `Requires ${reqCard?.title || card.requiredCardId} lvl ${reqLvl}`;
                  }
                }

                return (
                  <div
                    key={card.id}
                    className={`bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all relative ${
                      isLocked
                        ? 'border-neutral-800 opacity-60 bg-neutral-950/70'
                        : 'border-neutral-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                            {card.icon}
                          </span>
                          <div>
                            <div className="font-bold text-white text-xs sm:text-sm">{card.title}</div>
                            <div className="text-[10px] text-neutral-400">
                              Profit: <span className="text-emerald-400 font-bold">+{card.sparksPerSec}/s</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800">
                          lvl {currentLvl}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2">{card.flavor}</p>
                    </div>

                    {isLocked ? (
                      <div className="bg-amber-950/50 border border-amber-600/40 rounded-xl p-2 flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{lockMsg}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCardUpgrade(card.id)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition ${
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md'
                            : 'bg-neutral-950 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                        }`}
                      >
                        <span>Upgrade</span>
                        <span className="font-mono flex items-center gap-1">
                          <span>🪙</span> {nextCost.toLocaleString()}
                        </span>
                      </button>
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
      {activeSubTab === 'MARKET' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span>🛒</span> Botanical Dream Market & Custom Items
            </h2>
            <span className="text-xs text-neutral-500 font-mono">P2P Decentralized</span>
          </div>

          <p className="text-xs text-neutral-400">
            Exchange your minted Sparks for energy surges, GREEN tokens, and specialized botanical items.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-200 text-xs">🌿 Convert to GREEN Currency</div>
                <div className="text-[10px] text-zinc-400">500 Sparks &rarr; 🌿 25 GREEN Tokens</div>
              </div>
              <button
                onClick={() => {
                  const res = exchangeDreamSparks('exc_green_50');
                  setFeedback(res.message);
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                Exchange
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-200 text-xs">⚡ Energy Surge Battery</div>
                <div className="text-[10px] text-zinc-400">300 Sparks &rarr; +50 City Energy</div>
              </div>
              <button
                onClick={() => {
                  const res = exchangeDreamSparks('exc_energy_10');
                  setFeedback(res.message);
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                Exchange
              </button>
            </div>
          </div>
        </div>
      )}

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
