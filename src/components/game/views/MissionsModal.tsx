'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Mission, InventoryItem } from '../types';
import {
  Target,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Shield,
  Zap,
  Gift,
  X,
  ChevronRight,
  Flame,
  Calendar,
} from 'lucide-react';
import { SoundEngine } from '../gameAudio';
import { formatCompactNumber, CURRENCY_ICONS } from '../formatters';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MissionsModal({ isOpen, onClose }: MissionsModalProps) {
  const { player, claimMissionReward, completeExternalMission, spendMissionCredits, addLog } = useGame();
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'STORY' | 'PARTNER' | 'SHOP'>('DAILY');
  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const missions = player.missions || [];
  const claimedLedgerSet = new Set(player.claimedMissionIds || []);
  const isMsnClaimed = (m: Mission) => Boolean(m.claimed || claimedLedgerSet.has(m.id));
  const dailyMissions = missions.filter((m) => m.category === 'DAILY');
  const weeklyMissions = missions.filter((m) => m.category === 'WEEKLY');
  const monthlyMissions = missions.filter((m) => m.category === 'MONTHLY');
  const storyMissions = missions.filter((m) => m.category === 'STORY' || (!m.category && m.reqType !== 'WATCH_VIDEO' && m.reqType !== 'EXTERNAL_LINK'));
  const partnerMissions = missions.filter((m) => m.category === 'PARTNER' || m.reqType === 'WATCH_VIDEO' || m.reqType === 'EXTERNAL_LINK');

  // Unclaimed counts for badges
  const unclaimedDaily = dailyMissions.filter((m) => m.completed && !isMsnClaimed(m)).length;
  const unclaimedWeekly = weeklyMissions.filter((m) => m.completed && !isMsnClaimed(m)).length;
  const unclaimedMonthly = monthlyMissions.filter((m) => m.completed && !isMsnClaimed(m)).length;
  const unclaimedStory = storyMissions.filter((m) => m.completed && !isMsnClaimed(m)).length;
  const unclaimedPartner = partnerMissions.filter((m) => m.completed && !isMsnClaimed(m)).length;

  const displayedMissions =
    activeTab === 'DAILY'
      ? dailyMissions
      : activeTab === 'WEEKLY'
      ? weeklyMissions
      : activeTab === 'MONTHLY'
      ? monthlyMissions
      : activeTab === 'STORY'
      ? storyMissions
      : activeTab === 'PARTNER'
      ? partnerMissions
      : [];

  const missionShopItems: { item: InventoryItem; cost: number }[] = [
    {
      item: {
        id: 'item_stim',
        name: 'Military Adrenaline Auto-Injector',
        description: 'Syndicate stim: Instantly restores +50 Energy and +30 Happy.',
        category: 'FOOD',
        price: 0,
        marketValue: 12000,
        shopliftDifficulty: 90,
        energyRestore: 50,
        happyRestore: 30,
        icon: '💉',
        quantity: 1,
      },
      cost: 10,
    },
    {
      item: {
        id: 'item_masterkey',
        name: 'Syndicate Master Lockpick Matrix',
        description: 'Reduces residential burglary failure and jail risk by 40%.',
        category: 'TOOL',
        price: 0,
        marketValue: 18000,
        shopliftDifficulty: 95,
        perkDescription: '+40% Burglary success rate',
        icon: '🗝️',
        quantity: 1,
      },
      cost: 12,
    },
    {
      item: {
        id: 'item_traumakit_pro',
        name: 'Apex Field Surgery Kit',
        description: 'Advanced field suture: Restores 100 Life instantly outside hospital.',
        category: 'MEDICAL',
        price: 0,
        marketValue: 8500,
        shopliftDifficulty: 70,
        lifeRestore: 100,
        icon: '🩹',
        quantity: 1,
      },
      cost: 8,
    },
    {
      item: {
        id: 'item_heavy_armor',
        name: 'Titan Carbon-Ceramic Chest Plate',
        description: 'High-grade ballistic plate providing massive impact deflection.',
        category: 'ARMOR',
        price: 0,
        marketValue: 45000,
        shopliftDifficulty: 99,
        defense: 48.5,
        statBonus: { defense: 40 },
        icon: '🛡️',
        quantity: 1,
      },
      cost: 18,
    },
    {
      item: {
        id: 'item_silenced_smg',
        name: 'Sub-Zero Suppressed SMG',
        description: 'Tactical automatic firearm with whisper suppressor and laser sight.',
        category: 'WEAPON',
        price: 0,
        marketValue: 65000,
        shopliftDifficulty: 99,
        damage: 68.4,
        accuracy: 62.1,
        statBonus: { strength: 30, speed: 20 },
        icon: '⚡',
        quantity: 1,
      },
      cost: 22,
    },
  ];

  const handleBuyShopItem = (item: InventoryItem, cost: number) => {
    const res = spendMissionCredits(cost, item);
    setShopFeedback(res.message);
    setTimeout(() => setShopFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-emerald-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl sm:text-2xl shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  Missions & Contracts
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Complete daily, weekly & monthly operations to earn GREEN, Sparks & Mission Credits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mission Credits Badge */}
            <div className="hidden xs:flex flex-col items-end px-3 py-1.5 rounded-xl bg-neutral-950 border border-amber-500/30 font-mono">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Credits</span>
              <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {player.missionCredits || 0}
              </span>
            </div>

            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1.5 bg-neutral-950 border-b border-neutral-800 font-mono text-[10px] sm:text-xs shrink-0">
          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveTab('DAILY');
            }}
            className={`py-2 rounded-xl transition font-bold relative flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'DAILY'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>📅 Daily</span>
            {unclaimedDaily > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveTab('WEEKLY');
            }}
            className={`py-2 rounded-xl transition font-bold relative flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'WEEKLY'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>📆 Weekly</span>
            {unclaimedWeekly > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveTab('MONTHLY');
            }}
            className={`py-2 rounded-xl transition font-bold relative flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'MONTHLY'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🏆 Monthly</span>
            {unclaimedMonthly > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveTab('STORY');
            }}
            className={`py-2 rounded-xl transition font-bold relative flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'STORY'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>📜 Story</span>
            {unclaimedStory > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveTab('PARTNER');
            }}
            className={`py-2 rounded-xl transition font-bold relative flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'PARTNER'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>📺 Video & Ads</span>
            {unclaimedPartner > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => {
              SoundEngine.playTick(player.soundEnabled);
              setActiveTab('SHOP');
            }}
            className={`py-2 rounded-xl transition font-bold relative flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'SHOP'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-amber-400 hover:text-white'
            }`}
          >
            <span>🛍️ Shop</span>
          </button>
        </div>

        {/* Scrollable Missions Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
          {shopFeedback && (
            <div className="p-3 bg-neutral-900 border border-amber-500/40 rounded-xl text-amber-300 font-mono text-xs text-center font-bold animate-fadeIn">
              {shopFeedback}
            </div>
          )}

          {activeTab !== 'SHOP' ? (
            displayedMissions.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs font-mono space-y-2">
                <div className="text-3xl">✨</div>
                <div>All missions in this category are completed! Check back soon for new assignments.</div>
              </div>
            ) : (
              displayedMissions.map((mission) => {
                const isClaimed = isMsnClaimed(mission);
                const isCompleted = Boolean(mission.completed) && !isClaimed;
                const progressPct = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));

                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      isCompleted
                        ? 'bg-emerald-950/40 border-emerald-400/80 shadow-lg shadow-emerald-950/40'
                        : isClaimed
                        ? 'bg-neutral-950/60 border-neutral-800/60 opacity-60'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                          {mission.icon || '🎯'}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                              {mission.contractor}
                            </span>
                            {isCompleted && (
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                                READY TO CLAIM
                              </span>
                            )}
                            {isClaimed && (
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white mt-1">
                            {mission.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5 max-w-md">
                            {mission.description}
                          </p>
                        </div>
                      </div>

                      {/* Reward Badge Chips */}
                      <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[10px]">
                        {(mission.rewardGreen || 0) > 0 && (
                          <span className="text-emerald-400 font-bold">
                            +🌿 {mission.rewardGreen} GREEN
                          </span>
                        )}
                        {(mission.rewardSparks || 0) > 0 && (
                          <span className="text-cyan-300 font-bold">
                            +⚡ {formatCompactNumber(mission.rewardSparks)} Sparks
                          </span>
                        )}
                        {(mission.rewardCash || 0) > 0 && (
                          <span className="text-zinc-300 font-bold">
                            +${mission.rewardCash.toLocaleString()}
                          </span>
                        )}
                        {(mission.rewardCredits || 0) > 0 && (
                          <span className="text-amber-300 font-bold flex items-center gap-0.5">
                            <Award className="w-3 h-3 text-amber-400" />
                            +{mission.rewardCredits} Credits
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Claim Button */}
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                          <span>
                            Progress: <b className="text-neutral-200">{mission.currentCount}</b> / {mission.targetCount}
                          </span>
                          <span className="font-bold text-emerald-400">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 animate-pulse'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isCompleted ? (
                          <button
                            onClick={() => {
                              const res = claimMissionReward(mission.id);
                              setShopFeedback(res.message);
                              setTimeout(() => setShopFeedback(null), 3000);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-mono font-black text-xs shadow-lg shadow-emerald-500/30 transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer animate-bounce"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>CLAIM</span>
                          </button>
                        ) : isClaimed ? (
                          <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Claimed</span>
                          </span>
                        ) : (mission.reqType === 'WATCH_VIDEO' || mission.reqType === 'EXTERNAL_LINK') && mission.externalUrl ? (
                          <button
                            onClick={() => {
                              SoundEngine.playTick(player.soundEnabled);
                              if (mission.externalUrl) {
                                window.open(mission.externalUrl, '_blank');
                              }
                              completeExternalMission(mission.id);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono font-black text-xs shadow-lg transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
                          >
                            <span>{mission.buttonLabel || (mission.reqType === 'WATCH_VIDEO' ? '▶️ Watch Video' : '🔗 Open Link')}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* MISSION CREDITS REWARDS SHOP */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    Contractor Black-Market Armory
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Exclusive tactical items and enhancers redeemable exclusively with Mission Credits.
                  </p>
                </div>
                <div className="font-mono text-right shrink-0">
                  <span className="text-[9px] uppercase text-neutral-500 block">Your Balance</span>
                  <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    {player.missionCredits || 0} Credits
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {missionShopItems.map(({ item, cost }) => {
                  const canAfford = (player.missionCredits || 0) >= cost;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                          {item.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              {cost} Credits
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{item.name}</h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyShopItem(item, cost)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-950/40'
                            : 'bg-neutral-800 text-neutral-500 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{canAfford ? `Redeem for ${cost} Credits` : `Need ${cost - (player.missionCredits || 0)} More Credits`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
