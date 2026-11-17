'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Crosshair,
  Shield,
  Zap,
  Flame,
  Award,
  AlertTriangle,
  Skull,
  Heart,
  TrendingUp,
  DollarSign,
  UserX,
  Swords,
} from 'lucide-react';
import { CombatTarget } from '../types';

export default function AttackView() {
  const {
    player,
    combatTargets,
    executeAttackRound,
    finishCombatAction,
  } = useGame();

  const [activeTargetId, setActiveTargetId] = useState<string>(combatTargets[0]?.id || 'tgt_punk');
  const [selectedWeapon, setSelectedWeapon] = useState<'FISTS' | 'KNIFE' | 'PISTOL' | 'SMG'>('PISTOL');
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [roundFeedback, setRoundFeedback] = useState<string | null>(null);
  const [victoryTargetId, setVictoryTargetId] = useState<string | null>(null);

  const activeTarget = combatTargets.find((t) => t.id === activeTargetId) || combatTargets[0];

  const handleStrike = () => {
    if (!activeTarget) return;
    const res = executeAttackRound(activeTarget.id, selectedWeapon);
    setRoundFeedback(res.message);
    setCombatLogs((prev) => [res.message, ...prev.slice(0, 15)]);

    if (res.targetDefeated) {
      setVictoryTargetId(activeTarget.id);
    }
  };

  const handleFinish = (action: 'MUG' | 'HOSPITALIZE' | 'LEAVE') => {
    if (!victoryTargetId) return;
    const res = finishCombatAction(victoryTargetId, action);
    setRoundFeedback(res.message);
    setVictoryTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <h2 className="text-xl font-bold text-white">Underworld Attacks & Bounty Hunting</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Engage rival enforcers, rogue detectives, and cartel bosses in turn-based combat. Defeat targets to
              <strong> Mug their pocket cash</strong>, <strong>Hospitalize them</strong> for faction respect, or leave them
              bruised for maximum XP!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-neutral-500 block text-[10px]">Your Energy</span>
              <span className="text-emerald-400 font-bold text-base flex items-center gap-1">
                <Zap className="w-4 h-4 fill-emerald-400" /> {player.energy} / {player.maxEnergy}
              </span>
            </div>

            <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-neutral-500 block text-[10px]">Your Life HP</span>
              <span className="text-rose-400 font-bold text-base flex items-center gap-1">
                <Heart className="w-4 h-4 fill-rose-400" /> {player.life} / {player.maxLife}
              </span>
            </div>
          </div>
        </div>

        {roundFeedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-rose-500/40 text-rose-300 font-mono shadow-sm">
            {roundFeedback}
          </div>
        )}
      </div>

      {/* Target Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
          SELECT WANTED TARGET / BOUNTY:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {combatTargets.map((tgt) => {
            const isSelected = activeTargetId === tgt.id;
            return (
              <button
                key={tgt.id}
                onClick={() => {
                  setActiveTargetId(tgt.id);
                  setVictoryTargetId(null);
                  setRoundFeedback(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-950/50 border-rose-500 text-white shadow-lg ring-1 ring-rose-500'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tgt.avatar}</span>
                  <span className="text-[10px] font-mono font-bold text-rose-400">Lvl {tgt.level}</span>
                </div>
                <h4 className="font-bold text-xs mt-1.5 truncate text-white">{tgt.name}</h4>
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  Bounty: 🌿 {tgt.bountyReward.toLocaleString()} GREEN
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Turn-Based Combat Duel Arena */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Your Combatant Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold block">OPERATIVE (YOU)</span>
                <h3 className="font-bold text-white text-base">{player.name} [{player.xid}]</h3>
              </div>
              <span className="text-3xl">👤</span>
            </div>

            {/* Life Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-neutral-400">
                <span>Health Points</span>
                <span className="text-rose-400 font-bold">{player.life} / {player.maxLife} HP</span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden border border-neutral-800">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(0, (player.life / player.maxLife) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400 pt-1">
              <div>Strength: <strong className="text-white">{player.battleStats.strength}</strong></div>
              <div>Defense: <strong className="text-white">{player.battleStats.defense}</strong></div>
              <div>Speed: <strong className="text-white">{player.battleStats.speed}</strong></div>
              <div>Dexterity: <strong className="text-white">{player.battleStats.dexterity}</strong></div>
            </div>
          </div>

          {/* Target Combatant Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-rose-400 font-bold block">OPPONENT</span>
                <h3 className="font-bold text-white text-base">{activeTarget.name}</h3>
                <span className="text-[10px] text-neutral-400 font-mono">{activeTarget.role}</span>
              </div>
              <span className="text-3xl">{activeTarget.avatar}</span>
            </div>

            {/* Target Life Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-neutral-400">
                <span>Target Health</span>
                <span className="text-rose-400 font-bold">{activeTarget.life} / {activeTarget.maxLife} HP</span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden border border-neutral-800">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(0, (activeTarget.life / activeTarget.maxLife) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400 pt-1">
              <div>Weapon: <strong className="text-amber-400">{activeTarget.weapon}</strong></div>
              <div>Armor: <strong className="text-white">{activeTarget.equippedArmor}</strong></div>
              <div>Pocket GREEN: <strong className="text-emerald-400">🌿 {activeTarget.pocketCash.toLocaleString()} GREEN</strong></div>
              <div>Bounty: <strong className="text-rose-400">🌿 {activeTarget.bountyReward.toLocaleString()} GREEN</strong></div>
            </div>
          </div>
        </div>

        {/* Victory Decision Modal (Triggered when target HP reaches 0) */}
        {victoryTargetId ? (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-neutral-950 border border-emerald-500/60 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <Award className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-mono">
                VICTORY! {activeTarget.name} Is Neutralized
              </h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto mt-1 font-sans">
                Choose what to do with the defeated opponent:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto font-mono text-xs">
              <button
                onClick={() => handleFinish('MUG')}
                className="p-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all cursor-pointer shadow flex flex-col items-center gap-1"
              >
                <DollarSign className="w-5 h-5" />
                <span>Mug GREEN</span>
                <span className="text-[10px] font-normal">Loot ~🌿 {Math.round(activeTarget.pocketCash * 0.75).toLocaleString()} GREEN</span>
              </button>

              <button
                onClick={() => handleFinish('HOSPITALIZE')}
                className="p-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer shadow flex flex-col items-center gap-1"
              >
                <Skull className="w-5 h-5" />
                <span>Hospitalize</span>
                <span className="text-[10px] font-normal">+25 Faction Respect</span>
              </button>

              <button
                onClick={() => handleFinish('LEAVE')}
                className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer shadow flex flex-col items-center gap-1"
              >
                <UserX className="w-5 h-5" />
                <span>Leave on Street</span>
                <span className="text-[10px] font-normal">+100 Max Character XP</span>
              </button>
            </div>
          </div>
        ) : (
          /* Weapon Loadout & Strike Controls */
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <label className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              CHOOSE ATTACK WEAPON:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'FISTS', name: 'Bare Fists', icon: '👊', dmg: 'Base Dmg 22' },
                { id: 'KNIFE', name: 'Trench Knife', icon: '🗡️', dmg: 'Base Dmg 42' },
                { id: 'PISTOL', name: 'Glock 19 Silenced', icon: '🔫', dmg: 'Base Dmg 64' },
                { id: 'SMG', name: 'Suppressed SMG', icon: '⚡', dmg: 'Base Dmg 82' },
              ].map((wpn) => {
                const isSelected = selectedWeapon === wpn.id;
                return (
                  <button
                    key={wpn.id}
                    onClick={() => setSelectedWeapon(wpn.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow ring-1 ring-rose-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xl">{wpn.icon}</div>
                    <h5 className="font-bold text-xs mt-1 text-white">{wpn.name}</h5>
                    <span className="text-[10px] text-neutral-500 font-mono block">{wpn.dmg}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStrike}
              disabled={player.energy < 5 || activeTarget.life <= 0}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider font-mono shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                player.energy >= 5 && activeTarget.life > 0
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/50'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Execute Strike with {selectedWeapon} (-5 Energy)</span>
            </button>
          </div>
        )}

        {/* Live Round Combat Log */}
        {combatLogs.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
              COMBAT ROUND ENGAGEMENT LOGS:
            </span>
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 max-h-40 overflow-y-auto font-mono text-xs">
              {combatLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`text-[11px] leading-relaxed ${
                    idx === 0 ? 'text-rose-300 font-bold' : 'text-neutral-500'
                  }`}
                >
                  › {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
