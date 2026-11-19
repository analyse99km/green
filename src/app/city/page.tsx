'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GameProvider, useGame } from '@/components/game/GameContext';
import TornHeader from '@/components/game/TornHeader';
import TornSidebar from '@/components/game/TornSidebar';
import TornHomeView from '@/components/game/views/TornHomeView';
import TornItemsView from '@/components/game/views/TornItemsView';
import TornCityMapView from '@/components/game/views/TornCityMapView';
import TornNewspaperView from '@/components/game/views/TornNewspaperView';
import TornMissionsView from '@/components/game/views/TornMissionsView';
import TornJobView from '@/components/game/views/TornJobView';
import TornGymView from '@/components/game/views/TornGymView';
import TornPropertiesView from '@/components/game/views/TornPropertiesView';
import TornEducationView from '@/components/game/views/TornEducationView';
import TornCrimesView from '@/components/game/views/TornCrimesView';
import TornCityHallView from '@/components/game/views/TornCityHallView';
import TornBankView from '@/components/game/views/TornBankView';
import TornHospitalView from '@/components/game/views/TornHospitalView';
import TornCasinoView from '@/components/game/views/TornCasinoView';
import BazaarView from '@/components/game/views/BazaarView';
import AttackView from '@/components/game/views/AttackView';
import LuckyWheelView from '@/components/game/views/LuckyWheelView';
import DreamTapView from '@/components/game/views/DreamTapView';
import ReferralView from '@/components/game/views/ReferralView';
import { AdminDashboardView } from '@/components/game/views/AdminDashboardView';
import MobileBottomDock from '@/components/game/MobileBottomDock';
import MobileSidebarDrawer from '@/components/game/MobileSidebarDrawer';
import MobileNavScroll from '@/components/game/MobileNavScroll';
import TopVitalsBar from '@/components/game/TopVitalsBar';
import CityPhone from '@/components/game/CityPhone';
import JailModal from '@/components/game/JailModal';
import OperativeIdModal from '@/components/game/OperativeIdModal';

export function TornCityContent() {
  const { player } = useGame();
  // 1. Default first page is Lucid Dream tapping page with clean focused UI!
  const [currentView, setCurrentView] = useState('DREAM_TAP');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  // Auto-prompt Operative ID registration for brand new users without custom ID
  useEffect(() => {
    const currentName = player.name || '';
    const isGenericDefault = !player.hasCustomId && (
      !currentName ||
      currentName === 'Operative' ||
      currentName.startsWith('Operative #') ||
      currentName.startsWith('tg_operative_')
    );
    if (isGenericDefault) {
      setIsIdModalOpen(true);
    }
  }, [player.hasCustomId, player.name]);

  // Vitals thresholds check
  const isFoodLow = (player.food ?? 100) <= 20;
  const isEnergyLow = (player.energy ?? 100) <= 10;
  const isNerveLow = (player.nerve ?? 100) <= 5;
  const isLifeLow = (player.life ?? 100) <= 25;
  const hasCriticalVital = isFoodLow || isEnergyLow || isNerveLow || isLifeLow;

  const isTappingMode = currentView === 'DREAM_TAP';

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CITY HEADERS & SIDEBARS: Hidden on DREAM_TAP for pure, clean tap view */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {!isTappingMode && (
        <>
          <TornHeader
            onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
            onOpenPhone={() => setIsPhoneOpen(true)}
          />

          <TopVitalsBar
            onOpenDreamTap={() => setCurrentView('DREAM_TAP')}
            onOpenForge={() => setCurrentView('ITEMS')}
            onOpenEditId={() => setIsIdModalOpen(true)}
          />

          <MobileNavScroll currentView={currentView} onSelectView={setCurrentView} />
        </>
      )}

      {/* Main Grid: Left Desktop Sidebar + Main Stage */}
      <div className={`flex-1 flex flex-col lg:flex-row w-full ${isTappingMode ? 'max-w-4xl' : 'max-w-7xl'} mx-auto ${!isTappingMode ? 'border-x border-neutral-900' : ''} min-h-[calc(100vh-50px)]`}>
        {!isTappingMode && (
          <TornSidebar
            currentView={currentView}
            onSelectView={setCurrentView}
            onOpenPhone={() => setIsPhoneOpen(true)}
          />
        )}

        <main className={`flex-1 p-3 sm:p-5 lg:p-8 pb-36 sm:pb-32 lg:pb-12 bg-neutral-950 overflow-y-auto`}>
          {/* Direct Warning in City when stats (Food, Energy, etc.) are below expected - with direct navigation to Dream Tap! */}
          {!isTappingMode && hasCriticalVital && (
            <div className="mb-4 p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/90 border border-amber-500/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl animate-pulse">
              <div className="flex items-center gap-3 text-left">
                <span className="text-2xl sm:text-3xl">⚠️</span>
                <div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-amber-300 uppercase tracking-wide">
                    Operative Vitals Low &mdash; City Operations Restricted
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-0.5">
                    {isFoodLow && `🍞 Food Satiety depleted (${player.food ?? 0}/100). `}
                    {isEnergyLow && `⚡ Energy is low (${player.energy ?? 0}/100). `}
                    {isNerveLow && `🛡️ Nerve is low (${player.nerve ?? 0}/100). `}
                    {isLifeLow && `💖 Health is low (${player.life ?? 0}/100). `}
                    Actions are locked. Refill instantly in Lucid Dream Tap with Sparks.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('DREAM_TAP')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 hover:from-amber-400 hover:to-emerald-300 text-neutral-950 font-black text-xs font-mono shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <span>⚡ Tap Lucid Dream to Refill & Unlock →</span>
              </button>
            </div>
          )}

          {/* VIEW SWITCHER */}
          {currentView === 'DREAM_TAP' && (
            <DreamTapView onNavigateToCity={() => setCurrentView('HOME')} />
          )}
          {currentView === 'HOME' && <TornHomeView onNavigate={setCurrentView} />}
          {currentView === 'REFERRAL' && <ReferralView />}
          {currentView === 'ITEMS' && <TornItemsView />}
          {currentView === 'BAZAAR' && <BazaarView />}
          {currentView === 'ATTACK' && <AttackView />}
          {currentView === 'WHEEL' && <LuckyWheelView />}
          {currentView === 'CITY' && <TornCityMapView onNavigate={setCurrentView} />}
          {currentView === 'NEWSPAPER' && <TornNewspaperView />}
          {currentView === 'MISSIONS' && <TornMissionsView />}
          {currentView === 'JOB' && <TornJobView />}
          {currentView === 'GYM' && <TornGymView />}
          {currentView === 'PROPERTIES' && <TornPropertiesView onNavigate={setCurrentView} />}
          {currentView === 'EDUCATION' && <TornEducationView />}
          {currentView === 'CRIMES' && <TornCrimesView />}
          {currentView === 'CITY_HALL' && <TornCityHallView />}
          {currentView === 'BANK' && <TornBankView />}
          {currentView === 'HOSPITAL' && <TornHospitalView />}
          {currentView === 'CASINO' && <TornCasinoView />}
          {currentView === 'ADMIN' && <AdminDashboardView />}
        </main>
      </div>

      {/* City Smartphone Overlay */}
      <CityPhone
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        onOpen={() => setIsPhoneOpen(true)}
      />

      {/* Jail Modal (Triggered automatically when arrested) */}
      <JailModal />

      {/* Operative Identity Setup & Edit Modal */}
      <OperativeIdModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        canDismiss={Boolean(player.hasCustomId)}
      />

      {/* Mobile Slide-Out Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenPhone={() => setIsPhoneOpen(true)}
      />

      {/* Mobile Sticky Bottom Dock (Home, Casino, Tap Refill, Bazaar, Menu) */}
      <MobileBottomDock
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenMenu={() => setIsMobileDrawerOpen(true)}
      />
    </div>
  );
}

export default function CityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-mono text-xs">
          Loading Neon Metropolis Underworld...
        </div>
      }
    >
      <GameProvider>
        <TornCityContent />
      </GameProvider>
    </Suspense>
  );
}
