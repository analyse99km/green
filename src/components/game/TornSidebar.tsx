'use client';

import React from 'react';
import { useGame } from './GameContext';
import {
  Home,
  Package,
  MapPin,
  Briefcase,
  Dumbbell,
  Building,
  GraduationCap,
  Flame,
  Landmark,
  ShieldAlert,
  Heart,
  Dice5,
  Users,
  Scroll,
  Zap,
  Shield,
  Smile,
  Activity,
  Newspaper,
  Target,
  Utensils,
  Moon,
  Swords,
  Store,
  RotateCw,
} from 'lucide-react';

interface TornSidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export default function TornSidebar({ currentView, onSelectView }: TornSidebarProps) {
  const { player, wakeUp } = useGame();

  const totalBattleStats =
    player.battleStats.strength +
    player.battleStats.defense +
    player.battleStats.speed +
    player.battleStats.dexterity;

  const totalWorkingStats =
    player.workingStats.manualLabor +
    player.workingStats.intelligence +
    player.workingStats.endurance;

  const isLocalAdmin =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('admin=true'));

  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'ITEMS', label: '🎒 Items & Outfitter', icon: Package },
    { id: 'CASINO', label: 'Casino', icon: Dice5, highlight: true },
    { id: 'BAZAAR', label: 'Item Market & Bazaar', icon: Store },
    { id: 'DREAM_TAP', label: '⚡ Lucid Dream Tap', icon: Zap },
    { id: 'CRIMES', label: 'Crimes (2.0)', icon: Flame },
    { id: 'ATTACK', label: 'Attacks & Bounties', icon: Swords },
    { id: 'GYM', label: 'Iron Core Gym', icon: Dumbbell },
    { id: 'WHEEL', label: 'Daily Lucky Wheel', icon: RotateCw },
    { id: 'PROPERTIES', label: 'Properties & Kitchen', icon: Building },
    { id: 'CITY', label: 'City Map', icon: MapPin },
    { id: 'NEWSPAPER', label: 'The Chronicle (Press)', icon: Newspaper },
    { id: 'MISSIONS', label: 'Missions & Agency', icon: Target },
    { id: 'JOB', label: 'Job', icon: Briefcase },
    { id: 'EDUCATION', label: 'Education & Exams', icon: GraduationCap },
    { id: 'CITY_HALL', label: 'City Hall (Deeds)', icon: Scroll },
    { id: 'BANK', label: 'Bank & Vault', icon: Landmark },
    { id: 'JAIL', label: 'Jail', icon: ShieldAlert },
    { id: 'HOSPITAL', label: 'Hospital', icon: Heart },
    { id: 'FACTION', label: `Faction (${player.faction.name})`, icon: Users },
    { id: 'REFERRAL', label: '👥 Referrals & Rewards', icon: Users },
    ...(isLocalAdmin ? [{ id: 'ADMIN', label: '🛠️ Admin Console', icon: ShieldAlert, highlight: true }] : []),
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 bg-neutral-900 border-r border-neutral-800 flex-col shrink-0 text-neutral-200 text-xs font-sans">
      {/* Player Identity Header */}
      <div className="p-3.5 bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
            <span className="text-emerald-400">👤</span> {player.name}
          </span>
          <span className="font-mono text-[11px] text-neutral-400">[{player.xid}]</span>
        </div>

        <div className="mt-1 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Level {player.level}</span>
          <span className="font-bold text-emerald-400 font-mono">🌿 {(player.money || 0).toLocaleString()} GREEN</span>
        </div>
      </div>

      {/* Torn Authentic Vitals Panel */}
      <div className="p-3 bg-neutral-950/60 border-b border-neutral-800 space-y-2">
        {/* Energy */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-0.5">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Zap className="w-3 h-3 fill-emerald-500/20" /> Energy:
            </span>
            <span>
              {player.energy}/{player.maxEnergy} <span className="text-neutral-500 text-[10px]">07:20</span>
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded transition-all"
              style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
            />
          </div>
        </div>

        {/* Nerve */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-0.5">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Shield className="w-3 h-3 fill-amber-500/20" /> Nerve:
            </span>
            <span>
              {player.nerve}/{player.maxNerve} <span className="text-neutral-500 text-[10px]">02:20</span>
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded transition-all"
              style={{ width: `${(player.nerve / player.maxNerve) * 100}%` }}
            />
          </div>
        </div>

        {/* Happy */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-0.5">
            <span className="flex items-center gap-1 text-blue-400 font-semibold">
              <Smile className="w-3 h-3 fill-blue-500/20" /> Happy:
            </span>
            <span>
              {player.happy}/{player.maxHappy} <span className="text-neutral-500 text-[10px]">07:20</span>
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded transition-all"
              style={{ width: `${(player.happy / player.maxHappy) * 100}%` }}
            />
          </div>
        </div>

        {/* Life */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-0.5">
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <Activity className="w-3 h-3 fill-rose-500/20" /> Life:
            </span>
            <span className="text-emerald-400 font-bold">
              {player.life}/{player.maxLife} <span className="text-[10px]">FULL</span>
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded transition-all"
              style={{ width: `${(player.life / player.maxLife) * 100}%` }}
            />
          </div>
        </div>

        {/* Food / Nutrition Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-0.5">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Utensils className="w-3 h-3 text-amber-400" /> Food / Satiety:
            </span>
            <span className="text-amber-400 font-bold">
              {player.food ?? 70}/{player.maxFood ?? 100}
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded transition-all"
              style={{ width: `${((player.food ?? 70) / (player.maxFood ?? 100)) * 100}%` }}
            />
          </div>
        </div>

        {/* Sleeping Status Alert */}
        {player.isSleeping && (
          <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/50 text-[11px] font-mono space-y-1.5">
            <div className="flex items-center justify-between text-indigo-300 font-bold">
              <span className="flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> Asleep in Bed
              </span>
              <span>
                {Math.floor(player.sleepRemainingSeconds / 60)}m {player.sleepRemainingSeconds % 60}s
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 leading-tight">
              Regenerating vitals. Actions paused while asleep.
            </div>
            <button
              onClick={wakeUp}
              className="w-full py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all cursor-pointer"
            >
              Wake Up Early
            </button>
          </div>
        )}

        {/* Chain */}
        <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-neutral-400">
          <span>Chain: {player.chain}/{player.maxChain}</span>
          <span className="text-neutral-500">00:00</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-neutral-800 text-white font-bold border-l-3 border-emerald-500 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Battle Stats Summary */}
      <div className="p-3 bg-neutral-950/80 border-t border-neutral-800 font-mono text-[11px]">
        <div className="flex justify-between font-bold text-neutral-300 mb-1">
          <span>Battle Stats</span>
          <span className="text-emerald-400">{totalBattleStats}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-neutral-400">
          <div>Str: <span className="text-white font-bold">{player.battleStats.strength}</span></div>
          <div>Def: <span className="text-white font-bold">{player.battleStats.defense}</span></div>
          <div>Spd: <span className="text-white font-bold">{player.battleStats.speed}</span></div>
          <div>Dex: <span className="text-white font-bold">{player.battleStats.dexterity}</span></div>
        </div>

        {/* Working Stats */}
        <div className="flex justify-between font-bold text-neutral-300 mt-2.5 mb-1 pt-1.5 border-t border-neutral-800">
          <span>Working Stats</span>
          <span className="text-blue-400">{totalWorkingStats}</span>
        </div>
        <div className="text-[10px] text-neutral-400 space-y-0.5">
          <div className="flex justify-between">
            <span>Manual Labor:</span>
            <span className="text-white font-bold">{player.workingStats.manualLabor}</span>
          </div>
          <div className="flex justify-between">
            <span>Intelligence:</span>
            <span className="text-white font-bold">{player.workingStats.intelligence}</span>
          </div>
          <div className="flex justify-between">
            <span>Endurance:</span>
            <span className="text-white font-bold">{player.workingStats.endurance}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
