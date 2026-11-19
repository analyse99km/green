'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GameProvider } from '@/components/game/GameContext';
import { TornCityContent } from '@/app/city/page';
import { LoginContent } from '@/app/login/page';
import { RefreshCw } from 'lucide-react';

export default function GameRootPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function attemptAuth() {
      // 1. Check for Telegram Mini App SSO (Zero-click instant login & auto-sync)
      const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
        } catch {}
      }

      const tgUser = tg?.initDataUnsafe?.user;
      if (tgUser && tgUser.id) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = tg.initDataUnsafe?.start_param || urlParams.get('ref') || '';

          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: tgUser, referralCode: refCode }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.email && !isCancelled) {
              localStorage.setItem(
                'metropolis_auth_user',
                JSON.stringify({
                  email: data.email,
                  name: data.username,
                  userId: data.userId,
                  userReferralCode: data.userReferralCode,
                  telegramId: data.telegramId,
                })
              );

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
          console.warn('Telegram SSO auto-login error, falling back to local session:', tgErr);
        }
      }

      // 2. Check local session storage for instant zero-latency loading
      const localUser = localStorage.getItem('metropolis_auth_user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed?.email) {
            if (!isCancelled) setIsAuthenticated(true);
            return;
          }
        } catch {
          // Fallback to server check
        }
      }

      // 3. Verify with server session cookie
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

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-sans text-neutral-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl animate-pulse">🌿</span>
          <span className="font-mono font-bold text-xs uppercase tracking-widest text-emerald-400">
            NEON METROPOLIS
          </span>
        </div>
        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
        <span className="text-[11px] font-mono text-neutral-500 mt-3">
          Verifying encrypted syndicate session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-500">
            Loading authentication portal...
          </div>
        }
      >
        <LoginContent onSuccess={() => setIsAuthenticated(true)} />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-500">
          Entering Neon Metropolis Underworld...
        </div>
      }
    >
      <GameProvider>
        <TornCityContent />
      </GameProvider>
    </Suspense>
  );
}
