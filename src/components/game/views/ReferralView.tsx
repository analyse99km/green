'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function ReferralView() {
  const {
    player,
    claimReferralMilestone,
    collectReferralCommission,
    redeemInviteCode,
    simulateNewRecruit,
  } = useGame();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const refs = player.referrals || {
    referralCode: `NEON-${player.xid || '10001'}`,
    referredBy: undefined,
    hasClaimedWelcomeBonus: false,
    totalRecruits: 0,
    unclaimedCommissionGreen: 0,
    lifetimeCommissionGreen: 0,
    recruits: [],
    claimedMilestones: [],
  };

  const effectiveCode = (refs.referralCode || `NEON-${player.xid || '10001'}`).replace(/^GREEN-/, 'NEON-');
  const telegramBotUrl = 'https://t.me/NeonMetropolish_bot';
  const referralUrl = `https://t.me/NeonMetropolish_bot?start=${effectiveCode}`;

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

  const handleClaimMilestone = (count: number) => {
    const res = claimReferralMilestone(count);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRedeemInvite = () => {
    const res = redeemInviteCode(inviteInput);
    setFeedback(res.message);
    if (res.success) setInviteInput('');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSimulateRecruit = () => {
    const res = simulateNewRecruit();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const milestoneLadder = [
    {
      recruits: 1,
      title: 'Neon Scout Initiation',
      green: 100,
      sparks: 50,
      perk: '+🌿 100 GREEN & +50 Sparks',
    },
    {
      recruits: 3,
      title: 'Underworld Enforcer',
      green: 350,
      sparks: 200,
      perk: '+🌿 350 GREEN & +200 Sparks',
    },
    {
      recruits: 5,
      title: 'Syndicate Lieutenant',
      green: 750,
      sparks: 500,
      perk: '+🌿 750 GREEN & +1 Stat Point',
    },
    {
      recruits: 10,
      title: 'Cartel Captain',
      green: 2000,
      sparks: 1500,
      perk: '+🌿 2,000 GREEN & +5 Max Energy Cap',
    },
    {
      recruits: 25,
      title: 'Metropolis Kingpin',
      green: 6000,
      sparks: 5000,
      perk: '+🌿 6,000 GREEN & +5 Max Nerve Cap',
    },
    {
      recruits: 50,
      title: 'Godfather of Neon Metropolis',
      green: 15000,
      sparks: 15000,
      perk: '+🌿 15,000 GREEN & +50 Max Happy',
    },
    {
      recruits: 100,
      title: 'Supreme Sovereign & Syndicate Overlord',
      green: 35000,
      sparks: 30000,
      perk: '+🌿 35,000 GREEN, +30k Sparks, +10 Energy, +10 Nerve, +100 Happy & +3 Stat Pts',
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <h2 className="text-xl font-bold text-white">Syndicate Recruitment & Rewards</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Build your private underworld network. Every recruit who joins via your link earns you instant milestone bounties,
              plus a <strong>10% lifetime royalty</strong> deposited directly into your Referral Till whenever they earn GREEN coins or tap in Lucid Dream!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block">Total Recruits</span>
              <span className="text-emerald-400 font-bold text-base flex items-center gap-1">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{refs.totalRecruits} Citizens</span>
              </span>
            </div>

            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block">Lifetime Royalties</span>
              <span className="text-cyan-400 font-bold text-sm sm:text-base flex items-center gap-0.5">
                <span>🌿</span>
                <span>{(refs.lifetimeCommissionGreen || 0).toLocaleString()}</span>
                <span className="text-[10px] text-cyan-300 ml-0.5">GREEN</span>
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

      {/* Top 2 Action Cards: Link Sharing & Royalty Cash Register */}
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
              Lifetime 10% Kickback
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
          </div>

          {/* Quick Code Badge & Test Button */}
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

            {/* Interactive Demo Simulation Button */}
            <button
              onClick={handleSimulateRecruit}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Simulates a friend joining via your referral link"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Simulate New Recruit (Demo Viral Loop)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Royalty Till Register */}
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
              Unclaimed dividends generated by your syndicate network members from their crimes and dream tapping.
            </p>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 block">Uncollected Royalty</span>
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
              Collect Royalty Till
            </button>
          </div>
        </div>
      </div>

      {/* Enter Invite Code (New Player Starter Kit) */}
      <div className="bg-gradient-to-r from-emerald-950/30 via-neutral-900 to-indigo-950/30 border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                Were You Recruited By a Citizen?
                {refs.hasClaimedWelcomeBonus && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Starter Gift Claimed ✓
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Enter your sponsor’s code to receive a free <strong>Welcome Starter Pack: +🌿 50 GREEN, +10 Energy, and Fresh Food Bread!</strong>
              </p>
            </div>
          </div>

          {refs.hasClaimedWelcomeBonus ? (
            <div className="text-xs font-mono text-emerald-400 font-bold bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800">
              Sponsored by: <span className="text-white">{refs.referredBy || 'Syndicate Member'}</span>
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
                Claim Starter Kit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recruitment Milestone Progression Ladder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Recruit Milestone Rewards Ladder</h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Progress: <strong className="text-emerald-400">{refs.totalRecruits}</strong> Recruits
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

      {/* Your Syndicate Recruits Live Roster */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Your Syndicate Network ({refs.recruits.length})</h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">Live Citizen Activity</span>
        </div>

        {refs.recruits.length === 0 ? (
          <div className="p-8 bg-neutral-950 rounded-xl border border-neutral-800 text-center space-y-2">
            <span className="text-3xl block">🌐</span>
            <h4 className="text-sm font-bold text-white">No recruits in your syndicate yet</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Share your syndicate invite link with friends. You will earn milestone bonuses and ongoing 10% royalties whenever they play!
            </p>
            <div className="pt-2">
              <button
                onClick={handleSimulateRecruit}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold cursor-pointer"
              >
                + Test-Add a Recruit Now
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80 overflow-x-auto">
            {refs.recruits.map((rec) => (
              <div
                key={rec.id}
                className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <span className="font-bold text-white block">{rec.name}</span>
                    <span className="text-[10px] text-neutral-500">Level {rec.level} Citizen</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">
                    +🌿 {rec.totalGeneratedGreen} GREEN Earned
                  </span>
                  <span className="text-[10px] text-neutral-400">{rec.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
