'use client';

import React from 'react';
import { useGame } from './GameContext';
import {
  X,
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
  Utensils,
  Moon,
  Activity,
  Smile,
  Shield,
  Package,
} from 'lucide-react';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSelectView: (view: string) => void;
}

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
  currentView,
  onSelectView,
}: MobileSidebarDrawerProps) {
  const { player, wakeUp } = useGame();

  if (!isOpen) return null;

  const handleSelect = (viewId: string) => {
    onSelectView(viewId);
    onClose();
  };

  const navSections = [
    {
      title: 'Action & Underworld',
      items: [
        { id: 'HOME', label: 'Home Dashboard', icon: Home },
        { id: 'ITEMS', label: '🎒 Backpack & Items', icon: Package, highlight: true },
        { id: 'BAZAAR', label: 'Item Market & Bazaar', icon: Store },
        { id: 'CASINO', label: '🎰 2D Velvet Casino', icon: Dice5, highlight: true },
        { id: 'DREAM_TAP', label: '⚡ Lucid Dream Tap', icon: Zap },
        { id: 'CRIMES', label: 'Crimes (2.0)', icon: Flame },
        { id: 'ATTACK', label: 'Attacks & Bounties', icon: Swords },
      ],
    },
    {
      title: 'Growth & Training',
      items: [
        { id: 'GYM', label: 'Iron Core Gym', icon: Dumbbell },
        { id: 'EDUCATION', label: 'Academy & Exams', icon: GraduationCap },
        { id: 'PROPERTIES', label: 'Properties & Kitchen', icon: Building },
        { id: 'MISSIONS', label: 'Agency Missions', icon: Target },
        { id: 'JOB', label: 'Career Job', icon: Briefcase },
      ],
    },
    {
      title: 'Finance & Entertainment',
      items: [
        { id: 'WHEEL', label: 'Daily Lucky Wheel', icon: RotateCw },
        { id: 'BANK', label: 'Reserve Bank & Vault', icon: Landmark },
        { id: 'NEWSPAPER', label: 'The Chronicle Press', icon: Newspaper },
        { id: 'CITY_HALL', label: 'City Hall Deeds', icon: Scroll },
      ],
    },
    {
      title: 'City Sectors & Syndicates',
      items: [
        { id: 'CITY', label: 'City District Map', icon: MapPin },
        { id: 'FACTION', label: `Faction (${player.faction.tag})`, icon: Users },
        { id: 'HOSPITAL', label: 'Apex Trauma Hospital', icon: Heart },
        { id: 'JAIL', label: 'Correctional Facility', icon: ShieldAlert },
        { id: 'REFERRAL', label: '👥 Referrals & Rewards', icon: Users, highlight: true },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Drawer from Left */}
      <div className="relative w-4/5 max-w-xs bg-neutral-950 border-r border-neutral-800 h-full flex flex-col shadow-2xl z-10 overflow-hidden text-neutral-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏙️</span>
            <div>
              <h2 className="font-bold text-sm text-white tracking-wide">NEON METROPOLIS</h2>
              <span className="text-[10px] font-mono text-emerald-400">Quick Tab Navigator</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Vitals Summary */}
        <div className="p-3 bg-neutral-900/30 border-b border-neutral-850 font-mono text-[11px] space-y-1.5">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex justify-between bg-neutral-900 px-2 py-1 rounded">
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Energy:
              </span>
              <span className="font-bold">{player.energy}/{player.maxEnergy}</span>
            </div>
            <div className="flex justify-between bg-neutral-900 px-2 py-1 rounded">
              <span className="text-amber-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Nerve:
              </span>
              <span className="font-bold">{player.nerve}/{player.maxNerve}</span>
            </div>
            <div className="flex justify-between bg-neutral-900 px-2 py-1 rounded">
              <span className="text-blue-400 flex items-center gap-1">
                <Smile className="w-2.5 h-2.5" /> Happy:
              </span>
              <span className="font-bold">{player.happy}/{player.maxHappy}</span>
            </div>
            <div className="flex justify-between bg-neutral-900 px-2 py-1 rounded">
              <span className="text-orange-400 flex items-center gap-1">
                <Utensils className="w-2.5 h-2.5" /> Food:
              </span>
              <span className="font-bold">{player.food ?? 75}/{player.maxFood ?? 100}</span>
            </div>
          </div>

          {player.isSleeping && (
            <div className="p-1.5 bg-indigo-950/80 border border-indigo-500/40 rounded flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-indigo-300">
                <Moon className="w-3 h-3 text-indigo-400" /> Sleeping ({Math.floor(player.sleepRemainingSeconds / 60)}m)
              </span>
              <button
                onClick={wakeUp}
                className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold"
              >
                Wake
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Nav Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 px-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow'
                          : item.highlight
                          ? 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 text-cyan-300 border border-cyan-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400 animate-pulse' : 'text-neutral-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'DREAM_TAP' && (player.dreamPoints || 0) > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded-full font-bold">
                          {player.dreamPoints}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/40 text-center font-mono text-[10px] text-neutral-500">
          Tap any tab to switch instantly without scrolling
        </div>
      </div>
    </div>
  );
}
