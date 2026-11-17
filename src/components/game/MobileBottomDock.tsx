'use client';

import React from 'react';
import { useGame } from './GameContext';
import { Home, Flame, Zap, Store, Menu, Dice5 } from 'lucide-react';

interface MobileBottomDockProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenMenu: () => void;
}

export default function MobileBottomDock({
  currentView,
  onSelectView,
  onOpenMenu,
}: MobileBottomDockProps) {
  const { player } = useGame();

  const primaryTabs = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'CASINO', label: 'Casino', icon: Dice5, isDice: true },
    { id: 'DREAM_TAP', label: 'Tap Refill', icon: Zap, isSpecial: true },
    { id: 'BAZAAR', label: 'Bazaar', icon: Store },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 lg:hidden shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center py-1.5 px-2">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id)}
                className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 ring-2 ring-cyan-300'
                      : 'bg-gradient-to-tr from-cyan-600 to-indigo-700 hover:ring-2 hover:ring-cyan-400'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 mt-0.5">
                  Tap Refill
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-mono tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* 5th Button: Open Slide-Out Drawer Sidebar */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-mono font-bold tracking-tight">All Tabs ☰</span>
        </button>
      </div>
    </div>
  );
}
