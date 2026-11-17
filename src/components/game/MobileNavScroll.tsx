'use client';

import React from 'react';
import { useGame } from './GameContext';
import {
  Home,
  Store,
  Swords,
  Flame,
  Dumbbell,
  Building,
  RotateCw,
  Zap,
  MapPin,
  Briefcase,
  GraduationCap,
  Landmark,
  Dice5,
  Heart,
  ShieldAlert,
  Newspaper,
  Target,
  Scroll,
  Users,
} from 'lucide-react';

interface MobileNavScrollProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export default function MobileNavScroll({ currentView, onSelectView }: MobileNavScrollProps) {
  const { player } = useGame();

  const navItems = [
    { id: 'DREAM_TAP', label: '⚡ Dream Tap', icon: Zap, special: true },
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'ITEMS', label: '🎒 Items & Gear', icon: Store, highlight: true },
    { id: 'CRIMES', label: 'Crimes (2.0)', icon: Flame },
    { id: 'BAZAAR', label: 'Item Market & Bazaar', icon: Store },
    { id: 'ATTACK', label: 'Attacks & Bounties', icon: Swords },
    { id: 'GYM', label: 'Iron Core Gym', icon: Dumbbell },
    { id: 'WHEEL', label: 'Daily Wheel', icon: RotateCw },
    { id: 'PROPERTIES', label: 'Properties & Food', icon: Building },
    { id: 'CITY', label: 'City Map', icon: MapPin },
    { id: 'MISSIONS', label: 'Missions', icon: Target },
    { id: 'JOB', label: 'Job', icon: Briefcase },
    { id: 'EDUCATION', label: 'Academy', icon: GraduationCap },
    { id: 'BANK', label: 'Reserve Bank', icon: Landmark },
    { id: 'CASINO', label: 'Casino', icon: Dice5 },
    { id: 'NEWSPAPER', label: 'The Chronicle', icon: Newspaper },
    { id: 'CITY_HALL', label: 'City Hall', icon: Scroll },
    { id: 'HOSPITAL', label: 'Hospital', icon: Heart },
    { id: 'FACTION', label: `Faction (${player.faction.tag})`, icon: Users },
    { id: 'JAIL', label: 'Jail', icon: ShieldAlert },
    { id: 'REFERRAL', label: '👥 Referrals & Rewards', icon: Users },
  ];

  return (
    <div className="w-full bg-neutral-900/95 backdrop-blur border-b border-neutral-800 sticky top-0 z-30 shadow-md lg:hidden">
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 scrollbar-none no-scrollbar select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          if (item.special) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{item.label}</span>
                {(player.dreamPoints || 0) > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded-full font-bold">
                    {player.dreamPoints}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                  : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
