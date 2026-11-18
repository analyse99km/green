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
import { AdminDashboardView } from '@/components/game/views/AdminDashboardView';
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
  // Default first page is Lucid Dream tapping page as required!
  const [currentView, setCurrentView] = useState('DREAM_TAP');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);

  // Awakening check: all 6 vitals must be above 0
  const isAwakened = Boolean(
    (player.money || 0) > 0 &&
    (player.energy || 0) > 0 &&
    (player.nerve || 0) > 0 &&
    (player.happy || 0) > 0 &&
    (player.life || 0) > 0 &&
    (player.food || 0) > 0
  );

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      {/* Top Status & Save Bar with Hamburger Menu button */}
      <TornHeader
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenPhone={() => setIsPhoneOpen(true)}
      />

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
        <TornSidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenPhone={() => setIsPhoneOpen(true)}
        />

        {/* Center Main Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-neutral-950 overflow-y-auto">
          {!isAwakened && currentView !== 'DREAM_TAP' && currentView !== 'REFERRAL' && currentView !== 'ADMIN' ? (
            <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-neutral-900 via-indigo-950/40 to-neutral-900 border border-emerald-500/50 rounded-2xl text-center space-y-4 shadow-2xl animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🔒
              </div>
              <h2 className="text-xl font-bold text-white">Metropolis District Locked: Awakening Required</h2>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-xl mx-auto">
                Your operative vitals are at zero. Tap the <strong>Lucid Dream Nexus</strong> to earn sparks, then enter the <strong>Dream Market</strong> to make all 6 vitals above zero. Once awakened, the entire Metropolis will unlock!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono py-2 max-w-lg mx-auto">
                <div className={`p-2.5 rounded-xl border text-left ${player.money > 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                  <span className="block text-[10px] text-neutral-400">1. Currency</span>
                  🌿 GREEN: <strong>{player.money > 0 ? `+${player.money} ✓` : '0/10 Mint'}</strong>
                </div>
                <div className={`p-2.5 rounded-xl border text-left ${player.energy > 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                  <span className="block text-[10px] text-neutral-400">2. Stamina</span>
                  ⚡ Energy: <strong>{player.energy > 0 ? `${player.energy} ✓` : '0/10 Stem'}</strong>
                </div>
                <div className={`p-2.5 rounded-xl border text-left ${player.nerve > 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                  <span className="block text-[10px] text-neutral-400">3. Courage</span>
                  🛡️ Nerve: <strong>{player.nerve > 0 ? `${player.nerve} ✓` : '0/5 Nectar'}</strong>
                </div>
                <div className={`p-2.5 rounded-xl border text-left ${player.happy > 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                  <span className="block text-[10px] text-neutral-400">4. Morale</span>
                  😊 Happy: <strong>{player.happy > 0 ? `${player.happy} ✓` : '0/25 Flora'}</strong>
                </div>
                <div className={`p-2.5 rounded-xl border text-left ${player.life > 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                  <span className="block text-[10px] text-neutral-400">5. Health</span>
                  💖 Life: <strong>{player.life > 0 ? `${player.life} ✓` : '0/50 Sap'}</strong>
                </div>
                <div className={`p-2.5 rounded-xl border text-left ${player.food > 0 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                  <span className="block text-[10px] text-neutral-400">6. Nutrition</span>
                  🍞 Satiety: <strong>{player.food > 0 ? `${player.food} ✓` : '0/35 Bread'}</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('DREAM_TAP')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-xs font-mono shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  Enter Lucid Dream & Awaken Vitals →
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'HOME' && <TornHomeView onNavigate={setCurrentView} />}
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
              {currentView === 'ADMIN' && <AdminDashboardView />}
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
            </>
          )}

          {/* Activity Log at Bottom of views */}
          <div className="mt-8 pt-6 border-t border-neutral-900">
            <ActivityLog />
          </div>
        </main>
      </div>

      {/* City Smartphone Centered Modal (Controlled cleanly via isOpen/onClose with ZERO screen overlap) */}
      <CityPhone isOpen={isPhoneOpen} onClose={() => setIsPhoneOpen(false)} />

      {/* Pre-Release Pioneer Edition Airdrop Modal */}
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
        onOpenPhone={() => setIsPhoneOpen(true)}
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
