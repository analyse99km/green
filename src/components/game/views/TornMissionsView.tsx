'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Target,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Shield,
  Zap,
  Crosshair,
  Key,
  Heart,
} from 'lucide-react';
import { InventoryItem } from '../types';

export default function TornMissionsView() {
  const { player, spendMissionCredits, addLog } = useGame();
  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'SHOP'>('CONTRACTS');
  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

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

  const completedMissions = player.missions.filter((m) => m.completed);
  const activeMissions = player.missions.filter((m) => !m.completed);

  return (
    <div className="space-y-6">
      {/* Missions Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold text-white">Underworld Contracts & Mission Agency</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Accept contracts from Fixer Vance and Syndicate Boss Duke. Complete assignments to earn cold cash
              and spendable <span className="text-amber-400 font-bold">Mission Credits</span> for high-end black-market equipment.
            </p>
          </div>

          <div className="bg-neutral-950 px-5 py-3 rounded-xl border border-neutral-800 font-mono text-xs flex items-center gap-4">
            <div>
              <span className="text-neutral-500 block text-[10px]">Your Mission Credits</span>
              <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" /> {player.missionCredits} Credits
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-neutral-800/80 font-mono text-xs">
          <button
            onClick={() => setActiveTab('CONTRACTS')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'CONTRACTS'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60 border border-neutral-800'
            }`}
          >
            📋 Active Contracts ({activeMissions.length})
          </button>
          <button
            onClick={() => setActiveTab('SHOP')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SHOP'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60 border border-neutral-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Mission Rewards Shop
          </button>
        </div>
      </div>

      {shopFeedback && (
        <div className="p-3 bg-neutral-900 border border-amber-500/40 rounded-xl text-amber-300 font-mono text-xs text-center font-bold">
          {shopFeedback}
        </div>
      )}

      {/* TAB CONTENT: Contracts */}
      {activeTab === 'CONTRACTS' && (
        <div className="space-y-6">
          {/* Active Missions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
              In-Progress Contracts
            </h3>

            {activeMissions.length === 0 ? (
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center text-xs text-neutral-400">
                ✓ All active contracts completed! Check back tomorrow for new agency contracts.
              </div>
            ) : (
              activeMissions.map((mission) => {
                const progressPct = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));
                return (
                  <div
                    key={mission.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 hover:border-neutral-700 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 font-mono uppercase bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                            Contractor: {mission.contractor}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{mission.title}</h4>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          +{mission.rewardCredits} Credits
                        </span>
                        <span className="text-emerald-400 font-bold">
                          +${mission.rewardCash.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">{mission.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>
                          Progress: {mission.currentCount} / {mission.targetCount}
                        </span>
                        <span className="text-emerald-400 font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Completed Missions History */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Completed Contracts Archive ({completedMissions.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completedMissions.map((m) => (
                <div
                  key={m.id}
                  className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-neutral-200 line-through opacity-70">{m.title}</h5>
                      <span className="text-[10px] text-neutral-500 font-mono">Contractor: {m.contractor}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400/80 font-bold">
                    +{m.rewardCredits} Credits Claimed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Mission Credits Shop */}
      {activeTab === 'SHOP' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">Agency Black Market Armory</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Exclusive tactical gear, enhancers, and stims redeemable only with contractor Mission Credits.
                </p>
              </div>

              <div className="font-mono text-xs text-amber-400 font-bold bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                Balance: {player.missionCredits} Credits
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missionShopItems.map(({ item, cost }) => {
              const canAfford = player.missionCredits >= cost;
              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-bold font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-md">
                        {cost} Credits
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="text-[10px] font-mono text-neutral-500 pt-1">
                      Category: <span className="text-neutral-300">{item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyShopItem(item, cost)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow'
                        : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? `Purchase for ${cost} Credits` : `Need ${cost - player.missionCredits} More Credits`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
