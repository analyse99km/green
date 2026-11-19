'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GameProvider } from '@/components/game/GameContext';
import { TornCityContent } from '@/app/city/page';
import { LoginContent } from '@/app/login/page';
import { RefreshCw } from 'lucide-react';
import {
  isTelegramEnv,
  getTelegramWebApp,
  parseTelegramInitData,
  tgCloudGet,
  tgCloudSet,
  getCompactCloudSave,
} from '@/lib/telegramStorage';

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
        ⚡ Cluster Protocol v2.3 | Multi-Node Mesh
      </div>
    </div>
  );
}

export default function GameRootPage() {
  // Instant entry: In Telegram or with local state, default directly to true so player never sees a login form!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (isTelegramEnv()) return true; // Telegram players are ALWAYS authenticated!
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
      const isTg = isTelegramEnv();
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

      // Expand Telegram WebApp if present
      const tg = getTelegramWebApp();
      if (tg) {
        try {
          tg.ready();
          tg.expand();
        } catch {}
      }

      // 0. Check Local Storage First
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

      // 1. Cross-Domain Tunnel Recovery via Telegram CloudStorage
      if (!hasLocalSession && isTg) {
        try {
          const cloudAuthRaw = await tgCloudGet('metropolis_auth_user');
          if (cloudAuthRaw) {
            const cloudUser = JSON.parse(cloudAuthRaw);
            if (cloudUser?.email) {
              localStorage.setItem('metropolis_auth_user', cloudAuthRaw);
              hasLocalSession = true;
              if (!isCancelled) setIsAuthenticated(true);
            }
          }
        } catch (e) {
          console.warn('Telegram CloudStorage retrieval notice:', e);
        }
      }

      // 2. Check for forwarded shell session (if opened via evergreen gateway)
      if (!hasLocalSession && urlParams) {
        const paramEmail = urlParams.get('userEmail');
        const paramName = urlParams.get('userName');
        if (paramEmail) {
          const sessionObj = {
            email: paramEmail,
            name: paramName || 'Operative',
            isTelegram: Boolean(urlParams.get('isTelegram') || isTg),
          };
          localStorage.setItem('metropolis_auth_user', JSON.stringify(sessionObj));
          hasLocalSession = true;
          if (!isCancelled) setIsAuthenticated(true);
        }
      }

      // 3. Telegram Mini App SSO & Synchronizer
      const { user: tgUser, start_param: refCode } = parseTelegramInitData();

      if (tgUser && tgUser.id) {
        // In Telegram Mini App, user is ALWAYS authenticated — NEVER kick to login form
        if (!isCancelled) setIsAuthenticated(true);

        try {
          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: tgUser, referralCode: refCode }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.email && !isCancelled) {
              // Preserve locally redeemed referredBy so server SSO never wipes active sponsor
              let existingLocalReferredBy: string | null = null;
              try {
                const prevAuth = localStorage.getItem('metropolis_auth_user');
                if (prevAuth) existingLocalReferredBy = JSON.parse(prevAuth).referredBy || null;
                if (!existingLocalReferredBy) {
                  const prevSave = localStorage.getItem('metropolis_player_save_v1');
                  if (prevSave) existingLocalReferredBy = JSON.parse(prevSave).referrals?.referredBy || null;
                }
              } catch {}

              const finalReferredBy = data.referredBy || existingLocalReferredBy || null;

              const userObj = {
                email: data.email,
                name: data.username,
                userId: data.userId,
                userReferralCode: data.userReferralCode,
                telegramId: data.telegramId,
                referredBy: finalReferredBy,
              };

              // Persist to local storage
              localStorage.setItem('metropolis_auth_user', JSON.stringify(userObj));

              // Persist to cross-domain Telegram CloudStorage (100% immune to tunnel rotations)
              tgCloudSet('metropolis_auth_user', JSON.stringify(userObj)).catch(() => {});

              if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'METROPOLIS_SESSION_SAVE', user: userObj }, '*');
              }

              if (data.playerState) {
                if (finalReferredBy) {
                  if (!data.playerState.referrals) data.playerState.referrals = {};
                  data.playerState.referrals.referredBy = finalReferredBy;
                  data.playerState.referrals.hasClaimedWelcomeBonus = true;
                }
                const stateStr = JSON.stringify(data.playerState);
                localStorage.setItem(`neon_metropolis_user_${data.email.trim().toLowerCase()}`, stateStr);
                localStorage.setItem('metropolis_player_save_v1', stateStr);

                // Backup compact player save to Telegram CloudStorage
                tgCloudSet('metropolis_player_save_v1', getCompactCloudSave(data.playerState)).catch(() => {});
              }

              setIsAuthenticated(true);
              return;
            }
          }
        } catch (tgErr) {
          console.warn('Telegram SSO sync deferred, continuing with active session:', tgErr);
        }
        return;
      }

      // If user is inside Telegram but tgUser is not yet available, NEVER kick them to login form!
      if (isTg) {
        if (!hasLocalSession) {
          const autoOperative = {
            email: `tg_operative_${Math.floor(Math.random() * 899999 + 100000)}@telegram.neon`,
            name: 'Operative',
            isTelegram: true,
          };
          localStorage.setItem('metropolis_auth_user', JSON.stringify(autoOperative));
        }
        if (!isCancelled) setIsAuthenticated(true);
        return;
      }

      // 4. Outside Telegram (Regular Web Browser)
      if (hasLocalSession) {
        if (!isCancelled) setIsAuthenticated(true);
        return;
      }

      try {
        const res = await fetch('/api/auth/email');
        const data = await res.json();
        if (data.authenticated && data.user && !isCancelled) {
          setIsAuthenticated(true);
        } else if (!isCancelled) {
          // If in web browser with no saved session, allow login page
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
