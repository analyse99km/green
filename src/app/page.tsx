'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GameProvider } from '@/components/game/GameContext';
import { TornCityContent } from '@/app/city/page';
import { LoginContent } from '@/app/login/page';
import { RefreshCw } from 'lucide-react';

export default function GameRootPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check local session storage first for instant zero-latency loading
    const localUser = localStorage.getItem('metropolis_auth_user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed?.email) {
          setIsAuthenticated(true);
          return;
        }
      } catch {
        // Fallback to server check
      }
    }

    // 2. Verify with server session cookie
    async function checkServerSession() {
      try {
        const res = await fetch('/api/auth/email');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }

    checkServerSession();
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
