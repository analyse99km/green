'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GameProvider } from '@/components/game/GameContext';
import { TornCityContent } from '@/app/city/page';
import { LoginContent } from '@/app/login/page';
import { RefreshCw } from 'lucide-react';

function MetropolisLoadingScreen({ status = 'Verifying encrypted syndicate session...' }: { status?: string }) {
  const [progress, setProgress] = useState(15);
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    const steps = [
      { at: 35, text: 'Establishing encrypted quantum uplink...' },
      { at: 65, text: 'Authenticating Telegram syndicate identity...' },
      { at: 85, text: 'Synchronizing botanical district networks...' },
      { at: 98, text: 'Entering Neon Metropolis underworld...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        const next = Math.min(98, prev + Math.floor(Math.random() * 15) + 8);
        if (currentStep < steps.length && next >= steps[currentStep].at) {
          setCurrentStatus(steps[currentStep].text);
          currentStep++;
        }
        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#030705] flex flex-col items-center justify-center font-sans text-neutral-300 p-6 overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Glowing Core Orb */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" style={{ animationDuration: '0.9s' }} />
        <span className="text-4xl animate-bounce filter drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">🌿</span>
      </div>

      {/* Branding */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono font-black text-xl uppercase tracking-[0.25em] text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">
          NEON METROPOLIS
        </span>
      </div>
      <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-emerald-400/80 mb-6 font-bold">
        Underworld RPG Mesh
      </div>

      {/* Progress Bar Container */}
      <div className="w-full max-w-[280px] bg-neutral-900/80 border border-emerald-500/30 rounded-xl p-1 mb-3.5 shadow-2xl backdrop-blur-sm">
        <div
          className="h-2 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Terminal Readout */}
      <div className="text-[11px] font-mono text-emerald-300 tracking-wide min-h-[20px] text-center">
        &gt; {currentStatus}
      </div>

      <div className="mt-6 text-[9px] font-mono tracking-widest text-emerald-900 uppercase">
        ⚡ Cluster Protocol v2.2 | Multi-Node Mesh
      </div>
    </div>
  );
}

export default function GameRootPage() {
  // Instant entry: Default directly to true so player enters the game on frame 1 without blocking loading screens!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) return true;
    const localUser = localStorage.getItem('metropolis_auth_user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed?.email) return true;
      } catch {}
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('userEmail') || params.get('tgUser') || params.get('tgWebAppData')) return true;
    return true; // Default to instant game entry!
  });

  useEffect(() => {
    let isCancelled = false;

    // Background sync: downloads latest state, verifies Telegram identity, and synchronizes referrals without blocking UI
    async function attemptAuth() {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

      // 0. Instant Check: If already logged in locally, authenticate instantly (0ms)
      const localUserStr = typeof window !== 'undefined' ? localStorage.getItem('metropolis_auth_user') : null;
      let hasLocalSession = false;
      if (localUserStr) {
        try {
          const parsed = JSON.parse(localUserStr);
          if (parsed?.email) {
            hasLocalSession = true;
            if (!isCancelled) setIsAuthenticated(true);
            if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'METROPOLIS_SESSION_SAVE', user: parsed }, '*');
            }
          }
        } catch {}
      }

      // Check for forwarded shell session (if opened via evergreen gateway)
      if (!hasLocalSession && urlParams) {
        const paramEmail = urlParams.get('userEmail');
        const paramName = urlParams.get('userName');
        if (paramEmail) {
          const sessionObj = {
            email: paramEmail,
            name: paramName || 'Operative',
            isTelegram: Boolean(urlParams.get('isTelegram')),
          };
          localStorage.setItem('metropolis_auth_user', JSON.stringify(sessionObj));
          hasLocalSession = true;
          if (!isCancelled) setIsAuthenticated(true);
        }
      }

      // 1. Telegram Mini App Environment
      const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
        } catch {}
      }

      let tgUser = tg?.initDataUnsafe?.user;
      if (!tgUser && urlParams) {
        try {
          const rawTg = urlParams.get('tgUser');
          if (rawTg) tgUser = JSON.parse(decodeURIComponent(rawTg));
        } catch {}
      }

      if (tgUser && tgUser.id) {
        // In Telegram Mini App, user is ALWAYS authenticated — never kick to login form
        if (!hasLocalSession && !isCancelled) {
          setIsAuthenticated(true);
        }

        try {
          const refCode = tg?.initDataUnsafe?.start_param || urlParams?.get('ref') || '';

          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: tgUser, referralCode: refCode }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.email && !isCancelled) {
              const userObj = {
                email: data.email,
                name: data.username,
                userId: data.userId,
                userReferralCode: data.userReferralCode,
                telegramId: data.telegramId,
              };
              localStorage.setItem('metropolis_auth_user', JSON.stringify(userObj));

              if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'METROPOLIS_SESSION_SAVE', user: userObj }, '*');
              }

              if (data.playerState) {
                const stateStr = JSON.stringify(data.playerState);
                localStorage.setItem(`neon_metropolis_user_${data.email.trim().toLowerCase()}`, stateStr);
                localStorage.setItem('metropolis_player_save_v1', stateStr);
              }

              setIsAuthenticated(true);
              return;
            }
          }
        } catch (tgErr) {
          console.warn('Telegram SSO sync deferred, continuing with local session:', tgErr);
        }
        return;
      }

      // 2. If already authenticated via localUser, we are done
      if (hasLocalSession) return;

      // 3. Web browser session check (only for outside Telegram)
      try {
        const res = await fetch('/api/auth/email');
        const data = await res.json();
        if (data.authenticated && data.user && !isCancelled) {
          setIsAuthenticated(true);
        } else if (!isCancelled) {
          setIsAuthenticated(false);
        }
      } catch {
        if (!isCancelled) setIsAuthenticated(false);
      }
    }

    attemptAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<MetropolisLoadingScreen status="Loading authentication portal..." />}>
        <LoginContent onSuccess={() => setIsAuthenticated(true)} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<MetropolisLoadingScreen status="Entering Neon Metropolis underworld..." />}>
      <GameProvider>
        <TornCityContent />
      </GameProvider>
    </Suspense>
  );
}
