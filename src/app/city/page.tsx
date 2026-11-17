'use client';

import React, { useState, Suspense } from 'react';
import { GameProvider, useGame } from '@/components/game/GameContext';
import TornHeader from '@/components/game/TornHeader';
import TornSidebar from '@/components/game/TornSidebar';
import TornHomeView from '@/components/game/views/TornHomeView';
import TornItemsView from '@/components/game/views/TornItemsView';
import TornCityMapView from '@/components/game/views/TornCityMapView';
import TornJobView from '@/components/game/views/TornJobView';
import TornGymView from '@/components/game/views/TornGymView';
import TornEducationView from '@/components/game/views/TornEducationView';
import TornCrimesView from '@/components/game/views/TornCrimesView';
import TornCityHallView from '@/components/game/views/TornCityHallView';
import TornBankView from '@/components/game/views/TornBankView';
import TornCasinoView from '@/components/game/views/TornCasinoView';
import TornPropertiesView from '@/components/game/views/TornPropertiesView';
import TornHospitalView from '@/components/game/views/TornHospitalView';
import TornFactionView from '@/components/game/views/TornFactionView';
import TornNewspaperView from '@/components/game/views/TornNewspaperView';
import TornMissionsView from '@/components/game/views/TornMissionsView';
import BazaarView from '@/components/game/views/BazaarView';
import AttackView from '@/components/game/views/AttackView';
import LuckyWheelView from '@/components/game/views/LuckyWheelView';
import DreamTapView from '@/components/game/views/DreamTapView';
import ReferralView from '@/components/game/views/ReferralView';
import MobileNavScroll from '@/components/game/MobileNavScroll';
import MobileSidebarDrawer from '@/components/game/MobileSidebarDrawer';
import MobileBottomDock from '@/components/game/MobileBottomDock';
import TopVitalsBar from '@/components/game/TopVitalsBar';
import CityPhone from '@/components/game/CityPhone';
import JailModal from '@/components/game/JailModal';
import ActivityLog from '@/components/game/ActivityLog';
import PreReleaseNoticeModal from '@/components/game/PreReleaseNoticeModal';
import InsufficientFundsModal from '@/components/game/InsufficientFundsModal';

export function TornCityContent() {
  const { player, insufficientFundsModal, closeInsufficientFunds } = useGame();
  const [currentView, setCurrentView] = useState('HOME');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      {/* Top Status & Save Bar with Hamburger Menu button */}
      <TornHeader onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />

      {/* Top Vitals Status Ribbon (Energy, Nerve, Happy, Life, Food, Level, GREEN Coins & Daily Clipper) */}
      <TopVitalsBar
        onOpenDreamTap={() => setCurrentView('DREAM_TAP')}
        onOpenForge={() => setCurrentView('ITEMS')}
      />

      {/* Mobile-First Side Scrolling Navigation Ribbon */}
      <MobileNavScroll currentView={currentView} onSelectView={setCurrentView} />

      {/* Main Grid: Left Desktop Sidebar + Main Stage */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto border-x border-neutral-900 min-h-[calc(100vh-50px)]">
        {/* Left Desktop Side Panel (Hidden on mobile so it doesn't push main content 1500px down!) */}
        <TornSidebar currentView={currentView} onSelectView={setCurrentView} />

        {/* Center Main Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-neutral-950 overflow-y-auto">
          {currentView === 'HOME' && <TornHomeView />}
          {currentView === 'DREAM_TAP' && <DreamTapView />}
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
          {currentView === 'FACTION' && <TornFactionView />}
          {currentView === 'JAIL' && (
            <div className="p-8 text-center bg-neutral-900 rounded-2xl border border-neutral-800">
              <h2 className="text-xl font-bold text-white mb-2">Metropolis Correctional Facility & Holding Cells</h2>
              <p className="text-xs text-neutral-400">
                Detention block for failed heists and apprehended street criminals.
              </p>
              {player.jailTimeRemainingSeconds > 0 ? (
                <div className="mt-4 text-rose-400 font-bold font-mono">
                  Serving Sentence: {player.jailTimeRemainingSeconds} seconds remaining.
                </div>
              ) : (
                <div className="mt-4 text-emerald-400 font-mono text-xs">
                  ✓ You currently have no outstanding jail sentences. Keep it that way!
                </div>
              )}
            </div>
          )}

          {/* Activity Log at Bottom of views */}
          <div className="mt-8 pt-6 border-t border-neutral-900">
            <ActivityLog />
          </div>
        </main>
      </div>

      {/* Floating Smartphone */}
      <CityPhone />

      {/* Pre-Release Alpha & Testnet Pioneer Airdrop Modal */}
      <PreReleaseNoticeModal />

      {/* Global Insufficient Funds / Resources Popup */}
      <InsufficientFundsModal
        data={insufficientFundsModal}
        onClose={closeInsufficientFunds}
        onNavigate={setCurrentView}
      />

      {/* Jail Modal (Triggered automatically when arrested) */}
      <JailModal />

      {/* Mobile Slide-Out Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      {/* Mobile Sticky Bottom Dock (Home, Crimes, Tap Refill, Bazaar, All Tabs Menu) */}
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
