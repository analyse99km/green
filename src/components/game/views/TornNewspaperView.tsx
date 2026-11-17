'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Newspaper,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Gift,
  Award,
  Users,
  Building,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ticket,
} from 'lucide-react';
import { INITIAL_NEWSPAPER_ARTICLES } from '../gameData';

export default function TornNewspaperView() {
  const { player, addLog } = useGame();
  const [activeTab, setActiveTab] = useState<'FRONT' | 'MARKET' | 'CLASSIFIEDS' | 'LOTTERY'>('FRONT');
  const [claimedDailyRation, setClaimedDailyRation] = useState(false);
  const [lotteryTicketsBought, setLotteryTicketsBought] = useState(0);

  const marketQuotes = [
    { symbol: 'MEGA', name: 'Street Megaphone', price: '$29,741', change: '-49.44%', isUp: false },
    { symbol: 'NMSE', name: 'Metropolis Stock Exchange', price: '16,446.36', change: '+1.82%', isUp: true },
    { symbol: 'PROP', name: 'Downtown Real Estate', price: '$31,250', change: '+3.15%', isUp: true },
    { symbol: 'PTMK', name: 'Points Market', price: '$44,200', change: '-0.30%', isUp: false },
    { symbol: 'FOOD', name: 'Culinary Wholesale Index', price: '$85.00', change: '+5.40%', isUp: true },
  ];

  const classifiedAds = [
    {
      id: 'ad_1',
      title: 'Strikes & Gutters Nightclub - Hiring Cleaners & Bouncers',
      category: 'JOB LISTING',
      pay: '$25,000/day + 1 Job Point',
      employer: 'VIP Nightclub District',
      description: 'Looking for disciplined individuals with at least 5 manual labor. Perks include VIP happy hour access.',
    },
    {
      id: 'ad_2',
      title: 'Apex Health - Looking for Certified Paramedics',
      category: 'JOB LISTING',
      pay: '$38,000/day + Medical Insurance',
      employer: 'Apex Trauma Pavilion',
      description: 'Requires passing the Municipal Medical Board Examination. Sign-up bonus for certified trauma surgeons.',
    },
    {
      id: 'ad_3',
      title: 'Wanted: Security Escort for West-Side Diamond Courier',
      category: 'BOUNTY / SECURITY',
      pay: '$15,000 Per Run',
      employer: 'Underworld Courier Network',
      description: 'Armed escort needed through contested faction territory. Combat stats 100+ recommended.',
    },
    {
      id: 'ad_4',
      title: 'Knights Faction - Recruitment Drive Open',
      category: 'FACTION RECRUIT',
      pay: 'Territory Dividends & Armory Access',
      employer: 'Knights [KNT]',
      description: 'Active Level 4+ operators welcome. Chain participation mandatory. Respect currently at 40,290.',
    },
  ];

  const handleClaimDailyRation = () => {
    if (claimedDailyRation) return;
    setClaimedDailyRation(true);
    player.money += 1500;
    player.energy = Math.min(player.maxEnergy, player.energy + 20);
    player.happy = Math.min(player.maxHappy, player.happy + 20);
    player.hasUnsavedActions = true;
    addLog({
      type: 'CIVILIAN',
      message: 'Claimed Newspaper Daily Ration: +$1,500 Cash, +20 Energy, +20 Happy!',
    });
  };

  const handleBuyLotteryTicket = () => {
    const cost = 100;
    if (player.money < cost) {
      alert('Insufficient pocket cash to buy a lottery ticket ($100 required).');
      return;
    }
    player.money -= cost;
    setLotteryTicketsBought((prev) => prev + 1);
    player.hasUnsavedActions = true;
    addLog({
      type: 'CIVILIAN',
      message: 'Lottery: Purchased City Jackpot entry #2026-X81 for $100.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Authentic Newspaper Masthead */}
      <div className="bg-neutral-900 border-b-2 border-neutral-700 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-[11px] font-mono text-neutral-400">
          <span>ESTABLISHED 2004 • ISSUE #7,842</span>
          <span className="text-amber-400 font-bold uppercase tracking-wider">
            Monday, November 16, 2026 • Neon Metropolis
          </span>
          <span>PRICE: FREE PRESS</span>
        </div>

        <div className="py-4">
          <div className="flex items-center justify-center gap-3">
            <Newspaper className="w-8 h-8 text-neutral-300" />
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-widest text-neutral-100 uppercase">
              The City Chronicle
            </h1>
          </div>
          <p className="text-xs font-serif italic text-neutral-400 mt-1">
            An Illustrated Independent Daily • Crime, Commerce & High Stakes in the Metropolis
          </p>
        </div>

        {/* Newspaper Sub-navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('FRONT')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'FRONT'
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            📰 Front Page
          </button>
          <button
            onClick={() => setActiveTab('MARKET')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'MARKET'
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            📈 Stock Ticker & TCSE
          </button>
          <button
            onClick={() => setActiveTab('CLASSIFIEDS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'CLASSIFIEDS'
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            📋 Classifieds & Jobs
          </button>
          <button
            onClick={() => setActiveTab('LOTTERY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'LOTTERY'
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            🎟️ City Lottery ($250M)
          </button>
        </div>
      </div>

      {/* Daily Freebie Claim Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Daily Press Syndicate Freebie <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">1/DAY</span>
            </h4>
            <p className="text-xs text-neutral-400">
              Pick up complimentary street rations: +$1,500 Cash, +20 Energy & +20 Happy.
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimDailyRation}
          disabled={claimedDailyRation}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            claimedDailyRation
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg font-mono'
          }`}
        >
          {claimedDailyRation ? '✓ Ration Claimed Today' : 'Claim Daily Ration'}
        </button>
      </div>

      {/* TAB CONTENT: Front Page */}
      {activeTab === 'FRONT' && (
        <div className="space-y-6">
          {/* OFFICIAL PIONEER BULLETIN / NOTICE BOARD */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-indigo-950/70 border border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs font-mono flex items-center gap-2">
                <span>🏛️</span> METROPOLIS OFFICIAL NOTICE BOARD • PRE-RELEASE PROTOCOL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE PHASE
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>🪂</span> Pre-Release Pioneer Phase & Guaranteed Native Crypto ($GREEN) Airdrop
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Notice to all Metropolis operatives: This version is an official <strong>Pre-Release Pioneer Edition</strong>. The full production release will launch globally in the near future! All pioneer gameplay during this pre-release phase will be rewarded with a <strong>guaranteed airdrop in our native $GREEN cryptocurrency</strong> based directly on your gameplay milestones. When the full version goes live, all progress carries over seamlessly with zero restrictions!
              </p>

              <div className="p-3 bg-neutral-950/90 rounded-xl border border-emerald-500/30 mt-3 font-mono text-xs text-emerald-400 space-y-1">
                <span className="font-bold text-white block text-xs">📊 Official Pioneer Airdrop Score Factors:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                  <p>• Player Level & Experience</p>
                  <p>• Battle & Gym Training Stats</p>
                  <p>• Syndicate Recruits & Referrals</p>
                  <p>• Net Liquid 🌿 GREEN Wealth</p>
                  <p className="text-amber-300 font-semibold">• ⚡ Lucid Dream Taps & Tap Stamina Level</p>
                  <p className="text-emerald-300 font-semibold">• 🌲 Botanical Cards Unlocked & Harvest Yield</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Lead Headline (Spans 2 columns) */}
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-neutral-800 pb-2">
              <span className="text-rose-400 font-bold uppercase tracking-wider">Top Story • Economy</span>
              <span>By Chief Financial Reporter</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              Megaphone Value Plummets 49.44% as Downtown Real Estate & Bazaars Explode
            </h2>

            <p className="text-xs text-neutral-300 leading-relaxed font-serif">
              The municipal commerce commission reports a dramatic shift in street contraband valuations. Street
              megaphones, once valued at upwards of $58,000, have experienced a steep correction to $29,741. Meanwhile,
              syndicate operatives and business moguls are snapping up high-security residential apartments to safeguard
              cash from roaming pickpockets.
            </p>

            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between font-mono text-xs">
              <span className="text-neutral-400">Megaphone Benchmark Price:</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> $29,741 (-49.44%)
              </span>
            </div>

            <div className="pt-2">
              <h3 className="font-bold text-neutral-200 text-sm mb-3">Other Top Headlines</h3>
              <div className="space-y-3">
                {INITIAL_NEWSPAPER_ARTICLES.slice(1).map((art) => (
                  <div key={art.id} className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-1">
                      <span className="text-emerald-400">{art.category}</span>
                      <span>{art.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-100">{art.headline}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-normal">{art.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: Stock Ticker Summary & Editorial */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase font-mono">Market Quick Look</h3>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE TCSE</span>
              </div>

              <div className="space-y-2.5">
                {marketQuotes.slice(0, 4).map((q) => (
                  <div key={q.symbol} className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-neutral-200">{q.symbol}</span>
                      <span className="text-[10px] text-neutral-500 block">{q.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">{q.price}</span>
                      <span
                        className={`text-[10px] block font-semibold ${
                          q.isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {q.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono">Underworld Dispatch</h3>
              <p className="text-xs text-neutral-400 font-serif leading-relaxed">
                "Keep at least 20% of your net bank liquid in pocket cash to satisfy city commerce ratios, but keep your
                apartment deadbolts locked before sleeping. The streets never rest."
              </p>
              <div className="text-[11px] font-mono text-neutral-500 italic">— Anonymous Syndicate Consigliere</div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB CONTENT: Market & Stocks */}
      {activeTab === 'MARKET' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Metropolis Stock Exchange (TCSE)</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Real-time commodities, real estate index, and market valuations across the metropolitan core.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="p-3">Asset / Symbol</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Current Price</th>
                  <th className="p-3 text-right">24h Fluctuation</th>
                  <th className="p-3 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {marketQuotes.map((q) => (
                  <tr key={q.symbol} className="hover:bg-neutral-800/40">
                    <td className="p-3 font-bold text-white">
                      {q.name} <span className="text-neutral-500 text-[10px]">[{q.symbol}]</span>
                    </td>
                    <td className="p-3 text-neutral-400">Municipal Commodity</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{q.price}</td>
                    <td
                      className={`p-3 text-right font-bold ${
                        q.isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {q.change}
                    </td>
                    <td className="p-3 text-center">
                      {q.isUp ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Classified Ads */}
      {activeTab === 'CLASSIFIEDS' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-base font-bold text-white">Metropolitan Classified Ads & Job Opportunities</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Corporations, private clinics, and underworld networks looking for qualified personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classifiedAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="bg-neutral-950 px-2.5 py-1 rounded-md text-amber-400 border border-neutral-800 font-bold">
                    {ad.category}
                  </span>
                  <span className="text-emerald-400 font-bold">{ad.pay}</span>
                </div>

                <h3 className="text-sm font-bold text-white">{ad.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{ad.description}</p>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Employer: {ad.employer}</span>
                  <span className="text-neutral-400">Position Open</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: City Lottery */}
      {activeTab === 'LOTTERY' && (
        <div className="max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <Ticket className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Metropolis Mega Jackpot Lottery</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Draws take place every Sunday midnight. 1 Lucky Citizen takes the grand prize!
            </p>
          </div>

          <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest block">
              Estimated Grand Jackpot Pool
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
              $250,000,000
            </div>
            <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-center gap-1 mt-2">
              <Clock className="w-3.5 h-3.5" /> Next Drawing In: 14h 22m 10s
            </div>
          </div>

          <div className="space-y-3 max-w-sm mx-auto">
            <div className="text-xs font-mono text-neutral-300">
              Your Purchased Tickets: <span className="font-bold text-amber-400">{lotteryTicketsBought}</span>
            </div>

            <button
              onClick={handleBuyLotteryTicket}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-all cursor-pointer font-mono"
            >
              Buy Lottery Ticket ($100)
            </button>
            <p className="text-[10px] text-neutral-500">
              Each ticket purchased adds entry to the municipal RNG draw and increases the total pot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
