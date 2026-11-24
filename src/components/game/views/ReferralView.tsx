'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import {
  Users,
  Gift,
  Share2,
  Copy,
  Check,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Zap,
  ExternalLink,
  DollarSign,
  QrCode,
  Flame,
  Layers,
  Clock,
  ChevronRight,
  Coins,
} from 'lucide-react';
import { formatCompactNumber, CURRENCY_ICONS } from '../formatters';
import { loadCatalogData, DEFAULT_REFERRAL_REWARDS } from '../gameCatalog';

export default function ReferralView() {
  const rewardsCfg = loadCatalogData()?.referralRewards || DEFAULT_REFERRAL_REWARDS;
  const dailyStipendAmount = rewardsCfg.dailyRecruitStipend ?? 50;
  const recruiterBounty = rewardsCfg.recruiterInstantBounty ?? 100;
  const recruitWelcomeBonus = rewardsCfg.recruitWelcomeBonus ?? 100;
  const {
    player,
    claimReferralMilestone,
    collectReferralCommission,
    claimDailyRecruitStipend,
    claimDailyRoyaltyDividends,
    calculateNetworkTiers,
    redeemInviteCode,
    refreshReferralNetwork,
    simulateNewRecruit,
  } = useGame();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    refreshReferralNetwork();
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const authUserReferredBy = typeof window !== 'undefined'
    ? (() => {
        try {
          const raw = localStorage.getItem('metropolis_auth_user');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.referredBy) return parsed.referredBy;
          }
          const save = localStorage.getItem('metropolis_player_save_v1');
          if (save) {
            const parsed = JSON.parse(save);
            if (parsed.referrals?.referredBy) return parsed.referrals.referredBy;
          }
        } catch {}
        return null;
      })()
    : null;

  const effectiveReferredBy = player.referrals?.referredBy || authUserReferredBy || undefined;

  const refs = {
    ...(player.referrals || {
      referralCode: `NEON-${player.xid || '10001'}`,
      referredBy: undefined,
      hasClaimedWelcomeBonus: false,
      lastDailyStipendClaimTimestamp: 0,
      lastDailyRoyaltyClaimTimestamp: 0,
      dailyGameplayContribution: 0,
      pendingDailyRoyaltyGreen: 0,
      totalRecruits: 0,
      networkTotalCitizens: 0,
      unclaimedCommissionGreen: 0,
      lifetimeCommissionGreen: 0,
      recruits: [],
      claimedMilestones: [],
    }),
    referredBy: effectiveReferredBy,
  };

  const effectiveCode = (refs.referralCode || `NEON-${player.xid || '10001'}`).replace(/^GREEN-/, 'NEON-');
  const referralUrl = `https://t.me/NeonMetropolish_bot?start=${effectiveCode}`;

  const networkTiers = calculateNetworkTiers();
  const totalDailyDividend = networkTiers.reduce((sum, t) => sum + t.dailyDividendGreen, 0);
  const totalNetworkCitizens = (refs.recruits || []).length;

  // Check 24-hour cycle for daily royalty dividends
  const lastRoyaltyClaim = refs.lastDailyRoyaltyClaimTimestamp || 0;
  const isRoyaltyReady = lastRoyaltyClaim === 0 || now - lastRoyaltyClaim >= 86400000;
  const royaltyRemainingHours = Math.max(0, Math.ceil((86400000 - (now - lastRoyaltyClaim)) / (1000 * 60 * 60)));

  // Check 24-hour cycle for recruit daily stipend (+50 GREEN/day)
  const lastStipendClaim = refs.lastDailyStipendClaimTimestamp || 0;
  const isStipendReady = refs.referredBy && (lastStipendClaim === 0 || now - lastStipendClaim >= 86400000);
  const stipendRemainingHours = Math.max(0, Math.ceil((86400000 - (now - lastStipendClaim)) / (1000 * 60 * 60)));

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(effectiveCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleCollectTill = () => {
    const res = collectReferralCommission();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleClaimDailyDividend = () => {
    const res = claimDailyRoyaltyDividends();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleClaimStipend = () => {
    const res = claimDailyRecruitStipend();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleClaimMilestone = (count: number) => {
    const res = claimReferralMilestone(count);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRedeemInvite = async () => {
    if (!inviteInput.trim()) return;
    setFeedback('Connecting to Syndicate records...');
    const res = await redeemInviteCode(inviteInput);
    setFeedback(res.message);
    if (res.success) {
      setInviteInput('');
      refreshReferralNetwork().catch(() => {});
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const milestoneLadder = [
    { recruits: 1, title: 'Neon Scout Initiation', green: 100, sparks: 50, perk: '+🌿 100 GREEN & +50 Sparks' },
    { recruits: 3, title: 'Street Crew', green: (rewardsCfg.milestones?.find((m: any) => m.recruits === 3)?.rewardGreen ?? 500), sparks: 200, perk: `+🌿 ${(rewardsCfg.milestones?.find((m: any) => m.recruits === 3)?.rewardGreen ?? 500).toLocaleString()} GREEN & +200 Sparks` },
    { recruits: 5, title: 'District Cell', green: (rewardsCfg.milestones?.find((m: any) => m.recruits === 5)?.rewardGreen ?? 1200), sparks: 500, perk: `+🌿 ${(rewardsCfg.milestones?.find((m: any) => m.recruits === 5)?.rewardGreen ?? 1200).toLocaleString()} GREEN & +1 Stat Point` },
    { recruits: 10, title: 'Underworld Syndicate', green: (rewardsCfg.milestones?.find((m: any) => m.recruits === 10)?.rewardGreen ?? 3000), sparks: 1500, perk: `+🌿 ${(rewardsCfg.milestones?.find((m: any) => m.recruits === 10)?.rewardGreen ?? 3000).toLocaleString()} GREEN & +5 Max Energy Cap` },
    { recruits: 25, title: 'City Cartel', green: (rewardsCfg.milestones?.find((m: any) => m.recruits === 25)?.rewardGreen ?? 10000), sparks: 5000, perk: `+🌿 ${(rewardsCfg.milestones?.find((m: any) => m.recruits === 25)?.rewardGreen ?? 10000).toLocaleString()} GREEN & +5 Max Nerve Cap` },
    { recruits: 50, title: 'Metropolis Mafia', green: (rewardsCfg.milestones?.find((m: any) => m.recruits === 50)?.rewardGreen ?? 25000), sparks: 15000, perk: `+🌿 ${(rewardsCfg.milestones?.find((m: any) => m.recruits === 50)?.rewardGreen ?? 25000).toLocaleString()} GREEN & +50 Max Happy` },
    { recruits: 100, title: 'Underworld Kingpin', green: (rewardsCfg.milestones?.find((m: any) => m.recruits === 100)?.rewardGreen ?? 60000), sparks: 30000, perk: `+🌿 ${(rewardsCfg.milestones?.find((m: any) => m.recruits === 100)?.rewardGreen ?? 60000).toLocaleString()} GREEN, +30k Sparks, +10 Energy, +10 Nerve, +100 Happy & +3 Stat Pts` },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <h2 className="text-xl font-bold text-white">Syndicate Multi-Tier Royalty & Rewards</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Build your private underworld network across <strong>5 Generational Jumps</strong>. You earn ongoing daily royalties from your direct recruits,
              plus cascading royalties from players they recruit, calculated <strong>once every day</strong> based exclusively on active gameplay!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block">Direct Recruits</span>
              <span className="text-emerald-400 font-bold text-base flex items-center gap-1">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{refs.totalRecruits} Direct</span>
              </span>
            </div>

            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block">Total Network</span>
              <span className="text-cyan-400 font-bold text-base flex items-center gap-1">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{totalNetworkCitizens} Citizens</span>
              </span>
            </div>

            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block">Lifetime Royalties</span>
              <span className="text-amber-400 font-bold text-sm sm:text-base flex items-center gap-0.5">
                <span>{CURRENCY_ICONS.GREEN}</span>
                <span>{formatCompactNumber(refs.lifetimeCommissionGreen || 0)}</span>
                <span className="text-[10px] text-amber-300 ml-0.5">GREEN</span>
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs text-center font-bold animate-fadeIn">
            {feedback}
          </div>
        )}
      </div>

      {/* RECRUIT SPONSORSHIP STATUS & DAILY STIPEND (+50 GREEN/DAY) */}
      <div className={`rounded-2xl p-5 border shadow-sm transition-all ${
        refs.referredBy
          ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-indigo-950/40 border-emerald-500/40'
          : 'bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-950 border-amber-500/30'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              refs.referredBy
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
            }`}>
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">
                  {refs.referredBy ? 'Recruit Pioneer Sponsorship Benefit' : 'Were You Recruited By Another Operative?'}
                </h3>
                {refs.referredBy && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    +🌿 {dailyStipendAmount} GREEN / Day Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                {refs.referredBy ? (
                  <span>
                    Your operative profile is sponsored by <strong className="text-white font-mono">{refs.referredBy}</strong>. You are entitled to a daily recruit stipend of <strong>+🌿 {dailyStipendAmount} GREEN/day</strong> every 24 hours!
                  </span>
                ) : (
                  <span>
                    Enter your recruiter’s code to receive your <strong>Welcome Starter Kit</strong> (+🌿 {recruitWelcomeBonus} GREEN) AND unlock your daily <strong>+🌿 {dailyStipendAmount} GREEN / Day</strong> recruit stipend!
                  </span>
                )}
              </p>
            </div>
          </div>

          {refs.referredBy ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClaimStipend}
                disabled={!isStipendReady}
                className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer ${
                  isStipendReady
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-emerald-950/40 animate-pulse'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>{isStipendReady ? `Claim Today’s ${dailyStipendAmount} GREEN Allowance!` : `Next Allowance in ~${stipendRemainingHours}h`}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="e.g. NEON-10001"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
              />
              <button
                onClick={handleRedeemInvite}
                disabled={!inviteInput.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow shrink-0"
              >
                Claim Starter & Activate 50/Day
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MULTI-TIER JUMP ROYALTY TREE (5 GENERATIONAL TIERS) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Multi-Jump Cascading Royalty Tree</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Divided <strong>once a day</strong> based exclusively on active gameplay (crimes committed, gym workouts, dream taps). No royalty-on-royalty cascades.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClaimDailyDividend}
              disabled={!isRoyaltyReady || totalDailyDividend <= 0}
              className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer ${
                isRoyaltyReady && totalDailyDividend > 0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 shadow-amber-950/40 animate-pulse'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {isRoyaltyReady
                  ? (totalDailyDividend > 0
                      ? `Claim Daily Dividends (+🌿 ${totalDailyDividend.toLocaleString()} GREEN)`
                      : 'No Active Recruits (Recruit to Earn)')
                  : `Next Dividend Distribution in ~${royaltyRemainingHours}h`}
              </span>
            </button>
          </div>
        </div>

        {/* 5-Tier Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {networkTiers.map((tier) => (
            <div
              key={tier.tier}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 ${
                tier.activeCitizensCount > 0
                  ? 'bg-neutral-950 border-emerald-500/30'
                  : 'bg-neutral-950/60 border-neutral-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-white">Tier {tier.tier}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {tier.royaltyPercent}% Royalty
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 block font-mono">
                  {tier.jumpLabel}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-neutral-800/80">
                <div className="flex justify-between text-neutral-400">
                  <span>Citizens:</span>
                  <span className="text-white font-bold">{tier.activeCitizensCount}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Gameplay:</span>
                  <span className="text-neutral-300 font-bold">{CURRENCY_ICONS.GREEN} {formatCompactNumber(tier.dailyGameplayVolume)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-neutral-900">
                  <span>Today's Dividend:</span>
                  <span>+🌿 {tier.dailyDividendGreen.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Syndicate Link & Till */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Unique Referral Link & Code */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Share2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Your Personal Syndicate Link</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              5-Tier Cascading Royalties
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 block uppercase">
              Official Telegram Bot Referral Link
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 truncate focus:outline-none min-w-0"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl font-bold text-xs font-mono bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Bot</span>
              </a>
            </div>

            {/* Web / Browser Evergreen Gateway Share Link */}
            <div className="pt-2">
              <label className="text-[10px] font-mono text-neutral-400 block uppercase mb-1">
                Web Browser Evergreen Link (Chrome / Safari / Any Device)
              </label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://pocomon9.github.io/green-status/?ref=${effectiveCode}`}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 truncate focus:outline-none min-w-0"
                />
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(`https://pocomon9.github.io/green-status/?ref=${effectiveCode}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl font-bold text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Web Link</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-neutral-400">Invite Code:</span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                title="Click to copy invite code"
              >
                <span>{effectiveCode}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Instant Commission Till */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Affiliate Commission Till</h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Auto-Accruing</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Instant recruitment kickbacks and unclaimed commissions generated by newly joined downline members.
            </p>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 block">Uncollected Till Balance</span>
              <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                <span>🌿</span>
                <span>{(refs.unclaimedCommissionGreen || 0).toLocaleString()}</span>
                <span className="text-xs text-emerald-500">GREEN</span>
              </span>
            </div>

            <button
              onClick={handleCollectTill}
              disabled={(refs.unclaimedCommissionGreen || 0) <= 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow ${
                (refs.unclaimedCommissionGreen || 0) > 0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 shadow-amber-950/40 animate-pulse'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              Collect Till
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment Milestone Progression Ladder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Direct Recruit Milestone Rewards Ladder</h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Progress: <strong className="text-emerald-400">{refs.totalRecruits}</strong> Direct Recruits
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {milestoneLadder.map((tier) => {
            const isClaimed = (refs.claimedMilestones || []).includes(tier.recruits);
            const canClaim = refs.totalRecruits >= tier.recruits && !isClaimed;

            return (
              <div
                key={tier.recruits}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isClaimed
                    ? 'bg-neutral-950/60 border-neutral-800/80 opacity-75'
                    : canClaim
                    ? 'bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-indigo-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {tier.recruits} Recruit{tier.recruits === 1 ? '' : 's'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                      {refs.totalRecruits}/{tier.recruits}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-xs sm:text-sm">{tier.title}</h4>
                  <div className="mt-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] font-mono text-emerald-400 font-bold">
                    {tier.perk}
                  </div>
                </div>

                <button
                  onClick={() => handleClaimMilestone(tier.recruits)}
                  disabled={!canClaim}
                  className={`w-full py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    isClaimed
                      ? 'bg-neutral-950 text-neutral-600 border border-neutral-800 cursor-default'
                      : canClaim
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-md animate-pulse'
                      : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  {isClaimed ? '✓ Claimed' : canClaim ? 'Claim Milestone Bounty!' : `Need ${tier.recruits - refs.totalRecruits} More`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your Syndicate Network Live Roster */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Your Syndicate Network Roster ({totalNetworkCitizens})</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const res = simulateNewRecruit();
                setFeedback(res.message);
                setTimeout(() => setFeedback(null), 3500);
              }}
              className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 hover:border-cyan-500/40 cursor-pointer transition-all"
            >
              <span>➕</span>
              <span>Scout Test Recruit</span>
            </button>
            <button
              onClick={() => {
                refreshReferralNetwork();
                setFeedback('Synced live syndicate network from cluster!');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 hover:border-emerald-500/40 cursor-pointer transition-all"
            >
              <span>🔄</span>
              <span>Refresh Roster</span>
            </button>
          </div>
        </div>

        {totalNetworkCitizens === 0 ? (
          <div className="p-8 bg-neutral-950 rounded-xl border border-neutral-800 text-center space-y-2">
            <span className="text-3xl block">🌐</span>
            <h4 className="text-sm font-bold text-white">No recruits in your syndicate network yet</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Share your link to recruit citizens. You earn milestone bounties and multi-jump royalties once a day based on active gameplay!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80 overflow-x-auto">
            {refs.recruits.map((rec) => {
              const tierBadgeColors: Record<number, string> = {
                1: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
                2: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
                3: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
                4: 'bg-amber-950 text-amber-300 border-amber-500/40',
                5: 'bg-rose-950 text-rose-300 border-rose-500/40',
              };
              const badgeClass = tierBadgeColors[rec.tier || 1] || tierBadgeColors[1];
              const tierLabel = (rec.tier || 1) === 1 ? 'Direct (10%)' : `Tier ${rec.tier || 1} (${(rec.tier || 1) === 2 ? '4%' : (rec.tier || 1) === 3 ? '2%' : (rec.tier || 1) === 4 ? '1%' : '0.5%'})`;

              return (
                <div
                  key={rec.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-sm">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rec.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${badgeClass}`}>
                          {tierLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        Level {rec.level} Citizen • Today's Gameplay: 🌿 {rec.dailyGameplayEarned || 0} GREEN
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">
                      +🌿 {rec.totalGeneratedGreen || 0} Royalty
                    </span>
                    <span className="text-[10px] text-neutral-400">{rec.lastActive}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
