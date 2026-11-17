'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Lock,
  Unlock,
  Moon,
  Building,
  Shield,
  Sparkles,
  Utensils,
  Clock,
  Heart,
  Smile,
  Zap,
} from 'lucide-react';

interface TornPropertiesViewProps {
  onNavigate?: (view: string) => void;
}

export default function TornPropertiesView({ onNavigate }: TornPropertiesViewProps) {
  const {
    player,
    togglePropertyLock,
    startSleep,
    wakeUp,
    consumeItem,
    buyProperty,
  } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const currentProperty = player.properties.find((p) => p.id === player.currentPropertyId);

  const handleStartSleep = (mins: number) => {
    const res = startSleep(mins);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
    if (onNavigate) {
      setTimeout(() => onNavigate('DREAM_TAP'), 600);
    }
  };

  const handleWakeUp = () => {
    const res = wakeUp();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEatFood = (itemId: string) => {
    const res = consumeItem(itemId, 'HOME');
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const foodItemsInInventory = player.inventory.filter((i) => i.category === 'FOOD' && i.quantity > 0);

  return (
    <div className="space-y-6">
      {/* Property Sanctuary Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <h2 className="text-xl font-bold text-white">Your Residence — {currentProperty?.name}</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Your private sanctuary. Lock your deadbolt door before sleeping to prevent street muggers from robbing you.
              Sleeping safely protects your character while allowing you to enter the <strong>Lucid Dream World</strong> to tap for energy sparks and passive botanical rewards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => currentProperty && togglePropertyLock(currentProperty.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                currentProperty?.isLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              }`}
            >
              {currentProperty?.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{currentProperty?.isLocked ? 'DOOR LOCKED (SAFE)' : 'DOOR UNLOCKED'}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-indigo-500/50 text-indigo-300 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Sleeping Quarters Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bedroom Quarters & Lucid Dream Sleep</h3>
              <p className="text-xs text-neutral-400">
                Sleeping locks dangerous street actions and transitions your mind into the Lucid Dream World to harvest botanical energy.
              </p>
            </div>
          </div>

          {player.isSleeping && (
            <div className="px-3 py-1.5 rounded-xl bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>
                Asleep: {Math.floor(player.sleepRemainingSeconds / 60)}m {player.sleepRemainingSeconds % 60}s remaining
              </span>
            </div>
          )}
        </div>

        {player.isSleeping ? (
          <div className="p-4 bg-neutral-950 rounded-xl border border-indigo-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-neutral-300 font-sans">
              😴 You are resting behind locked doors. External hostile attacks are blocked!
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('DREAM_TAP')}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                  <span>Enter Lucid Dream Botanical Tap & Cards</span>
                </button>
              )}
              <button
                onClick={handleWakeUp}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs font-mono shadow transition-all cursor-pointer"
              >
                Wake Up Early
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleStartSleep(60)}
                className="p-3.5 rounded-xl bg-neutral-950 hover:bg-indigo-950/40 border border-neutral-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Clock className="w-3.5 h-3.5" /> 1-Hour Deep Sleep (60 Mins)
                  </span>
                  <span className="text-emerald-400">Enters Lucid Dream</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Full REM cycle. Safeguards your character from muggers and opens the Botanical Lucid Dream tap & card generator.
                </p>
              </button>

              <button
                onClick={() => handleStartSleep(15)}
                className="p-3.5 rounded-xl bg-neutral-950 hover:bg-indigo-950/40 border border-neutral-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Clock className="w-3.5 h-3.5" /> 15-Minute Power Rest
                  </span>
                  <span className="text-emerald-400">Enters Lucid Dream</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Short resting cycle. Locks doors and launches dream state to harvest energy stems in the Dream Market.
                </p>
              </button>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('DREAM_TAP')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-neutral-900 via-emerald-950 to-neutral-900 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 font-bold text-xs font-mono shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Launch Lucid Dream Botanical Generator & Market 🌱</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Home Kitchen & Dining Area */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Home Kitchen & Dining Room</h3>
              <p className="text-xs text-neutral-400">
                Consume food from your inventory to maintain Satiety. If Satiety drops to 0, you will collapse from starvation and be rushed to the Hospital!
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 px-3.5 py-1.5 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-400">
            Satiety: <strong className="text-amber-400">{player.food ?? 70}/{player.maxFood ?? 100}</strong>
          </div>
        </div>

        {foodItemsInInventory.length === 0 ? (
          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-500 text-center font-mono">
            Your pantry is empty. Purchase Cyber Ramen, Deli Subs, or Gourmet Harvest Food from the market or Dream Market!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {foodItemsInInventory.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="text-lg">{item.icon}</span> {item.name}
                    </span>
                    <span className="font-mono text-emerald-400">x{item.quantity}</span>
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-1">{item.description}</p>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono mt-2 text-neutral-400">
                    <span className="text-amber-400">+{item.foodRestore || 20} Food</span>
                    {item.energyRestore && <span className="text-emerald-400">+{item.energyRestore} Energy</span>}
                    {item.happyRestore && <span className="text-blue-400">+{item.happyRestore} Happy</span>}
                    {item.lifeRestore && <span className="text-rose-400">+{item.lifeRestore} HP</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleEatFood(item.id)}
                  className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow flex items-center justify-center gap-1"
                >
                  <Utensils className="w-3 h-3" />
                  <span>Eat at Dining Table</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real Estate Agency Market */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Metropolis Real Estate Agency (Property Deeds)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {player.properties.map((prop) => (
            <div
              key={prop.id}
              className={`p-5 rounded-2xl border transition-all ${
                prop.id === player.currentPropertyId
                  ? 'bg-neutral-900 border-emerald-500/50 shadow-emerald-950/20'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{prop.name}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">{prop.tier}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {prop.cost === 0 ? 'FREE' : `🌿 ${prop.cost.toLocaleString()} GREEN`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Security</span>
                  <span className="font-bold text-white">Lvl {prop.securityLevel}</span>
                </div>
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Happy Boost</span>
                  <span className="font-bold text-blue-400">+{prop.maxHappyBonus}</span>
                </div>
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Vault</span>
                  <span className="font-bold text-emerald-400">🌿 {(prop.vaultCapacity / 1000).toLocaleString()}k</span>
                </div>
              </div>

              {prop.owned ? (
                <div className="text-center py-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                  {prop.id === player.currentPropertyId ? '✓ Current Active Residence' : 'Owned'}
                </div>
              ) : (
                <button
                  onClick={() => buyProperty(prop.id)}
                  disabled={player.bankMoney < prop.cost}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    player.bankMoney >= prop.cost
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Purchase Deed (🌿 {prop.cost.toLocaleString()} GREEN)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
