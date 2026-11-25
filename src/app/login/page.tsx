'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Users,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { deriveUserSigningKey } from '@/components/game/gameCrypto';
import { isTelegramEnv, parseTelegramInitData, tgCloudSet } from '@/lib/telegramStorage';

interface OperativeSession {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export function LoginContent({ onSuccess }: { onSuccess?: () => void } = {}) {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<OperativeSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Email & Password + Confirmation + Optional Referral state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [operativeName, setOperativeName] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const errorParam = searchParams.get('error');

  useEffect(() => {
    document.title = 'Neon Metropolis Gateway | Operative Authentication';
    loadSession();
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setReferralInput(refFromUrl);
      setIsRegister(true);
    }
  }, [searchParams]);

  async function loadSession() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setSession({
          authenticated: true,
          user: {
            id: data.user.userId,
            name: data.user.name,
            email: data.user.email,
          },
        });
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/email', { method: 'DELETE' });
      localStorage.removeItem('metropolis_auth_user');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  const handleTelegramLogin = async () => {
    if (isTelegramEnv()) {
      const { user: tgUser, start_param: refCode } = parseTelegramInitData();
      if (tgUser && tgUser.id) {
        setAuthMsg({ text: `Authenticating Telegram Operative @${tgUser.username || tgUser.first_name}...`, isError: false });
        try {
          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: tgUser, referralCode: refCode }),
          });
          const data = await res.json();
          if (data.success && data.email) {
            const userObj = {
              email: data.email,
              name: data.username || tgUser.first_name || 'Operative',
              userId: data.userId,
              userReferralCode: data.userReferralCode,
              telegramId: data.telegramId,
              loginTime: Date.now(),
            };
            localStorage.setItem('metropolis_auth_user', JSON.stringify(userObj));
            tgCloudSet('metropolis_auth_user', JSON.stringify(userObj)).catch(() => {});
            if (onSuccess) onSuccess();
            else window.location.href = '/';
            return;
          }
        } catch {}
      }
    }

    const handle = prompt('Enter your Telegram @username or Syndicate Call-sign:');
    if (handle) {
      const cleanHandle = handle.replace('@', '').trim();
      if (!cleanHandle) return;
      const mockEmail = `tg_${cleanHandle.toLowerCase()}@telegram.neon`;
      const userObj = {
        email: mockEmail,
        name: cleanHandle,
        userId: `tg_${Date.now()}`,
        isTelegram: true,
        loginTime: Date.now(),
      };
      localStorage.setItem('metropolis_auth_user', JSON.stringify(userObj));
      setAuthMsg({ text: `✓ Verified as Operative ${cleanHandle}! Entering Metropolis...`, isError: false });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else window.location.href = '/';
      }, 500);
    }
  };

  const handleGuestLogin = () => {
    const randId = Math.floor(1000 + Math.random() * 9000);
    const guestUser = {
      email: `guest_${randId}@metropolis.neon`,
      name: `Operative #${randId}`,
      userId: `guest_${randId}`,
      isGuest: true,
      loginTime: Date.now(),
    };
    localStorage.setItem('metropolis_auth_user', JSON.stringify(guestUser));
    setAuthMsg({ text: `✓ Quick Guest session initialized as Operative #${randId}!`, isError: false });
    setTimeout(() => {
      if (onSuccess) onSuccess();
      else window.location.href = '/';
    }, 400);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthMsg({ text: 'Please enter both your email and password.', isError: true });
      return;
    }
    if (password.length < 6) {
      setAuthMsg({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }

    if (isRegister) {
      if (!confirmPassword) {
        setAuthMsg({ text: 'Please confirm your password.', isError: true });
        return;
      }
      if (password !== confirmPassword) {
        setAuthMsg({ text: 'Passwords do not match! Please check password confirmation.', isError: true });
        return;
      }
    }

    try {
      // Determine operative name: on register use chosen name; on login strictly use registered handle from server!
      const cleanEmail = email.trim().toLowerCase();
      const rawPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const defaultName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
      const chosenName = operativeName.trim() || defaultName || 'AgentOperative';

      // 1. Authenticate with server to set secure 30-day session cookie
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegister ? 'register' : 'login',
          email: cleanEmail,
          password,
          name: chosenName,
          referralCode: isRegister && referralInput.trim() ? referralInput.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthMsg({ text: data.message || 'Authentication failed.', isError: true });
        return;
      }

      // The authoritative operative handle: on login, ALWAYS use the official handle registered on the server!
      const authoritativeName = isRegister
        ? chosenName
        : (data.username || data.name || (data.playerState && data.playerState.name) || chosenName);

      // 2. Derive deterministic P2P signing key for Gossip anti-tamper protocol
      const signingKey = await deriveUserSigningKey(cleanEmail, password);
      localStorage.setItem('metropolis_p2p_signing_key', signingKey);

      // 3. Update isolated per-user local player state so each user has their own distinct data & name!
      const userStateKey = `neon_metropolis_user_${cleanEmail}`;
      const savedUserStr = localStorage.getItem(userStateKey) || localStorage.getItem('neon_metropolis_v6_botanical_green');
      let playerState: any = null;
      let localState: any = null;
      if (savedUserStr) {
        try {
          localState = JSON.parse(savedUserStr);
        } catch {}
      }

      let cloudState: any = (!isRegister && data.playerState) ? data.playerState : null;

      // If logging in on a new device or cleared cache, pull latest state from cluster
      if (!isRegister && !cloudState) {
        try {
          const syncRes = await fetch(`/api/player/sync?email=${encodeURIComponent(cleanEmail)}`);
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.playerState) {
              cloudState = syncData.playerState;
            }
          }
        } catch {}
      }

      const uniqueRef = data.userReferralCode || `NEON-${Math.floor(100000 + Math.random() * 900000)}`;

      // Merge local and cloud state so progress is NEVER wiped by an older cloud or empty local state
      if (!isRegister) {
        if (cloudState && localState) {
          const cloudRefs = cloudState.referrals || {};
          const localRefs = localState.referrals || {};
          const mergedRecruits = [...(cloudRefs.recruits || [])];
          for (const lr of (localRefs.recruits || [])) {
            if (!mergedRecruits.some((r: any) => r.id === lr.id || (r.email && lr.email && r.email.toLowerCase() === lr.email.toLowerCase()))) {
              mergedRecruits.push(lr);
            }
          }
          const effTotal = Math.max(Number(cloudRefs.totalRecruits || 0), Number(localRefs.totalRecruits || 0), mergedRecruits.length);
          const effNetwork = Math.max(Number(cloudRefs.networkTotalCitizens || 0), Number(localRefs.networkTotalCitizens || 0), mergedRecruits.length);

          playerState = {
            ...localState,
            ...cloudState,
            name: authoritativeName,
            money: Math.max(Number(localState.money || 0), Number(cloudState.money || 0)),
            bankMoney: Math.max(Number(localState.bankMoney || 0), Number(cloudState.bankMoney || 0)),
            dreamPoints: Math.max(Number(localState.dreamPoints || 0), Number(cloudState.dreamPoints || cloudState.sparks || 0)),
            greenTokens: Math.max(Number(localState.greenTokens || 0), Number(cloudState.greenTokens || 0)),
            level: Math.max(Number(localState.level || 1), Number(cloudState.level || 1)),
            inventory: (localState.inventory && localState.inventory.length > 0) ? localState.inventory : (cloudState.inventory || []),
            dreamCards: { ...(cloudState.dreamCards || {}), ...(localState.dreamCards || {}) },
            referrals: {
              ...localRefs,
              ...cloudRefs,
              referralCode: data.userReferralCode || cloudRefs.referralCode || localRefs.referralCode || uniqueRef,
              referredBy: cloudRefs.referredBy || localRefs.referredBy || undefined,
              recruits: mergedRecruits,
              totalRecruits: effTotal,
              networkTotalCitizens: effNetwork,
              unclaimedCommissionGreen: Math.max(Number(cloudRefs.unclaimedCommissionGreen || 0), Number(localRefs.unclaimedCommissionGreen || 0)),
              lifetimeCommissionGreen: Math.max(Number(cloudRefs.lifetimeCommissionGreen || 0), Number(localRefs.lifetimeCommissionGreen || 0)),
              claimedMilestones: Array.from(new Set([...(cloudRefs.claimedMilestones || []), ...(localRefs.claimedMilestones || [])]))
            },
            dailyComboProgress: cloudState.dailyComboProgress || localState.dailyComboProgress || undefined,
            lastSaveTimestamp: Math.max(localState.lastSaveTimestamp || 0, cloudState.lastSaveTimestamp || 0, Date.now())
          };
        } else if (cloudState) {
          playerState = cloudState;
        } else if (localState) {
          playerState = localState;
        }
      }

      if (isRegister) {
        const uniqueXid = String(Math.floor(1000000 + Math.random() * 9000000));
        playerState = {
          id: data.userId || `usr_${Date.now()}`,
          name: authoritativeName,
          xid: uniqueXid,
          role: 'CITIZEN',
          rank: '#1 Neon Operative',
          level: 1,
          xp: 0,
          xpNeeded: 100,
          money: 0,
          bankMoney: 0,
          points: 0,
          energy: 100,
          maxEnergy: 100,
          nerve: 10,
          maxNerve: 10,
          happy: 100,
          maxHappy: 100,
          life: 100,
          maxLife: 100,
          food: 100,
          maxFood: 100,
          dreamPoints: 0, // 0 Sparks - tap in Dream to earn!
          tapStamina: 100,
          maxTapStamina: 100,
          isAwakened: false,
          inventory: [],
          dreamCards: {},
          referrals: {
            referralCode: uniqueRef,
            totalRecruits: 0,
            unclaimedCommissionGreen: 0,
            lifetimeCommissionGreen: 0,
            recruits: [],
            claimedMilestones: [],
            referredBy: referralInput.trim() ? referralInput.trim().toUpperCase() : undefined,
            hasClaimedWelcomeBonus: false,
          },
        };

        // Sync new operative state to cluster cloud
        fetch('/api/player/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, playerState }),
        }).catch(() => {});
      } else if (!playerState) {
        // Fallback for older accounts that did not have a cloud playerState saved
        const uniqueXid = String(Math.floor(1000000 + Math.random() * 9000000));
        playerState = {
          id: data.userId || `usr_${Date.now()}`,
          name: authoritativeName,
          xid: uniqueXid,
          role: 'CITIZEN',
          rank: '#1 Neon Operative',
          level: 1,
          xp: 0,
          xpNeeded: 100,
          money: 0,
          bankMoney: 0,
          points: 0,
          energy: 100,
          maxEnergy: 100,
          nerve: 10,
          maxNerve: 10,
          happy: 100,
          maxHappy: 100,
          life: 100,
          maxLife: 100,
          food: 100,
          maxFood: 100,
          dreamPoints: 0,
          tapStamina: 100,
          maxTapStamina: 100,
          isAwakened: false,
          inventory: [],
          dreamCards: {},
          referrals: {
            referralCode: uniqueRef,
            totalRecruits: 0,
            unclaimedCommissionGreen: 0,
            lifetimeCommissionGreen: 0,
            recruits: [],
            claimedMilestones: [],
          },
        };
      } else {
        // ALWAYS maintain the player's official chosen handle!
        playerState.name = authoritativeName;
        if (!playerState.referrals) {
          playerState.referrals = {
            referralCode: uniqueRef,
            totalRecruits: 0,
            unclaimedCommissionGreen: 0,
            lifetimeCommissionGreen: 0,
            recruits: [],
            claimedMilestones: [],
          };
        } else if (data.userReferralCode) {
          playerState.referrals.referralCode = data.userReferralCode;
        }
      }

      // Save to both the per-user key and current active session key
      localStorage.setItem(userStateKey, JSON.stringify(playerState));
      localStorage.setItem('neon_metropolis_v6_botanical_green', JSON.stringify(playerState));
      localStorage.setItem('METROPOLIS_SAVE_SLOT_01', JSON.stringify(playerState));
      localStorage.setItem(
        'metropolis_auth_user',
        JSON.stringify({ email: cleanEmail, name: authoritativeName, userId: data.userId, loginTime: Date.now() })
      );

      if (!isRegister && playerState) {
        fetch('/api/player/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, playerState }),
        }).catch(() => {});
      }

      setAuthMsg({
        text: isRegister
          ? `✓ Account registered as ${playerState.name}! Entering Metropolis...`
          : `✓ Welcome back, ${playerState.name}! Entering Metropolis...`,
        isError: false,
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/';
        }
      }, 700);
    } catch {
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white font-sans">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-mono text-neutral-400 mt-4">Verifying encrypted operative session...</p>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-md w-full mx-auto space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-neutral-900 border border-emerald-500/30 shadow-xl">
            <span className="text-2xl">🌿</span>
            <span className="font-black text-sm tracking-widest text-emerald-400 uppercase">
              NEON METROPOLIS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {session && user ? 'Operative Identity Active' : isRegister ? 'Register Underworld Operative' : 'Operative Sign In'}
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {session && user
              ? 'You are currently authenticated in this browser. Enter the city or switch credentials.'
              : isRegister
              ? 'Create your decentralized syndicate profile. Secure your progress with a unique name and password.'
              : 'Sign in with your email and password to access your Neon Metropolis profile and assets.'}
          </p>
        </div>

        {/* VIEW 1: ALREADY LOGGED IN */}
        {session && user ? (
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-2xl font-black text-emerald-400 shrink-0">
                👤
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{user.name}</h3>
                <span className="text-xs font-mono text-emerald-400 block">{user.email}</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block">
                  Account ID: #{user.id}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Session encrypted & verified. All progress signed to this operative.</span>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess();
                  else window.location.href = '/city';
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Enter Neon Metropolis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out / Switch Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: AUTHENTIC EMAIL LOGIN / REGISTER */
          <div className="space-y-5">
            {/* Error or Success notification */}
            {authMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2.5 border ${
                  authMsg.isError
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 animate-pulse'
                }`}
              >
                {authMsg.isError ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{authMsg.text}</span>
              </div>
            )}

            {errorParam && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Error: {decodeURIComponent(errorParam)}</span>
              </div>
            )}

            {/* Main Auth Form Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-2xl space-y-4">
              {/* Telegram 1-Click Fast Access */}
              <button
                type="button"
                onClick={handleTelegramLogin}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-blue-950/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
              >
                <span className="text-base">✈️</span>
                <span>Login with Telegram (Instant 1-Click)</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Or with Operative ID</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              {/* Tab Selector: Sign In vs Register */}
              <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setAuthMsg(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    !isRegister ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setAuthMsg(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    isRegister ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Register Account
                </button>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address (e.g. user@gmail.com)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 text-white text-xs font-mono outline-hidden transition-colors"
                  />
                </div>

                {/* Unique Operative Codename (REGISTER TAB ONLY) */}
                {isRegister && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" /> Operative Codename / Name
                      </label>
                      <span className="text-[10px] text-neutral-500 font-mono">Custom Handle</span>
                    </div>
                    <input
                      type="text"
                      value={operativeName}
                      onChange={(e) => setOperativeName(e.target.value)}
                      placeholder={email ? `${email.split('@')[0]} (Auto)` : 'e.g. CyberViper, Ghost_Runner'}
                      maxLength={24}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 text-emerald-300 text-xs font-mono outline-hidden transition-colors"
                    />
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      Every operative has their own distinct in-game name & profile identity.
                    </span>
                  </div>
                )}

                {/* Password / Create Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRegister ? 'Create Password' : 'Password'}</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 text-white text-xs font-mono outline-hidden transition-colors"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono block">
                    Minimum 6 characters • Encrypted on client state
                  </span>
                </div>

                {/* Confirm Password (REGISTER TAB ONLY) */}
                {isRegister && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-teal-400" /> Confirm Password
                    </label>
                    <input
                      type="password"
                      required={isRegister}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-teal-500 text-white text-xs font-mono outline-hidden transition-colors"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <span className="text-[10px] text-rose-400 font-mono block">
                        Passwords do not match!
                      </span>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        ✓ Passwords match
                      </span>
                    )}
                  </div>
                )}

                {/* Optional Referral Code (REGISTER TAB ONLY - NEVER ON SIGN IN) */}
                {isRegister && (
                  <div className="space-y-1.5 pt-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" /> Referral Code (Optional)
                      </label>
                      {referralInput && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.2 rounded border border-cyan-500/30">
                          Code Applied!
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value)}
                      placeholder="e.g. NEON-10001 (Optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-cyan-300 text-xs font-mono uppercase outline-hidden transition-colors"
                    />
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      Recruits can claim bonuses. You can also enter a code inside the game at any time!
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isRegister ? 'Create Account & Enter Metropolis' : 'Sign In to Metropolis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Instant Guest Play Option */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="text-[11px] font-mono text-neutral-400 hover:text-emerald-400 underline decoration-dashed transition cursor-pointer"
                  >
                    🎮 Skip for now: Enter with Instant Guest Pass
                  </button>
                </div>
              </form>
            </div>

            <p className="text-center text-[10px] text-neutral-500 font-mono">
              Cryptographically signed player credentials • Multi-node encrypted security
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white font-mono text-xs">
          Loading gateway...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
