'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Shield,
  Lock,
  Unlock,
  TrendingDown,
  Briefcase,
  Users,
  Flame,
  Zap,
  Heart,
  Smile,
  ArrowUpCircle,
  Edit2,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

import { SoundEngine } from '../gameAudio';

interface TornHomeViewProps {
  onNavigate?: (view: string) => void;
}

export default function TornHomeView({ onNavigate }: TornHomeViewProps) {
  const {
    player,
    togglePropertyLock,
    upgradeVital,
    updatePlayerName,
  } = useGame();
  const [upgradeFeedback, setUpgradeFeedback] = useState<string | null>(null);
  const [lastUpgradedVital, setLastUpgradedVital] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.name || '');
  const currentProperty = player.properties.find((p) => p.id === player.currentPropertyId);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    updatePlayerName(nameInput.trim());
    setIsEditingName(false);
  };

  const handleUpgrade = (vital: 'maxEnergy' | 'maxLife' | 'maxNerve' | 'maxHappy') => {
    const res = upgradeVital(vital);
    setUpgradeFeedback(res.message);
    setLastUpgradedVital(vital);
    setTimeout(() => setUpgradeFeedback(null), 3500);
  };

  const energyCost = Math.round((player.maxEnergy || 20) * 6);
  const lifeCost = Math.round((player.maxLife || 100) * 6);
  const nerveCost = Math.round((player.maxNerve || 10) * 6);
  const happyCost = Math.round((player.maxHappy || 50) * 6);

  return (
    <div className="space-y-4">
      {/* Metropolis Ticker Notice */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 px-4 flex items-center justify-between text-xs font-mono">
        <span className="flex items-center gap-1.5 text-neutral-300">
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          The market value of Megaphone index is trending at 🌿 29,741 GREEN this week.
        </span>
        <span className="text-[10px] text-neutral-500">Metropolis Wire Feed</span>
      </div>

      {/* Operative Identity & Custom Codename Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-xl text-emerald-400 shrink-0 font-black shadow-inner">
            👤
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-emerald-500 text-white font-mono font-bold text-xs outline-hidden"
                    placeholder="Enter Operative Name"
                    maxLength={24}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer flex items-center gap-1 font-mono px-2"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(player.name || '');
                    }}
                    className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs cursor-pointer font-mono px-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                    {player.name}
                  </h2>
                  <span className="font-mono text-xs text-neutral-400">[{player.xid}]</span>
                  <button
                    onClick={() => {
                      setNameInput(player.name || '');
                      setIsEditingName(true);
                    }}
                    className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Change Operative Name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mt-1 flex-wrap">
              <span className="px-2 py-0.2 rounded bg-neutral-800 text-emerald-400 border border-emerald-500/20 text-[10px]">
                {player.rank || '#1 Green Recruit'}
              </span>
              <span>•</span>
              <span className="text-[11px] text-neutral-400">Role: <strong className="text-neutral-200">{player.role}</strong></span>
              <span>•</span>
              <span className="text-[11px] text-neutral-400">Age: <strong className="text-neutral-200">{player.ageDays} day{player.ageDays === 1 ? '' : 's'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-right">
            <span className="text-[10px] text-neutral-500 block">Liquid GREEN</span>
            <span className="font-bold text-emerald-400">🌿 {(player.money || 0).toLocaleString()}</span>
          </div>
          <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-right">
            <span className="text-[10px] text-neutral-500 block">Bank Vault</span>
            <span className="font-bold text-neutral-200">🌿 {(player.bankMoney || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>



      {/* Level-Up & Attribute Points Allocation Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-indigo-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ArrowUpCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Level-Up Vitals & Attribute Allocation
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {player.unallocatedStatPoints} Point{player.unallocatedStatPoints === 1 ? '' : 's'} Available
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Permanently enhance your vital capacities using level advancement points and GREEN coins. No upper limit!
              </p>
            </div>
          </div>

          <div className="font-mono text-xs text-neutral-400">
            Player Level: <strong className="text-white">{player.level}</strong> • XP: {player.xp}/{player.xpNeeded}
          </div>
        </div>

        {upgradeFeedback && (
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono text-center font-bold">
            {upgradeFeedback}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Max Energy Upgrade (+1) */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Max Energy
                </span>
                <span>{player.maxEnergy}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">+1 Max Cap</span>
              <span className="text-[9px] text-emerald-400/90 font-mono block">Cost: 🌿 {energyCost} GREEN + 1pt</span>
            </div>

            <button
              onClick={() => handleUpgrade('maxEnergy')}
              className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow active:scale-95 ${
                player.unallocatedStatPoints > 0 && player.money >= energyCost
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700/60'
              }`}
            >
              +1 Energy
            </button>

            {lastUpgradedVital === 'maxEnergy' && upgradeFeedback && (
              <div className="p-1 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono text-center animate-fadeIn">
                {upgradeFeedback}
              </div>
            )}
          </div>

          {/* Max Nerve Upgrade (+1) */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Max Nerve
                </span>
                <span>{player.maxNerve}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">+1 Max Cap</span>
              <span className="text-[9px] text-amber-400/90 font-mono block">Cost: 🌿 {nerveCost} GREEN + 1pt</span>
            </div>

            <button
              onClick={() => handleUpgrade('maxNerve')}
              className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow active:scale-95 ${
                player.unallocatedStatPoints > 0 && player.money >= nerveCost
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700/60'
              }`}
            >
              +1 Nerve
            </button>

            {lastUpgradedVital === 'maxNerve' && upgradeFeedback && (
              <div className="p-1 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono text-center animate-fadeIn">
                {upgradeFeedback}
              </div>
            )}
          </div>

          {/* Max Happy Upgrade (+5) */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-blue-400 font-bold">
                <span className="flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5" /> Max Happy
                </span>
                <span>{player.maxHappy}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">+5 Max Cap</span>
              <span className="text-[9px] text-blue-400/90 font-mono block">Cost: 🌿 {happyCost} GREEN + 1pt</span>
            </div>

            <button
              onClick={() => handleUpgrade('maxHappy')}
              className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow active:scale-95 ${
                player.unallocatedStatPoints > 0 && player.money >= happyCost
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700/60'
              }`}
            >
              +5 Happy
            </button>

            {lastUpgradedVital === 'maxHappy' && upgradeFeedback && (
              <div className="p-1 rounded bg-blue-950/90 border border-blue-500/50 text-blue-300 text-[10px] font-mono text-center animate-fadeIn">
                {upgradeFeedback}
              </div>
            )}
          </div>

          {/* Max Life Upgrade (+10) */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-rose-400 font-bold">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> Max Life
                </span>
                <span>{player.maxLife}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">+10 HP Max</span>
              <span className="text-[9px] text-rose-400/90 font-mono block">Cost: 🌿 {lifeCost} GREEN + 1pt</span>
            </div>

            <button
              onClick={() => handleUpgrade('maxLife')}
              className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow active:scale-95 ${
                player.unallocatedStatPoints > 0 && player.money >= lifeCost
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700/60'
              }`}
            >
              +10 Life
            </button>

            {lastUpgradedVital === 'maxLife' && upgradeFeedback && (
              <div className="p-1 rounded bg-rose-950/90 border border-rose-500/50 text-rose-300 text-[10px] font-mono text-center animate-fadeIn">
                {upgradeFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Information Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>General Information</span>
          <span className="text-xs font-mono font-normal text-emerald-400">
            {player.role === 'CITIZEN' ? 'Civilian (Study for Professions)' : player.role}
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">Name & ID</span>
            <span className="font-bold text-white">{player.name} [{player.xid}]</span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">Rank & Level</span>
            <span className="font-bold text-neutral-200">Level {player.level} • {player.rank}</span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">Age & Status</span>
            <span className="font-bold text-neutral-300">{player.ageDays} Days • {player.maritalStatus}</span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">Networth</span>
            <span className="font-bold text-emerald-400 font-mono">🌿 {player.networth.toLocaleString()} GREEN</span>
          </div>
        </div>
      </div>

      {/* Property Information Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Property Information</h3>
            <span className="text-xs text-neutral-400">
              {currentProperty?.name} (Deed: 🌿 {currentProperty?.cost.toLocaleString()} GREEN) • Upkeep: 🌿 {currentProperty?.upkeepPerDay}/day
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => currentProperty && togglePropertyLock(currentProperty.id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                currentProperty?.isLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              }`}
            >
              {currentProperty?.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{currentProperty?.isLocked ? 'DOOR LOCKED (SAFE)' : 'DOOR UNLOCKED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Equipped Weapons & Armor + Perks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Equipped Combat Gear */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Equipped Weapons & Armor</h3>
          <div className="space-y-2">
            {player.inventory.filter((i) => i.equipped).map((item) => (
              <div key={item.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <span className="font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] text-neutral-400 uppercase">{item.category}</span>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  {item.damage && <span className="text-rose-400 font-bold block">Dmg: {item.damage}</span>}
                  {item.accuracy && <span className="text-blue-400 block">Acc: {item.accuracy}</span>}
                  {item.defense && <span className="text-emerald-400 block">Def: {item.defense}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Perks */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Personal Perks</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2">
              <span className="text-lg">🕶️</span>
              <span className="text-neutral-300">Enhancer: +5% Search for cash crime exp & skill gain (Glasses)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2">
              <span className="text-lg">📢</span>
              <span className="text-neutral-300">Enhancer: +5% Hustling crime exp & skill gain (Megaphone)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span className="text-emerald-300">Property Perk: Vault protection against street mugging when resting.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Information & Faction Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-xs font-mono">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Job Information
            </h3>
            <span className="text-emerald-400 font-bold">+🌿 25,000 GREEN / day</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
            <div>Company: <strong className="text-white">{player.job.companyName}</strong> ({player.job.companyType})</div>
            <div>Position: <strong className="text-neutral-200">{player.job.position}</strong></div>
            <div>Job Points: <strong className="text-amber-400">{player.job.jobPoints}</strong></div>
            <div>Days in Company: <strong className="text-neutral-300">{player.job.daysInCompany}</strong></div>
          </div>
        </div>

        {/* Faction */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-xs font-mono">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Faction Information
            </h3>
            <span className="text-amber-400 font-bold">★ {player.faction.respect.toLocaleString()} Respect</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
            <div>Faction: <strong className="text-white">[{player.faction.tag}] {player.faction.name}</strong></div>
            <div>Members: <strong className="text-neutral-200">{player.faction.membersCount}</strong></div>
            <div>Days in Faction: <strong className="text-neutral-300">{player.faction.daysInFaction}</strong></div>
            <div>Territory: <strong className="text-neutral-400">{player.faction.territory}</strong></div>
          </div>
        </div>
      </div>

      {/* Criminal Record & Crimes 2.0 Skill Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Criminal Record */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-xs font-mono">
          <h3 className="font-bold text-white mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> Criminal Record
          </h3>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex justify-between font-bold text-neutral-200">
              <span>Criminal Offenses:</span>
              <span className="text-rose-400">{player.criminalRecord.totalOffenses}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Theft:</span>
              <span className="text-white">{player.criminalRecord.theft}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Counterfeiting:</span>
              <span className="text-white">{player.criminalRecord.counterfeiting}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Vandalism:</span>
              <span className="text-white">{player.criminalRecord.vandalism}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Fraud:</span>
              <span className="text-white">{player.criminalRecord.fraud}</span>
            </div>
          </div>
        </div>

        {/* Skill Levels (Crimes 2.0) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-xs font-mono">
          <h3 className="font-bold text-white mb-3">Crimes 2.0 Skill Levels</h3>
          <div className="space-y-2">
            {Object.entries(player.criminalSkills).map(([skill, val]) => (
              <div key={skill}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="capitalize text-neutral-400">{skill.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold text-amber-400">{val.toFixed(2)}</span>
                </div>
                <div className="w-full bg-neutral-950 rounded h-1.5 overflow-hidden border border-neutral-800">
                  <div
                    className="bg-amber-500 h-full rounded"
                    style={{ width: `${Math.min(100, (val / 30) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Floating Action Notification Toast */}
      {upgradeFeedback && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] sm:w-auto px-4 py-3 rounded-2xl bg-neutral-900/95 border border-emerald-500/60 text-emerald-300 font-mono text-xs shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="font-medium text-white">{upgradeFeedback}</span>
          </div>
          <button
            onClick={() => setUpgradeFeedback(null)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
