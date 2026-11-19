'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Dumbbell, Shield, Zap, Target, Flame, Sparkles, Smile, X } from 'lucide-react';
import { BattleStats } from '../types';

export default function TornGymView() {
  const { player, trainStat } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastTrainedStat, setLastTrainedStat] = useState<keyof BattleStats | null>(null);
  const [lastTrainMessage, setLastTrainMessage] = useState<string | null>(null);

  // Happy Jump Multiplier Mechanic (inspired by Torn's legendary Happy Jumps!)
  const happyMultiplier = +(1 + Math.max(0, player.happy) / 120).toFixed(2);

  const handleTrain = (stat: keyof BattleStats, cost: number) => {
    const res = trainStat(stat, cost);
    setFeedback(res.message);
    setLastTrainedStat(stat);
    setLastTrainMessage(res.message);
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const gymWorkouts = [
    {
      stat: 'strength' as keyof BattleStats,
      name: 'Olympic Bench Press & Heavy Deadlifts',
      value: player.battleStats.strength,
      bonus: `+${happyMultiplier}x`,
      desc: 'Increases raw physical strike damage dealt in street combats and muggings.',
      icon: <Dumbbell className="w-5 h-5 text-rose-400" />,
    },
    {
      stat: 'defense' as keyof BattleStats,
      name: 'Impact Resistance & Neck Bridges',
      value: player.battleStats.defense,
      bonus: `+${happyMultiplier}x`,
      desc: 'Absorbs blunt and ballistic damage, mitigating damage suffered when attacked.',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
    },
    {
      stat: 'speed' as keyof BattleStats,
      name: 'Interval Sprints & Agility Cones',
      value: player.battleStats.speed,
      bonus: `+${happyMultiplier}x`,
      desc: 'Determines turn priority, strike hit chance, and ability to outrun pursuit.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      stat: 'dexterity' as keyof BattleStats,
      name: 'Speed Bag & Weapon Handling Drills',
      value: player.battleStats.dexterity,
      bonus: `+${happyMultiplier}x`,
      desc: 'Determines dodge evasion rate, critical strike probability, and aim accuracy.',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const total =
    player.battleStats.strength +
    player.battleStats.defense +
    player.battleStats.speed +
    player.battleStats.dexterity;

  return (
    <div className="space-y-6">
      {/* Gym Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              <h2 className="text-xl font-bold text-white">Titan Iron Core Combat & Training Gym</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Neon Metropolis's premier conditioning dojo. Spend Energy to build Strength, Defense, Speed, and Dexterity.
              Consume high-tier food to boost your Happy for huge <strong>Happy Jump multipliers</strong>!
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500 block text-[10px]">Total Battle Stats</span>
            <span className="text-emerald-400 font-bold text-base">{total} pts</span>
          </div>
        </div>

        {/* Happy Jump Multiplier Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-neutral-950 to-neutral-950 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              <strong>HAPPY JUMP MULTIPLIER:</strong> {happyMultiplier}x Stat Gain Boost!
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-sans">
            (Current Happy: <strong className="text-blue-400">{player.happy}/{player.maxHappy}</strong> • Eat Wagyu Steaks & Cyber Ramen for 3x+ gains!)
          </span>
        </div>

        {feedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Training Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gymWorkouts.map((workout) => {
          const canTrain = player.energy >= 5;

          return (
            <div
              key={workout.stat}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-neutral-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                      {workout.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{workout.name}</h4>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400">
                        {workout.stat}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-white">{workout.value}</span>
                    <span className="text-[11px] text-amber-400 ml-1.5 font-bold">({workout.bonus} boost)</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 my-3 leading-relaxed">{workout.desc}</p>
              </div>

              <button
                onClick={() => handleTrain(workout.stat, 5)}
                disabled={!canTrain}
                className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer ${
                  canTrain
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {canTrain
                  ? `Train Set (5 Energy) -> Gained with ${happyMultiplier}x Multiplier`
                  : 'Need 5 Energy to Train'}
              </button>

              {lastTrainedStat === workout.stat && lastTrainMessage && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono animate-fadeIn flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <span>{lastTrainMessage}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Floating Action Notification Toast (Top positioned to eliminate any mobile dock collision) */}
      {feedback && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92vw] sm:w-auto px-4 py-3 rounded-2xl bg-neutral-900/95 border border-emerald-500/60 text-emerald-300 font-mono text-xs shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-fadeIn">
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
