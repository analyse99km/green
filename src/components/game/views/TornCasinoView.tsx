'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import {
  Dice5,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  RotateCw,
  Coins,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info,
  Check,
  X,
} from 'lucide-react';

type CasinoGameId = 'SLOTS' | 'ROULETTE' | 'HIGH_LOW' | 'CRAPS' | 'BLACKJACK' | 'KENO';

// ── SLOTS SYMBOLS ─────────────────────────────────────────────────────────────
interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
}

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'duck', name: 'Rubber Duck', icon: '🦆', multiplier: 2.0 },
  { id: 'bat', name: 'Baseball Bat', icon: '🏏', multiplier: 2.5 },
  { id: 'knuckles', name: 'Iron Knuckles', icon: '⛓️', multiplier: 2.5 },
  { id: 'smg', name: 'Tactical SMG', icon: '🔫', multiplier: 3.0 },
  { id: 'nuclear', name: 'Nuclear Barrels', icon: '☢️', multiplier: 4.0 },
  { id: 'car', name: 'Sports Roadster', icon: '🏎️', multiplier: 5.0 },
  { id: 'green', name: 'Metropolis GREEN', icon: '🌿', multiplier: 10.0 },
];

// ── ROULETTE POCKETS (0 - 36 European) ─────────────────────────────────────────
interface RoulettePocket {
  num: number;
  color: 'red' | 'black' | 'green';
}

const ROULETTE_POCKETS: RoulettePocket[] = [
  { num: 0, color: 'green' },
  { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' },
  { num: 4, color: 'black' }, { num: 21, color: 'red' }, { num: 2, color: 'black' },
  { num: 25, color: 'red' }, { num: 17, color: 'black' }, { num: 34, color: 'red' },
  { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
  { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' },
  { num: 8, color: 'black' }, { num: 23, color: 'red' }, { num: 10, color: 'black' },
  { num: 5, color: 'red' }, { num: 24, color: 'black' }, { num: 16, color: 'red' },
  { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
  { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' },
  { num: 22, color: 'black' }, { num: 18, color: 'red' }, { num: 29, color: 'black' },
  { num: 7, color: 'red' }, { num: 28, color: 'black' }, { num: 12, color: 'red' },
  { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' }
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// ── PLAYING CARDS (High-Low) ─────────────────────────────────────────────────
interface Card {
  value: number; // 2..14 (Ace = 14)
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  color: 'red' | 'black';
}

function generateRandomCard(): Card {
  const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const ranks: Record<number, string> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  };
  const val = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return {
    value: val,
    rank: ranks[val],
    suit,
    color: suit === '♥' || suit === '♦' ? 'red' : 'black',
  };
}

export default function TornCasinoView() {
  const { player, playCasinoGame } = useGame();
  const [selectedGame, setSelectedGame] = useState<CasinoGameId>('SLOTS');
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [showPayTable, setShowPayTable] = useState(false);

  // Progressive Jackpot ticker
  const [progressiveJackpot, setProgressiveJackpot] = useState(335037754);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgressiveJackpot((prev) => prev + Math.floor(Math.random() * 8) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Beginner's luck & bet balance indicators
  const isNewPlayer = (player.ageDays || 0) <= 3;
  const isLowMoney = player.money <= 500;
  const isBeginnerLuckActive = isNewPlayer && isLowMoney;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. 2D SLOTS STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [reels, setReels] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>([
    SLOT_SYMBOLS[0],
    SLOT_SYMBOLS[1],
    SLOT_SYMBOLS[2],
  ]);
  const [isSpinningSlots, setIsSpinningSlots] = useState(false);
  const [slotsResultMsg, setSlotsResultMsg] = useState<string | null>(null);
  const [slotsWinLine, setSlotsWinLine] = useState(false);

  const handleSpinSlots = () => {
    if (selectedChip > player.money) {
      setSlotsResultMsg('Insufficient pocket GREEN for this spin.');
      return;
    }
    if (isSpinningSlots) return;

    setIsSpinningSlots(true);
    setSlotsResultMsg(null);
    setSlotsWinLine(false);

    // Call game engine
    const result = playCasinoGame('SLOTS', selectedChip);

    // Pick target symbols based on outcome
    let finalReels: [SlotSymbol, SlotSymbol, SlotSymbol];
    if (result.won) {
      // 3 matching or high value
      const luckySym = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      finalReels = [luckySym, luckySym, luckySym];
    } else {
      // Non-matching
      const s1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      let s2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      let s3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      while (s1.id === s2.id && s2.id === s3.id) {
        s3 = SLOT_SYMBOLS[(SLOT_SYMBOLS.indexOf(s3) + 1) % SLOT_SYMBOLS.length];
      }
      finalReels = [s1, s2, s3];
    }

    // Sequentially stop reels
    setTimeout(() => {
      setReels((prev) => [finalReels[0], prev[1], prev[2]]);
    }, 500);

    setTimeout(() => {
      setReels((prev) => [finalReels[0], finalReels[1], prev[2]]);
    }, 900);

    setTimeout(() => {
      setReels(finalReels);
      setIsSpinningSlots(false);
      setSlotsResultMsg(result.message);
      if (result.won) {
        setSlotsWinLine(true);
      }
    }, 1300);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. 2D ROULETTE STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [rouletteBets, setRouletteBets] = useState<{ [key: string]: number }>({});
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [rouletteWinningPocket, setRouletteWinningPocket] = useState<RoulettePocket | null>(null);
  const [rouletteWheelDeg, setRouletteWheelDeg] = useState(0);
  const [rouletteBallDeg, setRouletteBallDeg] = useState(0);
  const [rouletteResultMsg, setRouletteResultMsg] = useState<string | null>(null);

  const totalRouletteBet = Object.values(rouletteBets).reduce((sum, b) => sum + b, 0);

  const placeRouletteBet = (betKey: string) => {
    if (isSpinningRoulette) return;
    if (player.money < totalRouletteBet + selectedChip) {
      setRouletteResultMsg('Insufficient pocket GREEN to place this chip.');
      return;
    }
    setRouletteBets((prev) => ({
      ...prev,
      [betKey]: (prev[betKey] || 0) + selectedChip,
    }));
  };

  const clearRouletteBets = () => {
    if (isSpinningRoulette) return;
    setRouletteBets({});
    setRouletteResultMsg(null);
  };

  const handleSpinRoulette = () => {
    if (totalRouletteBet <= 0) {
      setRouletteResultMsg('Please place at least one bet by clicking a pocket or section on the table.');
      return;
    }
    if (totalRouletteBet > player.money) {
      setRouletteResultMsg('Insufficient pocket GREEN for your placed bets.');
      return;
    }
    if (isSpinningRoulette) return;

    setIsSpinningRoulette(true);
    setRouletteResultMsg(null);

    // Call game engine
    const result = playCasinoGame('ROULETTE', totalRouletteBet);

    // Spin animation degrees
    const extraSpins = 5 * 360;
    const randomPocketIdx = Math.floor(Math.random() * ROULETTE_POCKETS.length);
    const targetPocket = ROULETTE_POCKETS[randomPocketIdx];

    setRouletteWheelDeg((prev) => prev + extraSpins + (randomPocketIdx * (360 / 37)));
    setRouletteBallDeg((prev) => prev - (extraSpins + 180));

    setTimeout(() => {
      setRouletteWinningPocket(targetPocket);
      setIsSpinningRoulette(false);
      setRouletteResultMsg(
        result.won
          ? `🎉 POCKET ${targetPocket.num} (${targetPocket.color.toUpperCase()})! ${result.message}`
          : `POCKET ${targetPocket.num} (${targetPocket.color.toUpperCase()}). ${result.message}`
      );
    }, 2200);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. 2D HIGH-LOW STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [highLowState, setHighLowState] = useState<'IDLE' | 'DEALER_REVEALED' | 'ROUND_OVER'>('IDLE');
  const [dealerCard, setDealerCard] = useState<Card>(generateRandomCard());
  const [playerCard, setPlayerCard] = useState<Card>(generateRandomCard());
  const [highLowBet, setHighLowBet] = useState<number>(10);
  const [currentPot, setCurrentPot] = useState<number>(0);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [highLowMsg, setHighLowMsg] = useState<string | null>(null);
  const [isFlippingPlayerCard, setIsFlippingPlayerCard] = useState(false);

  const startHighLowRound = () => {
    if (highLowBet > player.money) {
      setHighLowMsg('Insufficient pocket GREEN to start High-Low.');
      return;
    }
    const freshDealer = generateRandomCard();
    setDealerCard(freshDealer);
    setPlayerCard(generateRandomCard());
    setCurrentPot(highLowBet);
    setWinStreak(0);
    setHighLowState('DEALER_REVEALED');
    setHighLowMsg(`Dealer dealt ${freshDealer.rank}${freshDealer.suit}. Predict: will your card be HIGHER or LOWER?`);
  };

  const handleHighLowGuess = (guess: 'HIGHER' | 'LOWER') => {
    if (highLowState !== 'DEALER_REVEALED') return;
    setIsFlippingPlayerCard(true);

    const result = playCasinoGame('HIGH_LOW', highLowBet);
    let nextPlayerCard = generateRandomCard();

    // Ensure card aligns with result
    if (result.won) {
      if (guess === 'HIGHER') {
        while (nextPlayerCard.value <= dealerCard.value) nextPlayerCard = generateRandomCard();
      } else {
        while (nextPlayerCard.value >= dealerCard.value) nextPlayerCard = generateRandomCard();
      }
    } else {
      if (guess === 'HIGHER') {
        while (nextPlayerCard.value > dealerCard.value) nextPlayerCard = generateRandomCard();
      } else {
        while (nextPlayerCard.value < dealerCard.value) nextPlayerCard = generateRandomCard();
      }
    }

    setTimeout(() => {
      setPlayerCard(nextPlayerCard);
      setIsFlippingPlayerCard(false);

      if (result.won) {
        const nextStreak = winStreak + 1;
        const newPot = Math.round(currentPot * 1.5 + (nextStreak * 15));
        setWinStreak(nextStreak);
        setCurrentPot(newPot);
        setHighLowState('ROUND_OVER');
        setHighLowMsg(`🎉 CORRECT! Your ${nextPlayerCard.rank}${nextPlayerCard.suit} beat Dealer's ${dealerCard.rank}${dealerCard.suit}! Pot increased to 🌿 ${newPot} GREEN!`);
      } else {
        setHighLowState('IDLE');
        setCurrentPot(0);
        setWinStreak(0);
        setHighLowMsg(`❌ WRONG! Your ${nextPlayerCard.rank}${nextPlayerCard.suit} did not beat Dealer's ${dealerCard.rank}${dealerCard.suit}. House took the pot.`);
      }
    }, 600);
  };

  const handleCashOutHighLow = () => {
    if (currentPot <= 0) return;
    setHighLowState('IDLE');
    setHighLowMsg(`💰 CASHED OUT! Banked +🌿 ${currentPot.toLocaleString()} GREEN!`);
    setCurrentPot(0);
    setWinStreak(0);
  };

  const handleContinueHighLow = () => {
    // Continue streak: player's card becomes the new dealer card!
    setDealerCard(playerCard);
    setPlayerCard(generateRandomCard());
    setHighLowState('DEALER_REVEALED');
    setHighLowMsg(`Round ${winStreak + 1}: Current Dealer card is ${playerCard.rank}${playerCard.suit}. HIGHER or LOWER?`);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* ── TOP CASINO MASTHEAD ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-neutral-900 via-purple-950/40 to-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎰</span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                  Velvet Room • Underworld Games of Chance
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Metropolis High-Stakes 2D Casino
                </h2>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Step onto the velvet tables. Real 2D animated slot reels, wooden roulette wheel physics, and dealer card shoes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono">
            {/* Beginner's Luck Badge */}
            {isBeginnerLuckActive && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Beginner's Luck Active (+24% Win Rate!)</span>
              </div>
            )}

            {/* Pocket Balance */}
            <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800 text-xs">
              <span className="text-[10px] text-neutral-500 block">Pocket Reserves</span>
              <span className="text-emerald-400 font-bold text-base flex items-center gap-1">
                <span>🌿</span>
                <span>{player.money.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-500 font-normal">GREEN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Bet Warning Alert */}
        <div className="mt-4 p-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              <strong>Dynamic Odds:</strong> Small bets (&le; 50 GREEN) yield high win frequency. High bets (&gt; 1k GREEN) face strict house edge!
            </span>
          </div>
          <span className="text-neutral-500 text-[10px]">P2P Audited Randomness</span>
        </div>
      </div>

      {/* ── FLAGSHIP 3-GAME SELECTOR TABS ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 font-mono text-xs">
        <button
          onClick={() => setSelectedGame('SLOTS')}
          className={`py-3 px-3 rounded-xl border font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedGame === 'SLOTS'
              ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-500 text-white shadow-lg shadow-purple-950/50 ring-1 ring-purple-500'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <span className="text-xl">🎰</span>
          <div className="text-center sm:text-left">
            <span className="block font-bold">TORN SLOTS</span>
            <span className="text-[10px] text-purple-300 hidden sm:block">3-Reel Classic</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedGame('ROULETTE')}
          className={`py-3 px-3 rounded-xl border font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedGame === 'ROULETTE'
              ? 'bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <span className="text-xl">🎡</span>
          <div className="text-center sm:text-left">
            <span className="block font-bold">ROULETTE</span>
            <span className="text-[10px] text-emerald-300 hidden sm:block">European Wheel</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedGame('HIGH_LOW')}
          className={`py-3 px-3 rounded-xl border font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedGame === 'HIGH_LOW'
              ? 'bg-gradient-to-r from-amber-900/60 to-yellow-900/60 border-amber-500 text-white shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <span className="text-xl">🃏</span>
          <div className="text-center sm:text-left">
            <span className="block font-bold">HIGH-LOW</span>
            <span className="text-[10px] text-amber-300 hidden sm:block">Dealer Shoe</span>
          </div>
        </button>
      </div>

      {/* ── UNIVERSAL CHIP SELECTOR (10, 100, 1K, 10K, 100K, 1M, 10M) ─────── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Active Betting Chip:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[10, 100, 1000, 10000, 100000, 1000000].map((chip) => {
            const isSelected = selectedChip === chip;
            const chipLabels: Record<number, string> = {
              10: '10',
              100: '100',
              1000: '1K',
              10000: '10K',
              100000: '100K',
              1000000: '1M',
            };
            return (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-mono font-black text-[11px] flex items-center justify-center border-2 transition-transform cursor-pointer shadow-md ${
                  isSelected
                    ? 'border-yellow-400 ring-4 ring-yellow-400/30 scale-110 z-10'
                    : 'border-neutral-700 hover:border-neutral-500 hover:scale-105 opacity-80 hover:opacity-100'
                } ${
                  chip === 10
                    ? 'bg-neutral-800 text-neutral-200'
                    : chip === 100
                    ? 'bg-blue-900 text-blue-200'
                    : chip === 1000
                    ? 'bg-emerald-900 text-emerald-200'
                    : chip === 10000
                    ? 'bg-purple-900 text-purple-200'
                    : chip === 100000
                    ? 'bg-rose-900 text-rose-200'
                    : 'bg-amber-600 text-neutral-950'
                }`}
                title={`Bet ${chip} GREEN`}
              >
                {chipLabels[chip]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 1: 2D TORN SLOTS MACHINE                                         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'SLOTS' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Machine Header with Arch Archways */}
          <div className="text-center relative pb-3 border-b border-neutral-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 mb-1">
              Lucky Shot Casino™ • Min 10 GREEN Bet
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 uppercase">
              ★ TORN $LOT$ ★
            </h3>

            {/* Progressive Jackpot Counter */}
            <div className="mt-2 py-1.5 px-4 rounded-xl bg-black/80 border border-yellow-500/40 inline-block font-mono text-sm sm:text-base font-black text-yellow-400 tracking-wider shadow-inner">
              JACKPOT: 🌿 {progressiveJackpot.toLocaleString()} GREEN
            </div>
          </div>

          {/* 3 Reel Windows with Payline Arrow */}
          <div className="py-6 relative max-w-lg mx-auto">
            {/* Horizontal Payline Arrow */}
            <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-between px-2 transition-all ${
              slotsWinLine ? 'filter drop-shadow(0 0 10px #10b981)' : ''
            }`}>
              <div className="w-4 h-4 text-emerald-400 font-black">▶</div>
              <div className={`flex-1 h-0.5 border-t border-dashed ${
                slotsWinLine ? 'border-emerald-400 animate-pulse' : 'border-neutral-600/70'
              }`} />
              <div className="w-4 h-4 text-emerald-400 font-black">◀</div>
            </div>

            {/* Reel Grid */}
            <div className="grid grid-cols-3 gap-3 bg-black/90 p-4 rounded-2xl border-2 border-neutral-800 shadow-inner">
              {reels.map((sym, idx) => (
                <div
                  key={idx}
                  className={`h-32 sm:h-36 rounded-xl border flex flex-col items-center justify-center p-2 transition-all relative overflow-hidden ${
                    slotsWinLine
                      ? 'bg-emerald-950/40 border-emerald-500/80'
                      : 'bg-neutral-900/90 border-neutral-700/60'
                  }`}
                >
                  <div className={`text-4xl sm:text-5xl transition-transform ${
                    isSpinningSlots ? 'animate-bounce blur-[1px]' : 'scale-100'
                  }`}>
                    {sym.icon}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 mt-2 font-bold truncate max-w-full">
                    {sym.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Slots Actions & Controls */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPayTable(!showPayTable)}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold transition-all cursor-pointer border border-neutral-700 shrink-0"
              >
                {showPayTable ? 'Hide Pay Table' : '📖 Pay Table'}
              </button>

              <button
                onClick={handleSpinSlots}
                disabled={isSpinningSlots}
                className={`flex-1 py-3.5 px-6 rounded-xl font-mono font-black text-sm tracking-wider uppercase transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 ${
                  isSpinningSlots
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 shadow-yellow-950/60 transform active:scale-95'
                }`}
              >
                {isSpinningSlots ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Spinning Reels...</span>
                  </>
                ) : (
                  <>
                    <span>🎰 SPIN (🌿 {selectedChip} GREEN)</span>
                  </>
                )}
              </button>
            </div>

            {/* Pay Table Modal / Drawer */}
            {showPayTable && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center text-white font-bold pb-1 border-b border-neutral-800">
                  <span>Slot Machine Pay Table</span>
                  <span className="text-yellow-400">Payout</span>
                </div>
                <div className="space-y-1 text-neutral-300 text-[11px]">
                  <div className="flex justify-between"><span>3x 🌿 Metropolis GREEN</span><span className="text-yellow-400 font-bold">10.0x + Jackpot</span></div>
                  <div className="flex justify-between"><span>3x 🏎️ Sports Roadster</span><span className="text-yellow-400 font-bold">5.0x</span></div>
                  <div className="flex justify-between"><span>3x ☢️ Nuclear Barrels</span><span className="text-yellow-400 font-bold">4.0x</span></div>
                  <div className="flex justify-between"><span>3x 🔫 Tactical SMG</span><span className="text-yellow-400 font-bold">3.0x</span></div>
                  <div className="flex justify-between"><span>3x ⛓️ Iron Knuckles</span><span className="text-yellow-400 font-bold">2.5x</span></div>
                  <div className="flex justify-between"><span>3x 🏏 Baseball Bat</span><span className="text-yellow-400 font-bold">2.5x</span></div>
                  <div className="flex justify-between"><span>3x 🦆 Rubber Duck</span><span className="text-yellow-400 font-bold">2.0x</span></div>
                </div>
              </div>
            )}

            {/* Result Toast Banner */}
            {slotsResultMsg && (
              <div className={`p-3 rounded-xl font-mono text-xs font-bold text-center border animate-fadeIn ${
                slotsWinLine
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}>
                {slotsResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 2: 2D EUROPEAN ROULETTE TABLE                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'ROULETTE' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="text-center pb-2 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              European Single-Zero Roulette
            </span>
            <h3 className="text-2xl font-black text-white">Classic Velvet Roulette</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* 2D Animated Roulette Wheel */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 border-amber-900/80 bg-neutral-950 shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Rotating Wheel Ring */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-amber-600/40 flex items-center justify-center transition-transform duration-[2200ms] ease-out"
                  style={{ transform: `rotate(${rouletteWheelDeg}deg)` }}
                >
                  {/* Wheel Hub */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-yellow-500 border-2 border-amber-300 shadow-lg flex items-center justify-center text-xs font-mono font-black text-neutral-950">
                    🎡
                  </div>
                </div>

                {/* Rotating Ball */}
                <div
                  className="absolute inset-4 rounded-full pointer-events-none transition-transform duration-[2200ms] ease-out flex items-start justify-center"
                  style={{ transform: `rotate(${rouletteBallDeg}deg)` }}
                >
                  <div className="w-3 h-3 rounded-full bg-neutral-100 shadow-md shadow-white -mt-1.5" />
                </div>
              </div>

              {/* Winning Pocket Result Display */}
              {rouletteWinningPocket && (
                <div className="mt-3 font-mono text-xs font-bold text-center">
                  <span className={`px-3 py-1 rounded-full text-white border ${
                    rouletteWinningPocket.color === 'red'
                      ? 'bg-rose-900 border-rose-500'
                      : rouletteWinningPocket.color === 'black'
                      ? 'bg-neutral-800 border-neutral-600'
                      : 'bg-emerald-800 border-emerald-500'
                  }`}>
                    Pocket: {rouletteWinningPocket.num} ({rouletteWinningPocket.color.toUpperCase()})
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Betting Felt (Matching Image 2 Layout) */}
            <div className="lg:col-span-7 space-y-3 font-mono text-xs select-none">
              {/* Outside Bets Row 1: Low, Even, Red, Black, Odd, High */}
              <div className="grid grid-cols-6 gap-1 text-[11px] font-bold text-center">
                <button onClick={() => placeRouletteBet('1_18')} className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer">
                  1 to 18 {rouletteBets['1_18'] ? `(${rouletteBets['1_18']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('EVEN')} className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer">
                  EVEN {rouletteBets['EVEN'] ? `(${rouletteBets['EVEN']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('RED')} className="p-2 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700 cursor-pointer flex items-center justify-center gap-1">
                  <span>♦ RED</span> {rouletteBets['RED'] ? `(${rouletteBets['RED']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('BLACK')} className="p-2 rounded bg-neutral-950 hover:bg-neutral-900 text-neutral-300 border border-neutral-700 cursor-pointer flex items-center justify-center gap-1">
                  <span>♦ BLACK</span> {rouletteBets['BLACK'] ? `(${rouletteBets['BLACK']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('ODD')} className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer">
                  ODD {rouletteBets['ODD'] ? `(${rouletteBets['ODD']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('19_36')} className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer">
                  19 to 36 {rouletteBets['19_36'] ? `(${rouletteBets['19_36']})` : ''}
                </button>
              </div>

              {/* Numbers Grid (0 on left, 1..36 in 3 rows) */}
              <div className="flex gap-1">
                {/* 0 Pocket */}
                <button
                  onClick={() => placeRouletteBet('0')}
                  className="w-10 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 font-bold flex items-center justify-center cursor-pointer"
                >
                  0 {rouletteBets['0'] ? `(${rouletteBets['0']})` : ''}
                </button>

                {/* 36 Grid Cells */}
                <div className="flex-1 grid grid-cols-12 gap-1 text-[11px] font-bold text-center">
                  {[...Array(36)].map((_, i) => {
                    const num = i + 1;
                    const isRed = RED_NUMBERS.includes(num);
                    const betOnNum = rouletteBets[`num_${num}`];
                    return (
                      <button
                        key={num}
                        onClick={() => placeRouletteBet(`num_${num}`)}
                        className={`h-9 rounded border flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                          isRed
                            ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-800 text-rose-200'
                            : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-200'
                        }`}
                      >
                        <span>{num}</span>
                        {betOnNum && <span className="text-[9px] text-yellow-400">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dozens Row */}
              <div className="grid grid-cols-3 gap-1 text-[11px] font-bold text-center">
                <button onClick={() => placeRouletteBet('1st_12')} className="p-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer">
                  1st 12 {rouletteBets['1st_12'] ? `(${rouletteBets['1st_12']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('2nd_12')} className="p-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer">
                  2nd 12 {rouletteBets['2nd_12'] ? `(${rouletteBets['2nd_12']})` : ''}
                </button>
                <button onClick={() => placeRouletteBet('3rd_12')} className="p-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer">
                  3rd 12 {rouletteBets['3rd_12'] ? `(${rouletteBets['3rd_12']})` : ''}
                </button>
              </div>

              {/* Actions: Clear Bets & Spin Wheel */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-xs">Total Wager:</span>
                  <span className="text-emerald-400 font-bold text-sm">🌿 {totalRouletteBet} GREEN</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearRouletteBets}
                    disabled={isSpinningRoulette || totalRouletteBet === 0}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 font-bold text-xs cursor-pointer"
                  >
                    Clear Bets
                  </button>

                  <button
                    onClick={handleSpinRoulette}
                    disabled={isSpinningRoulette || totalRouletteBet === 0}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer flex items-center gap-1.5 ${
                      isSpinningRoulette
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                    }`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isSpinningRoulette ? 'animate-spin' : ''}`} />
                    <span>Spin Wheel</span>
                  </button>
                </div>
              </div>

              {rouletteResultMsg && (
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-bold text-xs text-neutral-200">
                  {rouletteResultMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 3: 2D HIGH-LOW (DEALER SHOE)                                     */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'HIGH_LOW' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Circular Beach / Velvet Header matching Image 3 */}
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
              Lucky Shot Casino • High-Low Shoe
            </span>
            <h3 className="text-2xl font-black text-white font-serif tracking-wide">
              High-Low Card Arena
            </h3>
          </div>

          <div className="max-w-md mx-auto py-6 space-y-6">
            {/* Dealer Card vs Player Card Stage */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {/* Dealer's Card */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-bold text-neutral-400">Dealer's Card</span>
                <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-neutral-100 text-neutral-950 p-2.5 shadow-2xl border-2 border-neutral-300 flex flex-col justify-between font-mono font-black select-none">
                  {highLowState !== 'IDLE' ? (
                    <>
                      <div className={`text-base leading-none ${dealerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {dealerCard.rank} {dealerCard.suit}
                      </div>
                      <div className={`text-4xl text-center ${dealerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {dealerCard.suit}
                      </div>
                      <div className={`text-base leading-none text-right ${dealerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {dealerCard.rank}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-3xl font-serif text-neutral-400">
                      🂠
                    </div>
                  )}
                </div>
              </div>

              <div className="text-2xl font-black text-neutral-600">VS</div>

              {/* Your Card */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-bold text-neutral-400">Your Card</span>
                <div className={`w-24 h-36 sm:w-28 sm:h-40 rounded-2xl p-2.5 shadow-2xl border-2 flex flex-col justify-between font-mono font-black select-none transition-transform duration-300 ${
                  isFlippingPlayerCard ? 'rotate-y-90 scale-90' : ''
                } ${
                  highLowState === 'ROUND_OVER'
                    ? 'bg-neutral-100 text-neutral-950 border-neutral-300'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}>
                  {highLowState === 'ROUND_OVER' ? (
                    <>
                      <div className={`text-base leading-none ${playerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {playerCard.rank} {playerCard.suit}
                      </div>
                      <div className={`text-4xl text-center ${playerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {playerCard.suit}
                      </div>
                      <div className={`text-base leading-none text-right ${playerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {playerCard.rank}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-3xl font-serif text-amber-500/70">
                      ★ T ★
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Pot & Modifier Display (Matching Image 3) */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center font-mono space-y-1">
              <span className="text-[10px] text-neutral-500 block uppercase">Accumulated Pot</span>
              <div className="text-xl font-black text-amber-400">
                🌿 {currentPot.toLocaleString()} GREEN
              </div>
              <div className="text-[11px] text-neutral-400">
                ({winStreak} wins in a row) • Current modifier: <span className="text-emerald-400 font-bold">{25 + (winStreak * 25)}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 font-mono">
              {highLowState === 'IDLE' && (
                <button
                  onClick={startHighLowRound}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Deal Cards (Wager: 🌿 {selectedChip} GREEN)
                </button>
              )}

              {highLowState === 'DEALER_REVEALED' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleHighLowGuess('HIGHER')}
                    className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow cursor-pointer"
                  >
                    ▲ HIGHER
                  </button>
                  <button
                    onClick={() => handleHighLowGuess('LOWER')}
                    className="py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow cursor-pointer"
                  >
                    ▼ LOWER
                  </button>
                </div>
              )}

              {highLowState === 'ROUND_OVER' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCashOutHighLow}
                    className="py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
                  >
                    💰 Cash Out (+🌿 {currentPot})
                  </button>
                  <button
                    onClick={handleContinueHighLow}
                    className="py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase tracking-wider transition-all border border-neutral-700 cursor-pointer"
                  >
                    🃏 Double & Next Card →
                  </button>
                </div>
              )}

              {highLowMsg && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs font-bold text-neutral-200">
                  {highLowMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
