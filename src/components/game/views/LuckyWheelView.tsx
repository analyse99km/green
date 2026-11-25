'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { Sparkles, Trophy, Gift, RotateCw, DollarSign, Zap, Award } from 'lucide-react';
import { SoundEngine } from '../gameAudio';

export default function LuckyWheelView() {
  const { player, spinDailyWheel, deductMoney } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [lastReward, setLastReward] = useState<string | null>(null);

  const prizes = [
    { label: '🌿 500 GREEN', color: '#10b981', icon: '🌿' },
    { label: '+50 Energy', color: '#06b6d4', icon: '⚡' },
    { label: 'Gold Ring', color: '#f59e0b', icon: '💍' },
    { label: '🌿 250 GREEN', color: '#10b981', icon: '🌿' },
    { label: '+25 Happy', color: '#3b82f6', icon: '😊' },
    { label: 'Lockpick', color: '#6366f1', icon: '🗝️' },
    { label: '🌿 1,000 GREEN', color: '#8b5cf6', icon: '💎' },
    { label: 'Adrenaline Stim', color: '#ec4899', icon: '💉' },
    { label: '🌿 100 GREEN', color: '#10b981', icon: '🌿' },
    { label: '+100 Energy', color: '#06b6d4', icon: '⚡' },
    { label: '🌿 10,000 GREEN JACKPOT', color: '#eab308', icon: '👑' },
    { label: 'Wagyu Steak', color: '#f97316', icon: '🥩' },
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    if (player.dailyWheelSpinsAvailable <= 0 && player.money < 100) {
      setLastReward('Need 1 Daily Free Spin or 🌿 100 GREEN to spin!');
      return;
    }

    // Deduct GREEN if no free spins
    if (player.dailyWheelSpinsAvailable <= 0) {
      const ok = deductMoney(100, 'Lucky Wheel Spin');
      if (!ok) return;
    }

    setIsSpinning(true);
    setLastReward(null);

    // Random spin (at least 5 full rotations + random angle)
    const extraSpins = 360 * 5;
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotationDegrees + extraSpins + randomAngle;
    setRotationDegrees(totalRotation);

    // Audio clicks during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      SoundEngine.playTick(player.soundEnabled);
      tickCount++;
      if (tickCount >= 18) clearInterval(tickInterval);
    }, 180);

    setTimeout(() => {
      setIsSpinning(false);
      const res = spinDailyWheel();
      setLastReward(res.rewardText);
    }, 3800);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎡</span>
              <h2 className="text-xl font-bold text-white">Metropolis Daily Wheel of Fortune</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Spin daily to claim tactical stimulants, rare signet rings, energy surges, and the
              <strong> 🌿 10,000 GREEN Grand Jackpot</strong>! Citizens receive 1 complimentary spin every 24 hours.
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500 block text-[10px]">Free Spins Remaining</span>
            <span className="text-amber-400 font-bold text-base">
              {player.dailyWheelSpinsAvailable} Spin{player.dailyWheelSpinsAvailable === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {lastReward && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-amber-500/50 text-amber-300 font-mono text-center shadow-lg">
            🎉 PRIZE REVEAL: {lastReward}
          </div>
        )}
      </div>

      {/* Wheel Board Container */}
      <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
        {/* Pointer Arrow */}
        <div className="relative flex justify-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 z-20 drop-shadow-md" />
        </div>

        {/* Visual Wheel Canvas */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/40 shadow-2xl overflow-hidden relative"
            style={{
              transform: `rotate(${rotationDegrees}deg)`,
              transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              background: 'conic-gradient(#10b981 0deg 30deg, #06b6d4 30deg 60deg, #f59e0b 60deg 90deg, #3b82f6 90deg 120deg, #8b5cf6 120deg 150deg, #ec4899 150deg 180deg, #10b981 180deg 210deg, #06b6d4 210deg 240deg, #f59e0b 240deg 270deg, #6366f1 270deg 300deg, #eab308 300deg 330deg, #f97316 330deg 360deg)',
            }}
          >
            {/* Center Hub */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center shadow-inner z-10 text-white font-mono font-bold text-xs">
                SPIN
              </div>
            </div>
          </div>
        </div>

        {/* Spin Actions */}
        <div className="space-y-3 max-w-xs mx-auto">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : player.dailyWheelSpinsAvailable > 0
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 shadow-amber-950/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning
                ? 'Spinning Wheel...'
                : player.dailyWheelSpinsAvailable > 0
                ? 'Spin Free Daily Wheel'
                : 'Spin Again (🌿 100 GREEN)'}
            </span>
          </button>

          <p className="text-[10px] text-neutral-500 font-mono">
            {player.dailyWheelSpinsAvailable > 0
              ? '✓ Daily free spin ready to claim.'
              : 'Free spins replenish every 24 hours. Extra spins cost 🌿 100 GREEN.'}
          </p>
        </div>
      </div>
    </div>
  );
}
