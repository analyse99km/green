'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Flame,
  ShieldAlert,
  Sparkles,
  Search,
  Disc,
  Palette,
  ShoppingBag,
  Hand,
  CreditCard,
  Key,
  Dice5,
  Trash2,
  Terminal,
  FileText,
  Mail,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  XCircle,
  AlertCircle,
  Fingerprint,
  ChevronLeft,
  Plus,
  Sun,
  Shield,
  X,
} from 'lucide-react';
import {
  CRIMES_SEARCH_LOCATIONS,
  BOOTLEG_GENRES,
  GRAFFITI_DISTRICTS,
  SHOPLIFTING_TARGETS,
  PICKPOCKETING_TARGETS,
  SKIMMER_LOCATIONS,
  BURGLARY_TARGETS,
  HUSTLING_GAMES,
  DISPOSAL_TIERS,
  FORGERY_PROJECTS,
  SCAMMING_EMAILS,
  ARSON_LOCATIONS,
} from '../gameData';

type CrimeSubTab =
  | 'SEARCH'
  | 'BOOTLEG'
  | 'GRAFFITI'
  | 'SHOPLIFT'
  | 'PICKPOCKET'
  | 'SKIM'
  | 'BURGLARY'
  | 'HUSTLE'
  | 'DISPOSAL'
  | 'CRACKING'
  | 'FORGERY'
  | 'SCAM'
  | 'ARSON';

export default function TornCrimesView() {
  const {
    player,
    executeSearchCrime,
    executeBootlegCopy,
    executeBootlegSell,
    executeGraffiti,
    executeShopliftTarget,
    executePickpocketTarget,
    executeSkimInstall,
    executeSkimSell,
    executeBurglaryScout,
    executeHustling,
    executeDisposal,
    executeForgeryStep,
    executeScamPhishing,
    executeArson,
  } = useGame();

  const [activeTab, setActiveTab] = useState<CrimeSubTab>('SEARCH');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    targetId: string;
    message: string;
    success: boolean;
  } | null>(null);

  const crimeTabs: { id: CrimeSubTab; name: string; icon: string; skill: number }[] = [
    { id: 'SEARCH', name: 'Search for Cash', icon: '🔍', skill: player.criminalSkills.searchForCash },
    { id: 'BOOTLEG', name: 'Bootlegging', icon: '💿', skill: player.criminalSkills.bootlegging },
    { id: 'GRAFFITI', name: 'Graffiti', icon: '🎨', skill: player.criminalSkills.graffiti },
    { id: 'SHOPLIFT', name: 'Shoplifting', icon: '🏪', skill: player.criminalSkills.shoplifting },
    { id: 'PICKPOCKET', name: 'Pickpocketing', icon: '👛', skill: player.criminalSkills.shoplifting },
    { id: 'SKIM', name: 'Card Skimming', icon: '💳', skill: player.criminalSkills.cardSkimming },
    { id: 'BURGLARY', name: 'Burglary', icon: '🔓', skill: player.criminalSkills.burglary },
    { id: 'HUSTLE', name: 'Hustling', icon: '🎲', skill: player.criminalSkills.hustling },
    { id: 'DISPOSAL', name: 'Disposal', icon: '☣️', skill: player.criminalSkills.searchForCash },
    { id: 'CRACKING', name: 'Cracking', icon: '💻', skill: player.criminalSkills.cracking },
    { id: 'FORGERY', name: 'Forgery', icon: '🖨️', skill: player.criminalSkills.forgery },
    { id: 'SCAM', name: 'Scamming', icon: '📧', skill: player.criminalSkills.cracking },
    { id: 'ARSON', name: 'Arson', icon: '🔥', skill: player.criminalSkills.arson },
  ];

  const handleSearch = (locId: string) => {
    const res = executeSearchCrime(locId);
    setFeedback(res.message);
    setLastActionResult({ targetId: locId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBootlegCopy = (genreId: string) => {
    const res = executeBootlegCopy(genreId);
    setFeedback(res.message);
    setLastActionResult({ targetId: genreId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBootlegSell = () => {
    const res = executeBootlegSell();
    setFeedback(res.message);
    setLastActionResult({ targetId: 'bootleg_sell', message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleGraffiti = (distId: string) => {
    const res = executeGraffiti(distId);
    setFeedback(res.message);
    setLastActionResult({ targetId: distId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleShoplift = (tgtId: string) => {
    const res = executeShopliftTarget(tgtId);
    setFeedback(res.message);
    setLastActionResult({ targetId: tgtId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePickpocket = (tgtId: string) => {
    const res = executePickpocketTarget(tgtId);
    setFeedback(res.message);
    setLastActionResult({ targetId: tgtId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSkimInstall = (locId: string) => {
    const res = executeSkimInstall(locId);
    setFeedback(res.message);
    setLastActionResult({ targetId: locId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSkimSell = (locId: string) => {
    const res = executeSkimSell(locId);
    setFeedback(res.message);
    setLastActionResult({ targetId: locId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBurglary = (tgtId: string) => {
    const res = executeBurglaryScout(tgtId);
    setFeedback(res.message);
    setLastActionResult({ targetId: tgtId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleHustling = (gameId: string) => {
    const res = executeHustling(gameId);
    setFeedback(res.message);
    setLastActionResult({ targetId: gameId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDisposal = (tierId: string) => {
    const res = executeDisposal(tierId);
    setFeedback(res.message);
    setLastActionResult({ targetId: tierId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleForgery = (projId: string) => {
    const res = executeForgeryStep(projId);
    setFeedback(res.message);
    setLastActionResult({ targetId: projId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleScam = (emailId: string) => {
    const res = executeScamPhishing(emailId);
    setFeedback(res.message);
    setLastActionResult({ targetId: emailId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleArson = (targetId: string, actionType: 'BREACH' | 'INQUIRE' | 'PLACE' = 'BREACH') => {
    const res = executeArson(targetId, actionType);
    setFeedback(res.message);
    setLastActionResult({ targetId: targetId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const currentTabMeta = crimeTabs.find((t) => t.id === activeTab) || crimeTabs[0];

  return (
    <div className="space-y-6">
      {/* Crimes 2.0 Hub Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-xl font-bold text-white">Metropolis Crimes 2.0 (Underworld Hub)</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-branch criminal career paths. Search locations to discover rare items and cash, burn
              counterfeit DVDs, spray turf tags, pickpocket pedestrians, and breach residential safes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-neutral-500 block text-[10px]">Your Nerve</span>
              <span className="text-amber-400 font-bold text-base flex items-center gap-1">
                <Zap className="w-4 h-4 fill-amber-400" /> {player.nerve} / {player.maxNerve}
              </span>
            </div>

            <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-neutral-500 block text-[10px]">{currentTabMeta.name} Skill</span>
              <span className="text-emerald-400 font-bold text-base">{currentTabMeta.skill.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono shadow-sm">
            {feedback}
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Crime Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {crimeTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFeedback(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-rose-950/60 border-rose-500 text-white shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
              <span className="text-[10px] bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-400">
                {tab.skill.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: SEARCH FOR CASH & ITEMS */}
      {activeTab === 'SEARCH' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🔍</span> Search for Cash & Salvaged Relics (2 Nerve Each)
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Comb municipal dumpsters, subway cars, beaches, and cemetery crypts. You don't just find cash — you uncover
              rare items like 18k Gold Signet Rings, Vintage Lighters, Antique Watches, and scrap wiring that go straight
              into your inventory!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CRIMES_SEARCH_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{loc.icon}</span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      -${loc.nerveCost} Nerve
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2">{loc.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                    GREEN Drop: 🌿 {loc.minCash} – {loc.maxCash} GREEN
                  </span>

                  <div className="mt-3 pt-2 border-t border-neutral-800/80">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Possible Item Discoveries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {loc.lootPool.map((loot) => (
                        <span
                          key={loot.id}
                          className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded text-neutral-300 font-mono border border-neutral-800 flex items-center gap-1"
                        >
                          <span>{loot.icon}</span>
                          <span>{loot.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSearch(loc.id)}
                  disabled={player.nerve < loc.nerveCost}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
                    player.nerve >= loc.nerveCost
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Search Location (2 Nerve)
                </button>

                {lastActionResult?.targetId === loc.id && (
                  <div
                    className={`mt-2 p-3 rounded-xl border text-xs font-mono animate-fadeIn flex items-start gap-2 shadow-lg ${
                      lastActionResult.success
                        ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
                        : 'bg-rose-950/90 border-rose-500/60 text-rose-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold text-white block">Search Result:</span>
                      <span>{lastActionResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: BOOTLEGGING */}
      {activeTab === 'BOOTLEG' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>💿</span> Cyber Bootlegging & DVD Duplication Unit
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Burn optical cyber media discs across multiple movie & software genres. Sell packaged batches to street corners
                or set up darknet storefronts.
              </p>
            </div>

            <button
              onClick={handleBootlegSell}
              disabled={player.nerve < 5}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs font-mono shadow transition-all cursor-pointer"
            >
              Sell Counterfeit Batch (5 Nerve)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BOOTLEG_GENRES.map((genre) => (
              <div
                key={genre.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{genre.icon}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-neutral-950 px-2 py-0.5 rounded">
                      Burned: {genre.copiesBurned}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-2">{genre.name}</h4>
                  <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                    Optical ISO Ready to burn
                  </span>
                </div>

                <button
                  onClick={() => handleBootlegCopy(genre.id)}
                  disabled={player.nerve < 2}
                  className="w-full py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Burn Copy (2 Nerve)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: GRAFFITI */}
      {activeTab === 'GRAFFITI' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🎨</span> Syndicate Graffiti & Turf Marking
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Mark district walls and transit stations with Knights [KNT] insignia to increase syndicate respect and
              territory influence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRAFFITI_DISTRICTS.map((dist) => (
              <div
                key={dist.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{dist.name}</span>
                    <span className="text-amber-400 font-bold">{dist.activeTags} Active Tags</span>
                  </div>

                  <div className="space-y-1 my-3">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>Turf Dominance</span>
                      <span className="text-emerald-400 font-bold">{dist.controlPct}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 rounded h-1.5 overflow-hidden border border-neutral-800">
                      <div
                        className="bg-emerald-500 h-full rounded"
                        style={{ width: `${dist.controlPct}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-[10px] text-indigo-400 font-mono block">
                    Reward: +{dist.respectGain} Faction Respect
                  </span>
                </div>

                <button
                  onClick={() => handleGraffiti(dist.id)}
                  disabled={player.nerve < dist.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Spray Tag ({dist.nerveCost} Nerve)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SHOPLIFTING */}
      {activeTab === 'SHOPLIFT' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🏪</span> Retail Store Shoplifting
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Bypass surveillance cameras and slip merchandise into your coat. Successfully shoplifted items are added
              directly to your tactical inventory!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHOPLIFTING_TARGETS.map((tgt) => (
              <div
                key={tgt.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-3xl">{tgt.icon}</span>
                  <h4 className="font-bold text-white text-xs mt-2">{tgt.name}</h4>
                  <div className="text-[10px] text-amber-400 font-mono mt-1">
                    Target: {tgt.storeLoot} (🌿 {tgt.lootVal} GREEN)
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                    Security Difficulty: Lvl {tgt.diff}
                  </span>
                </div>

                <button
                  onClick={() => handleShoplift(tgt.id)}
                  disabled={player.nerve < tgt.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow"
                >
                  Shoplift ({tgt.nerveCost} Nerve)
                </button>

                {lastActionResult?.targetId === tgt.id && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-[11px] font-mono animate-fadeIn flex items-start gap-1.5 shadow ${
                      lastActionResult.success
                        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{lastActionResult.message}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: PICKPOCKETING */}
      {activeTab === 'PICKPOCKET' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>👛</span> Street Pickpocketing & Mugging
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Select pedestrian marks on the sidewalk. Time your approach carefully to avoid detection by beat police.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PICKPOCKETING_TARGETS.map((tgt) => (
              <div
                key={tgt.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{tgt.icon}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-neutral-950 px-2 py-0.5 rounded">
                      {tgt.successRate}% Success
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2">{tgt.name}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">{tgt.desc}</p>
                  <span className="text-[10px] text-amber-400 font-mono block mt-1">
                    Pocket Loot: 🌿 {tgt.cashMin} – {tgt.cashMax} GREEN
                  </span>
                </div>

                <button
                  onClick={() => handlePickpocket(tgt.id)}
                  disabled={player.nerve < tgt.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Pickpocket Mark ({tgt.nerveCost} Nerve)
                </button>

                {lastActionResult?.targetId === tgt.id && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-[11px] font-mono animate-fadeIn flex items-start gap-1.5 shadow ${
                      lastActionResult.success
                        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{lastActionResult.message}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: CARD SKIMMING */}
      {activeTab === 'SKIM' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>💳</span> ATM Hardware Card Skimming
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Install cloned magnetic strip readers on municipal ATMs. Harvest credentials and sell data packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKIMMER_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{loc.icon}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-neutral-950 px-2 py-0.5 rounded">
                      {loc.cardsHarvested} Cards Harvested
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{loc.name}</h4>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    Installed Hardware: {loc.installedCount} Unit(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSkimInstall(loc.id)}
                    disabled={player.nerve < 6}
                    className="py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                  >
                    Install Skimmer (6 Nerve)
                  </button>
                  <button
                    onClick={() => handleSkimSell(loc.id)}
                    disabled={player.nerve < 6}
                    className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow"
                  >
                    Sell Dumps (6 Nerve)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: BURGLARY */}
      {activeTab === 'BURGLARY' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🔓</span> Residential Burglary & Safe Cracking
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Scout high-end properties, bypass electronic lock matrices, and loot private vaults.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BURGLARY_TARGETS.map((tgt) => (
              <div
                key={tgt.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tgt.icon}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-neutral-950 px-2 py-0.5 rounded">
                      {tgt.tier}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{tgt.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                    Vault Loot: 🌿 {tgt.lootMin.toLocaleString()} – {tgt.lootMax.toLocaleString()} GREEN
                  </span>
                </div>

                <button
                  onClick={() => handleBurglary(tgt.id)}
                  disabled={player.nerve < tgt.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow"
                >
                  Pick Deadbolt & Heist ({tgt.nerveCost} Nerve)
                </button>

                {lastActionResult?.targetId === tgt.id && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-[11px] font-mono animate-fadeIn flex items-start gap-1.5 shadow ${
                      lastActionResult.success
                        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{lastActionResult.message}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: HUSTLING */}
      {activeTab === 'HUSTLE' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🎲</span> Street Hustling & Confidence Games
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Gather crowds around Three-Card Monte, Shell games, and Snail racing to collect audience wagers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HUSTLING_GAMES.map((game) => (
              <div
                key={game.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-3xl">{game.icon}</span>
                  <h4 className="font-bold text-white text-sm mt-2">{game.name}</h4>
                  <span className="text-xs font-mono text-emerald-400 block mt-1">
                    Payout: +🌿 {game.payout} GREEN
                  </span>
                </div>

                <button
                  onClick={() => handleHustling(game.id)}
                  disabled={player.nerve < game.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Run Game ({game.nerveCost} Nerve)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 9: DISPOSAL */}
      {activeTab === 'DISPOSAL' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>☣️</span> Clandestine Waste Disposal
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Accept contracts to illegally dump commercial, industrial, and biological hazardous waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISPOSAL_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-3xl">{tier.icon}</span>
                  <h4 className="font-bold text-white text-xs mt-2">{tier.name}</h4>
                  <span className="text-xs font-mono text-emerald-400 block mt-1">
                    Disposal Fee: +🌿 {tier.fee.toLocaleString()} GREEN
                  </span>
                </div>

                <button
                  onClick={() => handleDisposal(tier.id)}
                  disabled={player.nerve < tier.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Dump Waste ({tier.nerveCost} Nerve)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 10: CRACKING (CYBERCRIME) */}
      {activeTab === 'CRACKING' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Terminal className="w-4 h-4" /> VeilVPN Virtual Terminal v4.2
            </div>
            <span className="text-emerald-400">● IP: 198.51.100.44 [Encrypted]</span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-neutral-400 space-y-1">
            <div>root@veil-terminal:~# ./netscan --target 192.168.25.0/24</div>
            <div className="text-neutral-500">Scanning network nodes... 14 vulnerable corporate ports identified.</div>
            <div className="text-emerald-400">Target: Municipal Utility Grid Switch [VULNERABLE]</div>
          </div>

          <button
            onClick={() => {
              const res = executeScamPhishing('scam_crypto');
              setFeedback(res.message);
            }}
            disabled={player.nerve < 6}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs font-mono shadow transition-all cursor-pointer"
          >
            Launch Netscan Brute-Force Exploit (6 Nerve)
          </button>
        </div>
      )}

      {/* SUB-VIEW 11: FORGERY */}
      {activeTab === 'FORGERY' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🖨️</span> Counterfeit Documents & Forgery Studio
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Print state driver's licenses, property deeds, and covert diplomatic passports in high fidelity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORGERY_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="text-3xl">{proj.icon}</span>
                  <h4 className="font-bold text-white text-sm mt-2">{proj.name}</h4>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Value: +🌿 {proj.payout.toLocaleString()} GREEN
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                    Step {proj.currentStep} of {proj.totalSteps}
                  </span>
                </div>

                <button
                  onClick={() => handleForgery(proj.id)}
                  disabled={player.nerve < proj.nervePerStep}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Print Next Step ({proj.nervePerStep} Nerve)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 12: SCAMMING */}
      {activeTab === 'SCAM' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📧</span> Mass Phishing & Advance-Fee Scams
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Dispatch phishing lures across city email databases. Extract wire transfers and crypto credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCAMMING_EMAILS.map((email) => (
              <div
                key={email.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{email.from}</span>
                    <span className="text-amber-400">{email.successRate}% Success</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1.5">{email.subject}</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 font-serif">{email.snippet}</p>
                  <span className="text-xs font-mono text-emerald-400 block mt-2">
                    Settlement: +🌿 {email.payout.toLocaleString()} GREEN
                  </span>
                </div>

                <button
                  onClick={() => handleScam(email.id)}
                  disabled={player.nerve < email.nerveCost}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Send Phishing Blast ({email.nerveCost} Nerve)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 13: ARSON (Authentic Torn City Crimes 2.0 Interface) */}
      {activeTab === 'ARSON' && (
        <div className="space-y-4">
          {/* Top Bar: Title & Back to Hub */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>🔥</span> Arson
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Crimes 2.0 Syndicate Operations • Industrial Sabotage & Controlled Infiltration
              </p>
            </div>
            <button
              onClick={() => setActiveTab('SEARCH')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>Back to Hub</span>
            </button>
          </div>

          {/* Blueprint Schematic Banner */}
          <div className="relative rounded-2xl border border-sky-800/80 overflow-hidden shadow-xl bg-[#0c2340]">
            {/* Blueprint Grid Lines & Crease Effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-transparent to-neutral-950/80 pointer-events-none" />

            {/* Banner Top Strip: ARSON tab + Counters */}
            <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between border-b border-sky-900/60 bg-sky-950/50 backdrop-blur-xs">
              {/* ARSON Tag */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-sky-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow">
                  ARSON
                </span>
                <span className="text-[10px] font-mono text-sky-300/80 hidden sm:inline">
                  Blueprint Schematics V2.0
                </span>
              </div>

              {/* Status Counters (✓ Success, ✖ Fails, ! Alerts) */}
              <div className="flex items-center gap-2 font-mono text-xs">
                {/* Completed / Breaches */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">{player.arsonStats?.breaches ?? 1}</span>
                </div>
                {/* Failures / Arrests */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-300">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-bold">{player.arsonStats?.fails ?? 10}</span>
                </div>
                {/* Critical Alerts */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{player.arsonStats?.alerts ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Banner Hero Middle Graphic with Navigation Arrows */}
            <div className="relative z-10 px-4 py-8 sm:py-12 flex items-center justify-between text-sky-400">
              <button
                onClick={() => setActiveTab('CRACKING')}
                className="p-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-200 transition-all cursor-pointer shadow hover:scale-105"
                title="Previous Category"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <span className="text-[11px] font-mono tracking-widest text-sky-300/80 uppercase">
                  ACTIVE SYNDICATE TARGETS
                </span>
                <h4 className="text-lg sm:text-2xl font-black text-white tracking-wide uppercase drop-shadow">
                  METROPOLIS ARSON CONTRACTS
                </h4>
                <p className="text-xs text-sky-200/70 font-mono max-w-md mx-auto hidden sm:block">
                  Recon perimeter structures, breach industrial points of entry, and plant accelerants.
                </p>
              </div>

              <div className="w-9" />
            </div>

            {/* Banner Bottom Track: Timeline Progress Bar */}
            <div className="relative z-10 px-4 py-2 bg-neutral-950/90 border-t border-sky-900/60 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div className="flex-1 bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-sky-900/50">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(15, (player.criminalSkills.arson || 1) * 8))}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-sky-300">
                Skill Level {player.criminalSkills.arson.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Arson Target List Rows (Exact 6 Targets from Image 1) */}
          <div className="space-y-2.5 pt-2">
            {ARSON_LOCATIONS.map((tgt) => {
              const prog = (player.arsonProgress || {})[tgt.id] || 0;
              const nerveCost = tgt.nerveCost;
              const hasNerve = player.nerve >= nerveCost;

              return (
                <div
                  key={tgt.id}
                  className="bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-sky-700/60 rounded-xl p-3 sm:p-4 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Location Photo + Title & Subtitle */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Realistic Location Photo Thumbnail */}
                    <div className="w-20 h-16 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0 relative group">
                      <img
                        src={tgt.imageUrl}
                        alt={tgt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold text-white px-1 py-0.2 rounded bg-black/70">
                        {tgt.nerveCost}N
                      </span>
                    </div>

                    {/* Titles & Subtitles */}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-sky-400 hover:text-sky-300 transition-colors tracking-tight truncate">
                        {tgt.name}
                      </h4>
                      <p className="text-xs font-medium text-sky-300/80 -mt-0.5 truncate">
                        {tgt.subtitle}
                      </p>
                      <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                        Bounty: 🌿 {tgt.payoutMin.toLocaleString()} – {tgt.payoutMax.toLocaleString()} GREEN
                      </span>
                    </div>
                  </div>

                  {/* Middle: Badges & Progress Indicators */}
                  <div className="flex items-center gap-2 sm:gap-3 py-1 sm:py-0 border-y sm:border-y-0 border-neutral-800/80">
                    {/* Scout / Sun Icon */}
                    <div
                      className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-amber-400/80"
                      title="Reconnaissance Scan"
                    >
                      <Sun className="w-4 h-4" />
                    </div>

                    {/* Structure Progress Bar (e.g. 0% or completed) */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-mono">
                      <Shield className="w-3.5 h-3.5 text-neutral-400" />
                      <span className={prog > 0 ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                        {prog}%
                      </span>
                    </div>

                    {/* Tool / Hazard Badge */}
                    <div
                      className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sky-400"
                      title="Perimeter Hazard"
                    >
                      <Flame className="w-4 h-4 text-rose-400" />
                    </div>

                    {/* Equipment Slot with [+] if available */}
                    {tgt.hasItemSlot && (
                      <div
                        className="w-8 h-8 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-950/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-900/40 cursor-pointer transition-colors"
                        title="Equip Incendiary Accelerant (Jerry Can / Thermite)"
                        onClick={() => {
                          alert('Accelerant Slot: Equipped Industrial High-Octane Accelerant (+25% breach payout bonus)!');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Right: Segmented Action Button [BREACH | 3] or [INQUIRE] or [PLACE | 5] */}
                  <div className="shrink-0 flex sm:justify-end">
                    <button
                      onClick={() => handleArson(tgt.id, tgt.actionLabel)}
                      disabled={!hasNerve}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                        !hasNerve
                          ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                          : tgt.actionLabel === 'INQUIRE'
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white border border-sky-400/40'
                          : tgt.actionLabel === 'PLACE'
                          ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border border-rose-400/40 shadow-rose-950/50'
                          : 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white border border-blue-400/40'
                      }`}
                      title={`${tgt.actionLabel} operation on ${tgt.name} (${tgt.nerveCost} Nerve)`}
                    >
                      <span className="tracking-wider">{tgt.actionLabel}</span>
                      {tgt.actionLabel !== 'INQUIRE' && (
                        <>
                          <span className="w-px h-3.5 bg-white/30" />
                          <span className="font-mono text-white/90">{tgt.nerveCost}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Floating Action Notification Toast (Zero scrolling required!) */}
      {feedback && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] sm:w-auto px-4 py-3 rounded-2xl bg-neutral-900/95 border border-emerald-500/60 text-emerald-300 font-mono text-xs shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="font-medium text-white">{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
