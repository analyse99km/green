'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { SoundEngine } from '../gameAudio';
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
  Volume2,
  VolumeX,
} from 'lucide-react';

type CasinoGameId =
  | 'SLOTS'
  | 'ROULETTE'
  | 'HIGH_LOW'
  | 'BLACKJACK'
  | 'CRAPS'
  | 'KENO'
  | 'LOTTERY'
  | 'BOOKIE';

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

// ── PLAYING CARDS ─────────────────────────────────────────────────────────────
interface Card {
  value: number; // 2..14 (Ace = 14 or 11 in blackjack)
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

// Calculate blackjack hand total with Aces
function calculateBlackjackTotal(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J', '10'].includes(c.rank)) {
      total += 10;
    } else {
      total += c.value;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
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

  const handleSelectChip = (amount: number) => {
    setSelectedChip(amount);
    SoundEngine.playChipClick(player.soundEnabled);
  };

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
      SoundEngine.playLoss(player.soundEnabled);
      return;
    }
    if (isSpinningSlots) return;

    setIsSpinningSlots(true);
    setSlotsResultMsg(null);
    setSlotsWinLine(false);

    // Rapid mechanical ticking sound during spinning
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      SoundEngine.playReelTick(player.soundEnabled);
      tickCount++;
      if (tickCount > 12) clearInterval(tickInterval);
    }, 90);

    // Call game engine
    const result = playCasinoGame('SLOTS', selectedChip);

    // Pick target symbols based on outcome
    let finalReels: [SlotSymbol, SlotSymbol, SlotSymbol];
    if (result.won) {
      const luckySym = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      finalReels = [luckySym, luckySym, luckySym];
    } else {
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
      SoundEngine.playReelTick(player.soundEnabled);
    }, 500);

    setTimeout(() => {
      setReels((prev) => [finalReels[0], finalReels[1], prev[2]]);
      SoundEngine.playReelTick(player.soundEnabled);
    }, 900);

    setTimeout(() => {
      setReels(finalReels);
      setIsSpinningSlots(false);
      setSlotsResultMsg(result.message);
      if (result.won) {
        setSlotsWinLine(true);
        if (finalReels[0].id === 'green') {
          SoundEngine.playJackpot(player.soundEnabled);
        } else {
          SoundEngine.playVictory(player.soundEnabled);
        }
      } else {
        SoundEngine.playLoss(player.soundEnabled);
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

  const totalRouletteBet = Object.values(rouletteBets).reduce((acc, v) => acc + v, 0);

  const placeRouletteBet = (spot: string) => {
    if (isSpinningRoulette) return;
    if (totalRouletteBet + selectedChip > player.money) {
      setRouletteResultMsg('Insufficient pocket GREEN for this bet.');
      return;
    }
    setRouletteBets((prev) => ({
      ...prev,
      [spot]: (prev[spot] || 0) + selectedChip,
    }));
    SoundEngine.playChipClick(player.soundEnabled);
  };

  const clearRouletteBets = () => {
    if (isSpinningRoulette) return;
    setRouletteBets({});
    setRouletteResultMsg(null);
    SoundEngine.playChipClick(player.soundEnabled);
  };

  const handleSpinRoulette = () => {
    if (totalRouletteBet <= 0) {
      setRouletteResultMsg('Place at least one chip on the table felt.');
      return;
    }
    if (totalRouletteBet > player.money) {
      setRouletteResultMsg('Insufficient pocket GREEN.');
      return;
    }
    if (isSpinningRoulette) return;

    setIsSpinningRoulette(true);
    setRouletteResultMsg(null);

    // Call game engine
    const result = playCasinoGame('ROULETTE', totalRouletteBet);

    // Pick winning pocket
    const winPocketIndex = Math.floor(Math.random() * ROULETTE_POCKETS.length);
    const winPocket = ROULETTE_POCKETS[winPocketIndex];

    // Rhythmic deceleration ticking sound for wheel
    let wheelTicks = 0;
    const tickTimer = setInterval(() => {
      SoundEngine.playWheelTick(player.soundEnabled);
      wheelTicks++;
      if (wheelTicks > 15) clearInterval(tickTimer);
    }, 120);

    // Rotate wheel and ball
    const extraRotations = 1440 + winPocketIndex * (360 / ROULETTE_POCKETS.length);
    setRouletteWheelDeg((prev) => prev + extraRotations);
    setRouletteBallDeg((prev) => prev - (extraRotations + 180));

    setTimeout(() => {
      setRouletteWinningPocket(winPocket);
      setIsSpinningRoulette(false);
      SoundEngine.playBallDrop(player.soundEnabled);

      if (result.won) {
        SoundEngine.playVictory(player.soundEnabled);
      } else {
        SoundEngine.playLoss(player.soundEnabled);
      }

      setRouletteResultMsg(
        result.won
          ? `Landed on ${winPocket.num} (${winPocket.color.toUpperCase()})! ${result.message}`
          : `Landed on ${winPocket.num} (${winPocket.color.toUpperCase()}). ${result.message}`
      );
    }, 2200);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. 2D HIGH-LOW STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [highLowState, setHighLowState] = useState<'IDLE' | 'DEALER_REVEALED' | 'ROUND_OVER'>('IDLE');
  const [dealerCard, setDealerCard] = useState<Card>(generateRandomCard());
  const [playerCard, setPlayerCard] = useState<Card>(generateRandomCard());
  const [currentPot, setCurrentPot] = useState<number>(0);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [highLowMsg, setHighLowMsg] = useState<string | null>(null);
  const [isFlippingPlayerCard, setIsFlippingPlayerCard] = useState(false);

  const startHighLowRound = () => {
    if (selectedChip > player.money) {
      setHighLowMsg('Insufficient pocket GREEN.');
      return;
    }
    const newDealer = generateRandomCard();
    setDealerCard(newDealer);
    setCurrentPot(selectedChip);
    setWinStreak(0);
    setHighLowState('DEALER_REVEALED');
    setHighLowMsg(`Dealer drew ${newDealer.rank}${newDealer.suit}. Predict Higher or Lower!`);
    SoundEngine.playCardFlip(player.soundEnabled);
  };

  const handleHighLowGuess = (guess: 'HIGHER' | 'LOWER') => {
    if (highLowState !== 'DEALER_REVEALED') return;

    setIsFlippingPlayerCard(true);
    SoundEngine.playCardFlip(player.soundEnabled);

    // Call engine
    const result = playCasinoGame('HIGH_LOW', currentPot);

    setTimeout(() => {
      let newPlayer = generateRandomCard();
      if (result.won) {
        if (guess === 'HIGHER') {
          newPlayer.value = Math.min(14, dealerCard.value + 1 + Math.floor(Math.random() * 3));
        } else {
          newPlayer.value = Math.max(2, dealerCard.value - 1 - Math.floor(Math.random() * 3));
        }
      } else {
        if (guess === 'HIGHER') {
          newPlayer.value = Math.max(2, dealerCard.value - 1 - Math.floor(Math.random() * 2));
        } else {
          newPlayer.value = Math.min(14, dealerCard.value + 1 + Math.floor(Math.random() * 2));
        }
      }
      const ranks: Record<number, string> = {
        2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
        11: 'J', 12: 'Q', 13: 'K', 14: 'A',
      };
      newPlayer.rank = ranks[newPlayer.value] || `${newPlayer.value}`;

      setPlayerCard(newPlayer);
      setIsFlippingPlayerCard(false);

      if (result.won) {
        const nextPot = Math.floor(currentPot * 1.5);
        setCurrentPot(nextPot);
        setWinStreak((prev) => prev + 1);
        setHighLowState('ROUND_OVER');
        setHighLowMsg(`Correct! Your card was ${newPlayer.rank}${newPlayer.suit}. Pot is now 🌿 ${nextPot.toLocaleString()} GREEN!`);
        SoundEngine.playCash(player.soundEnabled);
      } else {
        setHighLowState('IDLE');
        setHighLowMsg(`Incorrect! Your card was ${newPlayer.rank}${newPlayer.suit}. House takes the pot.`);
        setCurrentPot(0);
        setWinStreak(0);
        SoundEngine.playLoss(player.soundEnabled);
      }
    }, 600);
  };

  const handleCashOutHighLow = () => {
    setHighLowMsg(`Cashed out 🌿 ${currentPot.toLocaleString()} GREEN! Profits banked.`);
    SoundEngine.playVictory(player.soundEnabled);
    setHighLowState('IDLE');
    setCurrentPot(0);
    setWinStreak(0);
  };

  const handleContinueHighLow = () => {
    setDealerCard(playerCard);
    setHighLowState('DEALER_REVEALED');
    setHighLowMsg(`Dealer is now ${playerCard.rank}${playerCard.suit}. Predict Higher or Lower!`);
    SoundEngine.playCardFlip(player.soundEnabled);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. 2D BLACKJACK 21 STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [bjDealerCards, setBjDealerCards] = useState<Card[]>([]);
  const [bjPlayerCards, setBjPlayerCards] = useState<Card[]>([]);
  const [bjState, setBjState] = useState<'IDLE' | 'PLAYING' | 'DEALER_TURN' | 'ENDED'>('IDLE');
  const [bjResultMsg, setBjResultMsg] = useState<string | null>(null);

  const startBlackjack = () => {
    if (selectedChip > player.money) {
      setBjResultMsg('Insufficient pocket GREEN.');
      return;
    }
    const d1 = generateRandomCard();
    const d2 = generateRandomCard();
    const p1 = generateRandomCard();
    const p2 = generateRandomCard();

    setBjDealerCards([d1, d2]);
    setBjPlayerCards([p1, p2]);
    setBjState('PLAYING');
    setBjResultMsg(null);

    SoundEngine.playCardFlip(player.soundEnabled);
    setTimeout(() => SoundEngine.playCardFlip(player.soundEnabled), 150);

    // Natural 21 check
    if (calculateBlackjackTotal([p1, p2]) === 21) {
      setTimeout(() => {
        setBjState('ENDED');
        const res = playCasinoGame('BLACKJACK', selectedChip);
        setBjResultMsg('★ NATURAL BLACKJACK 21! ★ You win!');
        SoundEngine.playJackpot(player.soundEnabled);
      }, 500);
    }
  };

  const handleBjHit = () => {
    if (bjState !== 'PLAYING') return;
    const newCard = generateRandomCard();
    const newHand = [...bjPlayerCards, newCard];
    setBjPlayerCards(newHand);
    SoundEngine.playCardFlip(player.soundEnabled);

    const total = calculateBlackjackTotal(newHand);
    if (total > 21) {
      setBjState('ENDED');
      setBjResultMsg(`Bust with ${total}! House takes the wager.`);
      SoundEngine.playLoss(player.soundEnabled);
      playCasinoGame('BLACKJACK', selectedChip);
    }
  };

  const handleBjStand = () => {
    if (bjState !== 'PLAYING') return;
    setBjState('DEALER_TURN');
    SoundEngine.playCardFlip(player.soundEnabled);

    // Dealer AI draws until >= 17
    let currentDealerHand = [...bjDealerCards];
    let dTotal = calculateBlackjackTotal(currentDealerHand);
    while (dTotal < 17) {
      currentDealerHand.push(generateRandomCard());
      dTotal = calculateBlackjackTotal(currentDealerHand);
    }
    setBjDealerCards(currentDealerHand);

    const pTotal = calculateBlackjackTotal(bjPlayerCards);
    setBjState('ENDED');

    if (dTotal > 21) {
      const res = playCasinoGame('BLACKJACK', selectedChip);
      setBjResultMsg(`Dealer busted with ${dTotal}! You win!`);
      SoundEngine.playVictory(player.soundEnabled);
    } else if (pTotal > dTotal) {
      const res = playCasinoGame('BLACKJACK', selectedChip);
      setBjResultMsg(`You win! (${pTotal} beats Dealer's ${dTotal})`);
      SoundEngine.playVictory(player.soundEnabled);
    } else if (pTotal === dTotal) {
      setBjResultMsg(`Push! (${pTotal} to ${dTotal}) - Wager returned.`);
      SoundEngine.playCash(player.soundEnabled);
    } else {
      setBjResultMsg(`Dealer wins with ${dTotal} vs your ${pTotal}.`);
      SoundEngine.playLoss(player.soundEnabled);
      playCasinoGame('BLACKJACK', selectedChip);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. 2D CRAPS STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [diceRolls, setDiceRolls] = useState<[number, number]>([3, 4]);
  const [isRollingCraps, setIsRollingCraps] = useState(false);
  const [crapsResultMsg, setCrapsResultMsg] = useState<string | null>(null);
  const [crapsBetType, setCrapsBetType] = useState<'PASS_LINE' | 'DONT_PASS' | 'FIELD'>('PASS_LINE');

  const handleRollCraps = () => {
    if (selectedChip > player.money) {
      setCrapsResultMsg('Insufficient pocket GREEN.');
      return;
    }
    if (isRollingCraps) return;

    setIsRollingCraps(true);
    setCrapsResultMsg(null);
    SoundEngine.playDiceRoll(player.soundEnabled);

    // Engine call
    const result = playCasinoGame('CRAPS', selectedChip);

    let frames = 0;
    const rollAnim = setInterval(() => {
      setDiceRolls([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      frames++;
      if (frames > 8) {
        clearInterval(rollAnim);
        let d1 = Math.floor(Math.random() * 6) + 1;
        let d2 = Math.floor(Math.random() * 6) + 1;
        if (result.won) {
          if (crapsBetType === 'PASS_LINE') {
            d1 = 3; d2 = 4; // 7
          } else if (crapsBetType === 'FIELD') {
            d1 = 5; d2 = 6; // 11
          } else {
            d1 = 1; d2 = 2; // 3
          }
        } else {
          d1 = 1; d2 = 1; // Snake eyes
        }
        setDiceRolls([d1, d2]);
        setIsRollingCraps(false);
        const total = d1 + d2;
        setCrapsResultMsg(
          result.won
            ? `Rolled ${d1} + ${d2} = ${total}! ${result.message}`
            : `Rolled ${d1} + ${d2} = ${total}. House wins.`
        );
        if (result.won) {
          SoundEngine.playVictory(player.soundEnabled);
        } else {
          SoundEngine.playLoss(player.soundEnabled);
        }
      }
    }, 100);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. 2D KENO MATRIX STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [kenoSelected, setKenoSelected] = useState<number[]>([]);
  const [kenoDrawn, setKenoDrawn] = useState<number[]>([]);
  const [isDrawingKeno, setIsDrawingKeno] = useState(false);
  const [kenoResultMsg, setKenoResultMsg] = useState<string | null>(null);

  const toggleKenoNumber = (num: number) => {
    if (isDrawingKeno) return;
    if (kenoSelected.includes(num)) {
      setKenoSelected((prev) => prev.filter((n) => n !== num));
    } else {
      if (kenoSelected.length >= 10) return;
      setKenoSelected((prev) => [...prev, num]);
      SoundEngine.playChipClick(player.soundEnabled);
    }
  };

  const handleStartKeno = () => {
    if (kenoSelected.length === 0) {
      setKenoResultMsg('Pick at least 1 number from the matrix.');
      return;
    }
    if (selectedChip > player.money) {
      setKenoResultMsg('Insufficient pocket GREEN.');
      return;
    }
    if (isDrawingKeno) return;

    setIsDrawingKeno(true);
    setKenoDrawn([]);
    setKenoResultMsg(null);

    const result = playCasinoGame('KENO', selectedChip);

    // Generate 20 drawn numbers
    const drawnPool = new Set<number>();
    if (result.won) {
      // Include matches
      kenoSelected.slice(0, Math.min(3, kenoSelected.length)).forEach((n) => drawnPool.add(n));
    }
    while (drawnPool.size < 20) {
      drawnPool.add(Math.floor(Math.random() * 80) + 1);
    }
    const drawnArray = Array.from(drawnPool);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < drawnArray.length) {
        setKenoDrawn((prev) => [...prev, drawnArray[idx]]);
        SoundEngine.playReelTick(player.soundEnabled);
        idx++;
      } else {
        clearInterval(interval);
        setIsDrawingKeno(false);
        const matches = kenoSelected.filter((n) => drawnPool.has(n));
        setKenoResultMsg(
          result.won
            ? `Matched ${matches.length} numbers! ${result.message}`
            : `Matched ${matches.length} numbers. Better luck next draw!`
        );
        if (result.won) {
          SoundEngine.playVictory(player.soundEnabled);
        } else {
          SoundEngine.playLoss(player.soundEnabled);
        }
      }
    }, 70);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. 2D QUICK SCRATCHERS (LOTTERY) STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  interface ScratchTile {
    revealed: boolean;
    symbol: string;
    icon: string;
  }
  const [scratchTiles, setScratchTiles] = useState<ScratchTile[]>([]);
  const [isScratchCardActive, setIsScratchCardActive] = useState(false);
  const [scratchResultMsg, setScratchResultMsg] = useState<string | null>(null);

  const buyScratchCard = () => {
    if (selectedChip > player.money) {
      setScratchResultMsg('Insufficient pocket GREEN.');
      return;
    }
    const res = playCasinoGame('LOTTERY', selectedChip);
    const symbols = [
      { symbol: 'GREEN', icon: '🌿' },
      { symbol: 'DIAMOND', icon: '💎' },
      { symbol: 'CASH', icon: '💰' },
      { symbol: 'GUN', icon: '🔫' },
      { symbol: 'CHERRY', icon: '🍒' },
    ];
    let tiles: ScratchTile[] = [];
    if (res.won) {
      const winSym = symbols[0]; // 🌿
      tiles = [
        { revealed: false, symbol: winSym.symbol, icon: winSym.icon },
        { revealed: false, symbol: winSym.symbol, icon: winSym.icon },
        { revealed: false, symbol: winSym.symbol, icon: winSym.icon },
        { revealed: false, symbol: symbols[1].symbol, icon: symbols[1].icon },
        { revealed: false, symbol: symbols[2].symbol, icon: symbols[2].icon },
        { revealed: false, symbol: symbols[3].symbol, icon: symbols[3].icon },
      ].sort(() => Math.random() - 0.5);
    } else {
      tiles = [
        { revealed: false, symbol: symbols[0].symbol, icon: symbols[0].icon },
        { revealed: false, symbol: symbols[1].symbol, icon: symbols[1].icon },
        { revealed: false, symbol: symbols[2].symbol, icon: symbols[2].icon },
        { revealed: false, symbol: symbols[3].symbol, icon: symbols[3].icon },
        { revealed: false, symbol: symbols[4].symbol, icon: symbols[4].icon },
        { revealed: false, symbol: symbols[0].symbol, icon: symbols[0].icon },
      ].sort(() => Math.random() - 0.5);
    }
    setScratchTiles(tiles);
    setIsScratchCardActive(true);
    setScratchResultMsg('Scratch the 6 foil seals to reveal matching symbols!');
    SoundEngine.playChipClick(player.soundEnabled);
  };

  const scratchTile = (index: number) => {
    if (!isScratchCardActive || scratchTiles[index].revealed) return;
    SoundEngine.playScratch(player.soundEnabled);
    const updated = [...scratchTiles];
    updated[index].revealed = true;
    setScratchTiles(updated);

    // Check if all revealed
    if (updated.every((t) => t.revealed)) {
      const counts: Record<string, number> = {};
      updated.forEach((t) => {
        counts[t.symbol] = (counts[t.symbol] || 0) + 1;
      });
      const match = Object.entries(counts).find(([_, count]) => count >= 3);
      if (match) {
        setScratchResultMsg(`★ JACKPOT! 3x Matching ${match[0]} revealed! Payout awarded! ★`);
        SoundEngine.playVictory(player.soundEnabled);
      } else {
        setScratchResultMsg('No 3-of-a-kind match. Ticket expired.');
        SoundEngine.playLoss(player.soundEnabled);
      }
    }
  };

  const scratchAllTiles = () => {
    scratchTiles.forEach((_, i) => scratchTile(i));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. 2D BOOKIE / NEON DRAG RACE
  // ─────────────────────────────────────────────────────────────────────────────
  interface Racer {
    id: string;
    name: string;
    car: string;
    color: string;
    odds: number;
    progress: number;
  }
  const RACERS: Racer[] = [
    { id: '1', name: 'Cyber Phantom', car: '🏎️', color: 'text-emerald-400', odds: 2.2, progress: 0 },
    { id: '2', name: 'Nightstalker GT', car: '🏎️', color: 'text-cyan-400', odds: 3.0, progress: 0 },
    { id: '3', name: 'Tokyo Drifter', car: '🏎️', color: 'text-purple-400', odds: 4.5, progress: 0 },
    { id: '4', name: 'Syndicate Beast', car: '🏎️', color: 'text-rose-400', odds: 8.0, progress: 0 },
  ];
  const [selectedRacerId, setSelectedRacerId] = useState<string>('1');
  const [racersProgress, setRacersProgress] = useState<number[]>([0, 0, 0, 0]);
  const [isRacing, setIsRacing] = useState(false);
  const [raceResultMsg, setRaceResultMsg] = useState<string | null>(null);

  const startDragRace = () => {
    if (selectedChip > player.money) {
      setRaceResultMsg('Insufficient pocket GREEN.');
      return;
    }
    if (isRacing) return;

    setIsRacing(true);
    setRacersProgress([0, 0, 0, 0]);
    setRaceResultMsg(null);
    SoundEngine.playHit(player.soundEnabled);

    const res = playCasinoGame('BOOKIE', selectedChip);
    const chosenIndex = RACERS.findIndex((r) => r.id === selectedRacerId);

    const currentPositions = [0, 0, 0, 0];
    const raceInterval = setInterval(() => {
      let finished = false;
      let winnerIdx = -1;

      for (let i = 0; i < 4; i++) {
        const boost = (i === chosenIndex && res.won) ? Math.random() * 8 + 6 : Math.random() * 8 + 4;
        currentPositions[i] = Math.min(100, currentPositions[i] + boost);
        if (currentPositions[i] >= 100 && !finished) {
          finished = true;
          winnerIdx = i;
        }
      }

      setRacersProgress([...currentPositions]);
      SoundEngine.playReelTick(player.soundEnabled);

      if (finished) {
        clearInterval(raceInterval);
        setIsRacing(false);
        const winningRacer = RACERS[winnerIdx];
        if (winnerIdx === chosenIndex) {
          setRaceResultMsg(`🏁 ${winningRacer.name} WON THE RACE! ${res.message}`);
          SoundEngine.playVictory(player.soundEnabled);
        } else {
          setRaceResultMsg(`🏁 ${winningRacer.name} crossed the line first. Your car placed #${winnerIdx + 1}.`);
          SoundEngine.playLoss(player.soundEnabled);
        }
      }
    }, 120);
  };

  return (
    <div className="space-y-5 pb-12 max-w-4xl mx-auto">
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* CASINO HEADER & PROGRESSIVE JACKPOT                                   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-neutral-950 via-purple-950/40 to-neutral-950 border border-purple-800/40 p-4 sm:p-5 shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-center text-2xl shadow-inner">
              🎰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white uppercase">
                  Metropolis Casino
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40">
                  Pre-Release 2.0
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                High-stakes 2D underworld games • Dynamic odds & item-balanced house edge
              </p>
            </div>
          </div>

          {/* Progressive Ticker */}
          <div className="text-center sm:text-right bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-xl">
            <span className="text-[10px] font-mono text-purple-400 block tracking-widest uppercase">
              🌿 Progressive Jackpot
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 tracking-tight">
              🌿 {progressiveJackpot.toLocaleString()} GREEN
            </div>
          </div>
        </div>

        {/* Dynamic Odds / Beginner's Luck Notification Ribbon */}
        {isBeginnerLuckActive && (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              <strong>Beginner's Luck Boost Active!</strong> Operative joined within 3 days. +24% casino win chance on current bets!
            </span>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* CHIP SELECTOR & BALANCE RACK                                          */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Chip Bet:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[10, 100, 1000, 10000, 100000, 1000000].map((val) => (
              <button
                key={val}
                onClick={() => handleSelectChip(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition-all cursor-pointer ${
                  selectedChip === val
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400 scale-105'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-purple-500 hover:text-white'
                }`}
              >
                🌿 {val >= 1000000 ? `${val / 1000000}M` : val >= 1000 ? `${val / 1000}K` : val}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-neutral-500 block">Pocket Money</span>
            <span className="text-emerald-400 font-bold">🌿 {player.money.toLocaleString()} GREEN</span>
          </div>
          <button
            onClick={() => setShowPayTable(!showPayTable)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold border border-neutral-700 cursor-pointer"
          >
            {showPayTable ? 'Hide Pay Table' : 'Pay Table'}
          </button>
        </div>
      </div>

      {/* Pay Table Modal */}
      {showPayTable && (
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-2">
          <h4 className="font-bold text-white text-sm">🎰 Payout Multipliers & Odds</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SLOT_SYMBOLS.map((s) => (
              <div key={s.id} className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <span>{s.icon} {s.name}</span>
                <span className="text-purple-300 font-bold">{s.multiplier}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* 8-GAME NAVIGATION TABS                                                */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar select-none">
        {[
          { id: 'SLOTS', label: 'Torn Slots', icon: '🎰' },
          { id: 'ROULETTE', label: 'Roulette', icon: '🎡' },
          { id: 'HIGH_LOW', label: 'High-Low', icon: '🃏' },
          { id: 'BLACKJACK', label: 'Blackjack 21', icon: '♠️' },
          { id: 'CRAPS', label: 'Craps Dice', icon: '🎲' },
          { id: 'KENO', label: 'Keno Matrix', icon: '🔢' },
          { id: 'LOTTERY', label: 'Scratchers', icon: '🎟️' },
          { id: 'BOOKIE', label: 'Drag Race', icon: '🏎️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedGame(tab.id as CasinoGameId);
              SoundEngine.playChipClick(player.soundEnabled);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedGame === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-1 ring-purple-400'
                : 'bg-neutral-900/90 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 1: 2D TORN SLOTS                                                 */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'SLOTS' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">
              Lucky Shot Casino • Metropolis Underworld
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              ★ TORN $LOT$ ★
            </h3>
          </div>

          <div className="relative py-6 max-w-lg mx-auto">
            {/* Center Payline Arrow */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between pointer-events-none px-1">
              <span className={`text-2xl ${slotsWinLine ? 'text-amber-400 animate-ping' : 'text-purple-400/80'}`}>▶</span>
              <div className={`flex-1 border-t-2 mx-1 border-dashed ${slotsWinLine ? 'border-amber-400 animate-pulse' : 'border-purple-500/40'}`} />
              <span className={`text-2xl ${slotsWinLine ? 'text-amber-400 animate-ping' : 'text-purple-400/80'}`}>◀</span>
            </div>

            {/* 3 Reels Grid */}
            <div className="grid grid-cols-3 gap-3 bg-neutral-950 p-4 rounded-2xl border-2 border-neutral-800 shadow-inner">
              {reels.map((sym, idx) => (
                <div
                  key={idx}
                  className={`h-36 sm:h-44 rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-md transition-all ${
                    isSpinningSlots ? 'border-purple-500 animate-pulse' : 'border-neutral-700'
                  }`}
                >
                  <span className={`text-5xl sm:text-6xl transition-transform duration-200 ${isSpinningSlots ? 'scale-75 blur-xs' : 'scale-100'}`}>
                    {sym.icon}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-neutral-300 mt-2 truncate max-w-full text-center">
                    {sym.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Spin Button */}
            <div className="mt-5 text-center">
              <button
                onClick={handleSpinSlots}
                disabled={isSpinningSlots}
                className={`w-full max-w-sm py-3.5 rounded-xl font-mono font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                  isSpinningSlots
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-emerald-950/40 active:scale-95'
                }`}
              >
                {isSpinningSlots ? '🎰 Reels Spinning...' : `SPIN (🌿 ${selectedChip.toLocaleString()} GREEN)`}
              </button>
            </div>

            {slotsResultMsg && (
              <div className="mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono font-bold text-xs text-neutral-200">
                {slotsResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 2: 2D EUROPEAN ROULETTE                                          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'ROULETTE' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              European Single-Zero Wheel • Lucky Shot Felt
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              🎡 European Roulette
            </h3>
          </div>

          <div className="py-4 space-y-6">
            {/* Wheel Animation Canvas */}
            <div className="flex flex-col items-center justify-center">
              <div
                style={{
                  transform: `rotate(${rouletteWheelDeg}deg)`,
                  transition: isSpinningRoulette ? 'transform 2.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
                }}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 border-amber-900/80 bg-neutral-950 shadow-2xl flex items-center justify-center relative select-none"
              >
                <div className="w-36 h-36 rounded-full border-4 border-amber-600/40 bg-gradient-to-br from-emerald-950 to-neutral-900 flex items-center justify-center text-xs font-mono font-bold text-amber-200">
                  {rouletteWinningPocket ? (
                    <div className="text-center">
                      <span className="text-2xl font-black">{rouletteWinningPocket.num}</span>
                      <span className="block text-[10px] uppercase text-neutral-400">{rouletteWinningPocket.color}</span>
                    </div>
                  ) : (
                    'SPIN WHEEL'
                  )}
                </div>
              </div>
            </div>

            {/* Betting Grid */}
            <div className="max-w-2xl mx-auto space-y-2 select-none font-mono">
              <div className="grid grid-cols-6 gap-1 text-[11px] font-bold text-center">
                {['1-18', 'EVEN', 'RED', 'BLACK', 'ODD', '19-36'].map((spot) => (
                  <button
                    key={spot}
                    onClick={() => placeRouletteBet(spot)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      spot === 'RED'
                        ? 'bg-rose-900/60 border-rose-500 text-rose-200'
                        : spot === 'BLACK'
                        ? 'bg-neutral-950 border-neutral-700 text-neutral-300'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    {spot} {rouletteBets[spot] ? `(${rouletteBets[spot]})` : ''}
                  </button>
                ))}
              </div>

              {/* Number Felt (0 to 36) */}
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-center">
                {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
                  const isRed = RED_NUMBERS.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => placeRouletteBet(`${num}`)}
                      className={`p-2 rounded border cursor-pointer ${
                        isRed
                          ? 'bg-rose-950 border-rose-800 text-rose-300 hover:bg-rose-900'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-neutral-400">Total Wager: <strong className="text-emerald-400">🌿 {totalRouletteBet} GREEN</strong></span>
                <div className="flex gap-2">
                  <button onClick={clearRouletteBets} className="px-3 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer">
                    Clear Bets
                  </button>
                  <button
                    onClick={handleSpinRoulette}
                    disabled={isSpinningRoulette || totalRouletteBet === 0}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase cursor-pointer"
                  >
                    {isSpinningRoulette ? 'Spinning...' : 'Spin Wheel'}
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
      {/* GAME 3: 2D HIGH-LOW                                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'HIGH_LOW' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
              Lucky Shot Casino • High-Low Shoe
            </span>
            <h3 className="text-2xl font-black text-white font-serif tracking-wide">
              🃏 High-Low Card Arena
            </h3>
          </div>

          <div className="max-w-md mx-auto py-6 space-y-6">
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {/* Dealer Card */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-bold text-neutral-400">Dealer's Card</span>
                <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-neutral-100 text-neutral-950 p-2.5 shadow-2xl border-2 border-neutral-300 flex flex-col justify-between font-mono font-black select-none">
                  {highLowState !== 'IDLE' ? (
                    <>
                      <div className={`text-base ${dealerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>{dealerCard.rank} {dealerCard.suit}</div>
                      <div className={`text-4xl text-center ${dealerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>{dealerCard.suit}</div>
                      <div className={`text-base text-right ${dealerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>{dealerCard.rank}</div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-3xl text-neutral-400">🂠</div>
                  )}
                </div>
              </div>

              <div className="text-2xl font-black text-neutral-600">VS</div>

              {/* Player Card */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-bold text-neutral-400">Your Card</span>
                <div className={`w-24 h-36 sm:w-28 sm:h-40 rounded-2xl p-2.5 shadow-2xl border-2 flex flex-col justify-between font-mono font-black select-none transition-transform duration-300 ${
                  isFlippingPlayerCard ? 'rotate-y-90 scale-90' : ''
                } ${
                  highLowState === 'ROUND_OVER' ? 'bg-neutral-100 text-neutral-950 border-neutral-300' : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}>
                  {highLowState === 'ROUND_OVER' ? (
                    <>
                      <div className={`text-base ${playerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>{playerCard.rank} {playerCard.suit}</div>
                      <div className={`text-4xl text-center ${playerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>{playerCard.suit}</div>
                      <div className={`text-base text-right ${playerCard.color === 'red' ? 'text-rose-600' : 'text-neutral-900'}`}>{playerCard.rank}</div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-3xl text-amber-500/70">★ T ★</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center font-mono space-y-1">
              <span className="text-[10px] text-neutral-500 block uppercase">Accumulated Pot</span>
              <div className="text-xl font-black text-amber-400">🌿 {currentPot.toLocaleString()} GREEN</div>
              <div className="text-[11px] text-neutral-400">({winStreak} wins in a row) • Modifier: <span className="text-emerald-400 font-bold">{25 + (winStreak * 25)}%</span></div>
            </div>

            <div className="space-y-3 font-mono">
              {highLowState === 'IDLE' && (
                <button
                  onClick={startHighLowRound}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black text-sm uppercase cursor-pointer"
                >
                  Deal Cards (Wager: 🌿 {selectedChip} GREEN)
                </button>
              )}
              {highLowState === 'DEALER_REVEALED' && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleHighLowGuess('HIGHER')} className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase cursor-pointer">
                    ▲ HIGHER
                  </button>
                  <button onClick={() => handleHighLowGuess('LOWER')} className="py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase cursor-pointer">
                    ▼ LOWER
                  </button>
                </div>
              )}
              {highLowState === 'ROUND_OVER' && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleCashOutHighLow} className="py-3.5 rounded-xl bg-emerald-500 text-neutral-950 font-black text-xs uppercase cursor-pointer">
                    💰 Cash Out (+🌿 {currentPot})
                  </button>
                  <button onClick={handleContinueHighLow} className="py-3.5 rounded-xl bg-neutral-800 text-white font-black text-xs uppercase cursor-pointer">
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

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 4: 2D BLACKJACK 21                                               */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'BLACKJACK' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative select-none">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Vegas Strip Rules • Blackjack Pays 3 to 2
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              ♠️ Blackjack 21
            </h3>
          </div>

          <div className="py-6 max-w-lg mx-auto space-y-6">
            {/* Dealer Hand */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-neutral-400">
                Dealer Hand {bjState === 'ENDED' ? `(${calculateBlackjackTotal(bjDealerCards)})` : ''}
              </span>
              <div className="flex gap-2 min-h-[90px]">
                {bjDealerCards.map((card, i) => (
                  <div
                    key={i}
                    className="w-16 h-24 rounded-xl bg-neutral-100 text-neutral-950 p-2 shadow-lg border border-neutral-300 flex flex-col justify-between font-mono font-bold text-xs"
                  >
                    {i === 1 && bjState === 'PLAYING' ? (
                      <div className="h-full flex items-center justify-center text-neutral-500">🂠</div>
                    ) : (
                      <>
                        <span className={card.color === 'red' ? 'text-rose-600' : ''}>{card.rank}{card.suit}</span>
                        <span className="text-lg text-center">{card.suit}</span>
                        <span className="text-right">{card.rank}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Player Hand */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                Your Hand {bjPlayerCards.length > 0 ? `(${calculateBlackjackTotal(bjPlayerCards)})` : ''}
              </span>
              <div className="flex gap-2 min-h-[90px]">
                {bjPlayerCards.map((card, i) => (
                  <div
                    key={i}
                    className="w-16 h-24 rounded-xl bg-neutral-100 text-neutral-950 p-2 shadow-lg border border-neutral-300 flex flex-col justify-between font-mono font-bold text-xs"
                  >
                    <span className={card.color === 'red' ? 'text-rose-600' : ''}>{card.rank}{card.suit}</span>
                    <span className="text-lg text-center">{card.suit}</span>
                    <span className="text-right">{card.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 font-mono">
              {bjState === 'IDLE' || bjState === 'ENDED' ? (
                <button
                  onClick={startBlackjack}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm uppercase cursor-pointer"
                >
                  Deal Hand (Wager: 🌿 {selectedChip} GREEN)
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleBjHit} className="py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm uppercase cursor-pointer">
                    HIT +
                  </button>
                  <button onClick={handleBjStand} className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm uppercase cursor-pointer">
                    STAND
                  </button>
                </div>
              )}

              {bjResultMsg && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs font-bold text-neutral-200">
                  {bjResultMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 5: 2D CRAPS                                                      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'CRAPS' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative select-none">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">
              Underground Velvet Felt • Rolling the Bones
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              🎲 Craps Dice Arena
            </h3>
          </div>

          <div className="py-6 max-w-lg mx-auto space-y-6 text-center">
            {/* 2 Animated 3D/2D Tumbling Dice */}
            <div className="flex justify-center items-center gap-6 py-4">
              {diceRolls.map((die, i) => (
                <div
                  key={i}
                  className={`w-20 h-20 rounded-2xl bg-neutral-100 text-neutral-950 border-4 border-neutral-300 shadow-2xl flex items-center justify-center text-4xl font-black transition-transform duration-100 ${
                    isRollingCraps ? 'rotate-45 scale-90' : 'rotate-0 scale-100'
                  }`}
                >
                  {die}
                </div>
              ))}
            </div>

            {/* Bet Type Selection */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {(['PASS_LINE', 'DONT_PASS', 'FIELD'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCrapsBetType(type)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer font-bold ${
                    crapsBetType === type
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={handleRollCraps}
              disabled={isRollingCraps}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-sm uppercase cursor-pointer"
            >
              {isRollingCraps ? 'Rolling Bones...' : `ROLL DICE (🌿 ${selectedChip} GREEN)`}
            </button>

            {crapsResultMsg && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono text-xs font-bold text-neutral-200">
                {crapsResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 6: 2D KENO MATRIX                                                */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'KENO' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative select-none">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              80-Number Neon Grid • Draw 20 Balls
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              🔢 Keno Matrix
            </h3>
          </div>

          <div className="py-4 space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-400">Selected: <strong>{kenoSelected.length}/10</strong> numbers</span>
              <button onClick={() => setKenoSelected([])} className="text-rose-400 hover:underline cursor-pointer">
                Clear
              </button>
            </div>

            {/* 80 Grid */}
            <div className="grid grid-cols-10 gap-1 text-[10px] font-mono font-bold text-center">
              {Array.from({ length: 80 }, (_, i) => i + 1).map((n) => {
                const isSelected = kenoSelected.includes(n);
                const isDrawn = kenoDrawn.includes(n);
                const isHit = isSelected && isDrawn;

                return (
                  <button
                    key={n}
                    onClick={() => toggleKenoNumber(n)}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      isHit
                        ? 'bg-amber-400 text-neutral-950 font-black animate-pulse'
                        : isSelected
                        ? 'bg-cyan-500 text-neutral-950 font-bold'
                        : isDrawn
                        ? 'bg-neutral-700 text-neutral-300'
                        : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStartKeno}
              disabled={isDrawingKeno || kenoSelected.length === 0}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-black text-sm uppercase cursor-pointer"
            >
              {isDrawingKeno ? 'Drawing 20 Balls...' : `DRAW KENO (🌿 ${selectedChip} GREEN)`}
            </button>

            {kenoResultMsg && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono text-xs font-bold text-neutral-200">
                {kenoResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 7: 2D QUICK SCRATCHERS                                           */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'LOTTERY' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative select-none">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
              Syndicate Foil Scratchers • Match 3 To Win
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              🎟️ Quick Scratchers
            </h3>
          </div>

          <div className="py-6 max-w-md mx-auto space-y-6 text-center">
            {isScratchCardActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 p-4 bg-amber-950/40 border-2 border-amber-500/40 rounded-2xl">
                  {scratchTiles.map((tile, i) => (
                    <button
                      key={i}
                      onClick={() => scratchTile(i)}
                      className={`h-24 rounded-xl flex items-center justify-center text-3xl font-black transition-all cursor-pointer ${
                        tile.revealed
                          ? 'bg-neutral-950 text-white border border-neutral-700'
                          : 'bg-gradient-to-br from-amber-400 to-yellow-600 text-neutral-950 shadow-lg hover:scale-105'
                      }`}
                    >
                      {tile.revealed ? tile.icon : '✨'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={scratchAllTiles}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-mono font-bold text-neutral-300 hover:text-white cursor-pointer"
                >
                  Scratch All Foil
                </button>
              </div>
            ) : (
              <button
                onClick={buyScratchCard}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono font-black text-sm uppercase cursor-pointer"
              >
                Buy Scratchcard (🌿 {selectedChip} GREEN)
              </button>
            )}

            {scratchResultMsg && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono text-xs font-bold text-neutral-200">
                {scratchResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* GAME 8: 2D BOOKIE / NEON DRAG RACE                                    */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'BOOKIE' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative select-none">
          <div className="text-center pb-3 border-b border-neutral-800">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              Underground Speedway • Back Your Racer
            </span>
            <h3 className="text-2xl font-black text-white font-mono tracking-wider">
              🏎️ Neon Drag Race
            </h3>
          </div>

          <div className="py-6 max-w-xl mx-auto space-y-4">
            {/* Tracks */}
            <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              {RACERS.map((racer, idx) => (
                <div key={racer.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={`font-bold ${racer.color}`}>{racer.name} ({racer.odds}x)</span>
                    <span className="text-neutral-500">{Math.round(racersProgress[idx])}%</span>
                  </div>
                  <div className="h-6 bg-neutral-900 rounded-lg relative overflow-hidden border border-neutral-800">
                    <div
                      style={{ width: `${racersProgress[idx]}%` }}
                      className="h-full bg-neutral-800 transition-all duration-100 flex items-center justify-end pr-1 text-sm"
                    >
                      {racer.car}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Racer Select */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {RACERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRacerId(r.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer font-bold ${
                    selectedRacerId === r.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            <button
              onClick={startDragRace}
              disabled={isRacing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-mono font-black text-sm uppercase cursor-pointer"
            >
              {isRacing ? '🏁 Race In Progress...' : `START RACE (🌿 ${selectedChip} GREEN)`}
            </button>

            {raceResultMsg && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono text-xs font-bold text-neutral-200">
                {raceResultMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
