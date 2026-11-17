'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Dice5,
  Sparkles,
  DollarSign,
  TrendingUp,
  CircleDot,
  Trophy,
  Flame,
  Club,
} from 'lucide-react';

type CasinoGameId = 'SLOTS' | 'ROULETTE' | 'HIGH_LOW' | 'KENO' | 'CRAPS' | 'BOOKIE' | 'LOTTERY' | 'BLACKJACK';

interface CasinoGameMeta {
  id: CasinoGameId;
  name: string;
  icon: string;
  multiplier: string;
  oddsDesc: string;
  description: string;
}

const CASINO_GAMES: CasinoGameMeta[] = [
  {
    id: 'SLOTS',
    name: 'Slots (Triple 7s)',
    icon: '🎰',
    multiplier: '3.0x',
    oddsDesc: '45% Win Rate',
    description: 'Line up cherries, bells, and golden 7s for high-volatility payouts.',
  },
  {
    id: 'ROULETTE',
    name: 'Roulette (Red / Black)',
    icon: '🎡',
    multiplier: '2.0x',
    oddsDesc: '48% Win Rate',
    description: 'Place your wager on Red or Black as the wheel spins around the peg.',
  },
  {
    id: 'HIGH_LOW',
    name: 'High-Low',
    icon: '🃏',
    multiplier: '2.0x',
    oddsDesc: '50% Win Rate',
    description: 'Predict whether the next card drawn from the shoe is higher or lower.',
  },
  {
    id: 'CRAPS',
    name: 'Craps (Underground Dice)',
    icon: '🎲',
    multiplier: '2.0x',
    oddsDesc: '49% Win Rate',
    description: 'Roll the bones on the velvet felt. Pass line wins on lucky 7s.',
  },
  {
    id: 'KENO',
    name: 'Keno Matrix',
    icon: '🔢',
    multiplier: '4.0x',
    oddsDesc: '40% Win Rate',
    description: 'High payout lottery matrix. Match balls drawn from the cage.',
  },
  {
    id: 'BLACKJACK',
    name: 'Blackjack 21',
    icon: '♠️',
    multiplier: '2.0x',
    oddsDesc: '49% Win Rate',
    description: 'Play against the house dealer. Closest to 21 without busting takes the pot.',
  },
  {
    id: 'BOOKIE',
    name: 'Bookie (Street Sports)',
    icon: '🏇',
    multiplier: '2.2x',
    oddsDesc: '46% Win Rate',
    description: 'Wager on underground cage matches and faction drag races.',
  },
  {
    id: 'LOTTERY',
    name: 'Quick Scratchers',
    icon: '🎟️',
    multiplier: '10.0x',
    oddsDesc: '15% Win Rate',
    description: 'Scratch 3 matching syndicate symbols for a massive 10x jackpot payout.',
  },
];

export default function TornCasinoView() {
  const { player, playCasinoGame } = useGame();
  const [selectedGame, setSelectedGame] = useState<CasinoGameId>('CRAPS');
  const [betAmount, setBetAmount] = useState('1000');
  const [gameResult, setGameResult] = useState<{ won: boolean; message: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const currentGameMeta = CASINO_GAMES.find((g) => g.id === selectedGame) || CASINO_GAMES[0];

  const handlePlayGame = () => {
    const bet = parseInt(betAmount, 10);
    if (!bet || bet <= 0) {
      setGameResult({ won: false, message: 'Please enter a valid bet amount.' });
      return;
    }
    if (bet > player.money) {
      setGameResult({ won: false, message: 'Insufficient pocket cash for this wager.' });
      return;
    }

    setIsSpinning(true);
    setGameResult(null);

    setTimeout(() => {
      const res = playCasinoGame(selectedGame, bet);
      setGameResult({ won: res.won, message: res.message });
      setIsSpinning(false);
    }, 400);
  };

  const setPresetBet = (val: number) => {
    setBetAmount(Math.min(player.money, val).toString());
  };

  return (
    <div className="space-y-6">
      {/* Casino Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-purple-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎰</span>
              <h2 className="text-xl font-bold text-white">Metropolis Red-Light Casino & Sportsbook</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Step into the neon-lit velvet tables. Bet your pocket cash on 8 authentic games: Slots, Roulette,
              High-Low, Keno, Craps, Blackjack, Bookie, and Lottery Scratchers.
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500 block text-[10px]">Your Pocket GREEN</span>
            <span className="text-emerald-400 font-bold text-base font-mono">🌿 {player.money.toLocaleString()} GREEN</span>
          </div>
        </div>
      </div>

      {/* Game Selection Grid (8 Classic Casino Games) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CASINO_GAMES.map((game) => {
          const isSelected = selectedGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => {
                setSelectedGame(game.id);
                setGameResult(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg ring-1 ring-purple-500'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{game.icon}</span>
                <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded">
                  {game.multiplier}
                </span>
              </div>
              <h4 className="text-xs font-bold mt-2 truncate">{game.name}</h4>
              <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{game.oddsDesc}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Casino Table */}
      <div className="max-w-xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
        {/* Table Felt Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
            {currentGameMeta.icon}
          </div>
          <h3 className="text-lg font-bold text-white font-mono">{currentGameMeta.name}</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-sans">
            {currentGameMeta.description}
          </p>
          <div className="flex justify-center gap-3 text-xs font-mono pt-1">
            <span className="text-purple-300">Payout: {currentGameMeta.multiplier}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-emerald-400">Odds: {currentGameMeta.oddsDesc}</span>
          </div>
        </div>

        {/* Wager Presets */}
        <div className="space-y-3">
          <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
            Choose Your Wager Amount
          </label>

          <div className="flex flex-wrap justify-center gap-2">
            {[100, 500, 1000, 5000, 25000].map((preset) => (
              <button
                key={preset}
                onClick={() => setPresetBet(preset)}
                className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-mono font-bold text-neutral-300 hover:text-white hover:border-purple-500 transition-all cursor-pointer"
              >
                🌿 {preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
            <button
              onClick={() => setPresetBet(player.money)}
              className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800 text-[11px] font-mono font-bold text-purple-300 hover:bg-purple-900 transition-all cursor-pointer"
            >
              Max All-In
            </button>
          </div>

          <div className="relative max-w-xs mx-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono text-sm">🌿</span>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-4 py-2.5 text-center text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Bet Amount"
            />
          </div>
        </div>

        {/* Play Action Button */}
        <button
          onClick={handlePlayGame}
          disabled={isSpinning}
          className={`w-full max-w-xs mx-auto py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider font-mono shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isSpinning
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
          }`}
        >
          {isSpinning ? (
            <>
              <Dice5 className="w-4 h-4 animate-spin" /> Rolling / Dealing...
            </>
          ) : (
            `Place Wager on ${selectedGame}`
          )}
        </button>

        {/* Result Message Banner */}
        {gameResult && (
          <div
            className={`p-3.5 rounded-xl text-xs font-mono font-bold border transition-all ${
              gameResult.won
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-md'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-md'
            }`}
          >
            {gameResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
