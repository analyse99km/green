'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { SoundEngine } from '../gameAudio';
import RouletteWheelCanvas from '../RouletteWheelCanvas';
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
  const { player, deductMoney, awardMoney } = useGame();
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
      setSlotsResultMsg('Insufficient pocket GREEN.');
      SoundEngine.playLoss(player.soundEnabled);
      return;
    }
    if (isSpinningSlots) return;

    // 1. Deduct immediately
    const success = deductMoney(selectedChip, 'Slots Spin');
    if (!success) {
      setSlotsResultMsg('Insufficient pocket GREEN.');
      return;
    }

    setIsSpinningSlots(true);
    setSlotsResultMsg(null);
    setSlotsWinLine(false);

    // Ticking audio during spin
    let ticks = 0;
    const tickInterval = setInterval(() => {
      SoundEngine.playReelTick(player.soundEnabled);
      ticks++;
      if (ticks > 12) clearInterval(tickInterval);
    }, 90);

    // Dynamic house edge & beginner's luck
    let winChance = 0.40;
    if (selectedChip <= 50) winChance += 0.18; // Small bet dopamine boost
    else if (selectedChip >= 1000) winChance -= 0.16; // Whale bet steep house advantage
    if (isBeginnerLuckActive) winChance += 0.24;

    const willWin = Math.random() < winChance;
    let finalReels: [SlotSymbol, SlotSymbol, SlotSymbol];
    let winningSym: SlotSymbol | null = null;

    if (willWin) {
      winningSym = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      finalReels = [winningSym, winningSym, winningSym];
    } else {
      const s1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      let s2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      let s3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      while (s1.id === s2.id && s2.id === s3.id) {
        s3 = SLOT_SYMBOLS[(SLOT_SYMBOLS.indexOf(s3) + 1) % SLOT_SYMBOLS.length];
      }
      finalReels = [s1, s2, s3];
    }

    // Stop reels one by one
    setTimeout(() => {
      setReels((prev) => [finalReels[0], prev[1], prev[2]]);
      SoundEngine.playReelTick(player.soundEnabled);
    }, 450);

    setTimeout(() => {
      setReels((prev) => [finalReels[0], finalReels[1], prev[2]]);
      SoundEngine.playReelTick(player.soundEnabled);
    }, 850);

    setTimeout(() => {
      setReels(finalReels);
      setIsSpinningSlots(false);

      if (willWin && winningSym) {
        const payout = Math.round(selectedChip * winningSym.multiplier);
        awardMoney(payout, `Slots 3x ${winningSym.name}`);
        setSlotsWinLine(true);
        if (winningSym.id === 'green') {
          SoundEngine.playJackpot(player.soundEnabled);
          setSlotsResultMsg(`★ METROPOLIS JACKPOT! ★ 3x 🌿 won +🌿 ${payout.toLocaleString()} GREEN!`);
        } else {
          SoundEngine.playVictory(player.soundEnabled);
          setSlotsResultMsg(`🎉 WIN! 3x ${winningSym.icon} ${winningSym.name}! Payout: +🌿 ${payout.toLocaleString()} GREEN`);
        }
      } else {
        SoundEngine.playLoss(player.soundEnabled);
        setSlotsResultMsg(`No matching line. House takes 🌿 ${selectedChip.toLocaleString()} GREEN.`);
      }
    }, 1250);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. 2D ROULETTE STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [rouletteBets, setRouletteBets] = useState<{ [key: string]: number }>({});
  const [lastRouletteBets, setLastRouletteBets] = useState<{ [key: string]: number }>({});
  const [lastRouletteWon, setLastRouletteWon] = useState<number>(0);
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [targetWinningNumber, setTargetWinningNumber] = useState<number | null>(null);
  const [pendingWinPocket, setPendingWinPocket] = useState<RoulettePocket | null>(null);
  const [rouletteWinningPocket, setRouletteWinningPocket] = useState<RoulettePocket | null>(null);
  const [rouletteResultMsg, setRouletteResultMsg] = useState<string | null>(null);

  const totalRouletteBet = Object.values(rouletteBets).reduce((acc, v) => acc + v, 0);

  const placeRouletteBet = (spot: string, amount: number = selectedChip) => {
    if (isSpinningRoulette) return;
    if (totalRouletteBet + amount > player.money) {
      setRouletteResultMsg('Insufficient pocket GREEN for this chip.');
      SoundEngine.playLoss(player.soundEnabled);
      return;
    }
    setRouletteBets((prev) => ({
      ...prev,
      [spot]: (prev[spot] || 0) + amount,
    }));
    SoundEngine.playChipClick(player.soundEnabled);
    setRouletteResultMsg(null);
  };

  const removeRouletteBet = (spot: string) => {
    if (isSpinningRoulette) return;
    setRouletteBets((prev) => {
      const copy = { ...prev };
      delete copy[spot];
      return copy;
    });
    SoundEngine.playChipClick(player.soundEnabled);
  };

  const clearRouletteBets = () => {
    if (isSpinningRoulette) return;
    setRouletteBets({});
    setRouletteResultMsg(null);
    SoundEngine.playChipClick(player.soundEnabled);
  };

  const handleRepeatBets = () => {
    if (isSpinningRoulette) return;
    const previousTotal = Object.values(lastRouletteBets).reduce((acc, v) => acc + v, 0);
    if (previousTotal <= 0) {
      setRouletteResultMsg('No previous bets to repeat.');
      return;
    }
    if (previousTotal > player.money) {
      setRouletteResultMsg('Insufficient pocket GREEN to repeat previous bets.');
      return;
    }
    setRouletteBets({ ...lastRouletteBets });
    SoundEngine.playChipClick(player.soundEnabled);
    setRouletteResultMsg(`Repeated previous bets (🌿 ${previousTotal.toLocaleString()} GREEN).`);
  };

  const handleSpinRoulette = () => {
    if (totalRouletteBet <= 0) {
      setRouletteResultMsg('Please make at least one bet by dragging a chip.');
      return;
    }
    if (totalRouletteBet > player.money) {
      setRouletteResultMsg('Insufficient pocket GREEN.');
      return;
    }
    if (isSpinningRoulette) return;

    // Deduct total bet immediately
    const ok = deductMoney(totalRouletteBet, 'Roulette Bet');
    if (!ok) {
      setRouletteResultMsg('Insufficient pocket GREEN.');
      return;
    }

    // Save previous bets for Repeat Bets button
    setLastRouletteBets({ ...rouletteBets });

    // Pick winning pocket
    const winPocketIndex = Math.floor(Math.random() * ROULETTE_POCKETS.length);
    const winPocket = ROULETTE_POCKETS[winPocketIndex];

    setPendingWinPocket(winPocket);
    setTargetWinningNumber(winPocket.num);
    setIsSpinningRoulette(true);
    setRouletteResultMsg('Wheel spinning... Ball circling the track!');
  };

  const handleRouletteSpinComplete = () => {
    if (!pendingWinPocket) return;

    setIsSpinningRoulette(false);
    setRouletteWinningPocket(pendingWinPocket);

    // Evaluate actual winnings based strictly on table bets
    let totalWon = 0;
    const num = pendingWinPocket.num;
    const col = pendingWinPocket.color;

    // 1. Straight Up number (35 to 1 payout + stake = 36x)
    if (rouletteBets[`${num}`]) totalWon += rouletteBets[`${num}`] * 36;

    // 2. Red / Black (1 to 1 payout = 2x)
    if (col === 'red' && rouletteBets['RED']) totalWon += rouletteBets['RED'] * 2;
    if (col === 'black' && rouletteBets['BLACK']) totalWon += rouletteBets['BLACK'] * 2;

    // 3. Even / Odd (1 to 1 payout = 2x, 0 loses)
    if (num > 0 && num % 2 === 0 && rouletteBets['EVEN']) totalWon += rouletteBets['EVEN'] * 2;
    if (num > 0 && num % 2 !== 0 && rouletteBets['ODD']) totalWon += rouletteBets['ODD'] * 2;

    // 4. Low (1-18) / High (19-36) (1 to 1 payout = 2x, 0 loses)
    if (num >= 1 && num <= 18 && (rouletteBets['1-18'] || rouletteBets['1_TO_18'])) {
      totalWon += (rouletteBets['1-18'] || rouletteBets['1_TO_18']) * 2;
    }
    if (num >= 19 && num <= 36 && (rouletteBets['19-36'] || rouletteBets['19_TO_36'])) {
      totalWon += (rouletteBets['19-36'] || rouletteBets['19_TO_36']) * 2;
    }

    // 5. Dozens (2 to 1 payout = 3x)
    if (num >= 1 && num <= 12 && rouletteBets['1st_12']) totalWon += rouletteBets['1st_12'] * 3;
    if (num >= 13 && num <= 24 && rouletteBets['2nd_12']) totalWon += rouletteBets['2nd_12'] * 3;
    if (num >= 25 && num <= 36 && rouletteBets['3rd_12']) totalWon += rouletteBets['3rd_12'] * 3;

    // 6. Column Bets (2 to 1 payout = 3x)
    // COL_3: Row 1 numbers: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 (num % 3 === 0 && num > 0)
    if (num > 0 && num % 3 === 0 && rouletteBets['COL_3']) totalWon += rouletteBets['COL_3'] * 3;
    // COL_2: Row 2 numbers: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 (num % 3 === 2)
    if (num % 3 === 2 && rouletteBets['COL_2']) totalWon += rouletteBets['COL_2'] * 3;
    // COL_1: Row 3 numbers: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34 (num % 3 === 1)
    if (num % 3 === 1 && rouletteBets['COL_1']) totalWon += rouletteBets['COL_1'] * 3;

    setLastRouletteWon(totalWon);

    if (totalWon > 0) {
      awardMoney(totalWon, `Roulette Win on ${num} (${col})`);
      SoundEngine.playVictory(player.soundEnabled);
      setRouletteResultMsg(`🎉 Ball dropped into ${num} (${col.toUpperCase()})! Won +🌿 ${totalWon.toLocaleString()} GREEN!`);
    } else {
      SoundEngine.playLoss(player.soundEnabled);
      setRouletteResultMsg(`Ball dropped into ${num} (${col.toUpperCase()}). No winning bets. Lost 🌿 ${totalRouletteBet.toLocaleString()} GREEN.`);
    }
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
    const ok = deductMoney(selectedChip, 'High-Low Wager');
    if (!ok) {
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

    setTimeout(() => {
      const newPlayer = generateRandomCard();
      setPlayerCard(newPlayer);
      setIsFlippingPlayerCard(false);

      const isHigher = newPlayer.value > dealerCard.value;
      const isLower = newPlayer.value < dealerCard.value;
      const isCorrect = (guess === 'HIGHER' && isHigher) || (guess === 'LOWER' && isLower);

      if (isCorrect) {
        const nextPot = Math.round(currentPot * 1.5);
        setCurrentPot(nextPot);
        setWinStreak((prev) => prev + 1);
        setHighLowState('ROUND_OVER');
        setHighLowMsg(`Correct! Your card was ${newPlayer.rank}${newPlayer.suit}. Pot is now 🌿 ${nextPot.toLocaleString()} GREEN!`);
        SoundEngine.playCash(player.soundEnabled);
      } else {
        setHighLowState('IDLE');
        setHighLowMsg(`Incorrect! Card was ${newPlayer.rank}${newPlayer.suit}. House takes the pot.`);
        setCurrentPot(0);
        setWinStreak(0);
        SoundEngine.playLoss(player.soundEnabled);
      }
    }, 500);
  };

  const handleCashOutHighLow = () => {
    if (currentPot <= 0) return;
    awardMoney(currentPot, 'High-Low Cash Out');
    setHighLowMsg(`Cashed out +🌿 ${currentPot.toLocaleString()} GREEN! Profits banked.`);
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
  const [bjCurrentBet, setBjCurrentBet] = useState<number>(0);
  const [bjState, setBjState] = useState<'IDLE' | 'PLAYING' | 'DEALER_TURN' | 'ENDED'>('IDLE');
  const [bjResultMsg, setBjResultMsg] = useState<string | null>(null);

  const startBlackjack = () => {
    if (selectedChip > player.money) {
      setBjResultMsg('Insufficient pocket GREEN.');
      return;
    }
    const ok = deductMoney(selectedChip, 'Blackjack Wager');
    if (!ok) {
      setBjResultMsg('Insufficient pocket GREEN.');
      return;
    }

    setBjCurrentBet(selectedChip);
    const d1 = generateRandomCard();
    const d2 = generateRandomCard();
    const p1 = generateRandomCard();
    const p2 = generateRandomCard();

    setBjDealerCards([d1, d2]);
    setBjPlayerCards([p1, p2]);
    setBjState('PLAYING');
    setBjResultMsg(null);

    SoundEngine.playCardFlip(player.soundEnabled);

    // Natural 21 check
    if (calculateBlackjackTotal([p1, p2]) === 21) {
      setTimeout(() => {
        setBjState('ENDED');
        const payout = Math.round(selectedChip * 2.5);
        awardMoney(payout, 'Natural Blackjack 21 Win');
        setBjResultMsg(`★ NATURAL BLACKJACK 21! ★ Won +🌿 ${payout.toLocaleString()} GREEN!`);
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
      setBjResultMsg(`Bust with ${total}! House takes 🌿 ${bjCurrentBet.toLocaleString()} GREEN.`);
      SoundEngine.playLoss(player.soundEnabled);
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
      const payout = bjCurrentBet * 2;
      awardMoney(payout, 'Blackjack Dealer Bust');
      setBjResultMsg(`Dealer busted with ${dTotal}! Won +🌿 ${payout.toLocaleString()} GREEN!`);
      SoundEngine.playVictory(player.soundEnabled);
    } else if (pTotal > dTotal) {
      const payout = bjCurrentBet * 2;
      awardMoney(payout, 'Blackjack Win');
      setBjResultMsg(`You win! (${pTotal} beats Dealer's ${dTotal}). Won +🌿 ${payout.toLocaleString()} GREEN!`);
      SoundEngine.playVictory(player.soundEnabled);
    } else if (pTotal === dTotal) {
      awardMoney(bjCurrentBet, 'Blackjack Push');
      setBjResultMsg(`Push! (${pTotal} to ${dTotal}) - Wager returned.`);
      SoundEngine.playCash(player.soundEnabled);
    } else {
      setBjResultMsg(`Dealer wins with ${dTotal} vs your ${pTotal}. House takes wager.`);
      SoundEngine.playLoss(player.soundEnabled);
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

    const ok = deductMoney(selectedChip, 'Craps Bet');
    if (!ok) {
      setCrapsResultMsg('Insufficient pocket GREEN.');
      return;
    }

    setIsRollingCraps(true);
    setCrapsResultMsg(null);
    SoundEngine.playDiceRoll(player.soundEnabled);

    let frames = 0;
    const rollAnim = setInterval(() => {
      setDiceRolls([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      frames++;
      if (frames > 7) {
        clearInterval(rollAnim);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDiceRolls([d1, d2]);
        setIsRollingCraps(false);
        const total = d1 + d2;

        let payout = 0;
        let won = false;
        let isPush = false;

        if (crapsBetType === 'PASS_LINE') {
          if (total === 7 || total === 11) {
            won = true;
            payout = selectedChip * 2;
          } else if (total === 2 || total === 3 || total === 12) {
            won = false;
          } else {
            won = true;
            payout = Math.round(selectedChip * 1.5);
          }
        } else if (crapsBetType === 'DONT_PASS') {
          if (total === 2 || total === 3) {
            won = true;
            payout = selectedChip * 2;
          } else if (total === 12) {
            isPush = true;
            payout = selectedChip;
          } else {
            won = false;
          }
        } else if (crapsBetType === 'FIELD') {
          if (total === 2 || total === 12) {
            won = true;
            payout = selectedChip * 3;
          } else if ([3, 4, 9, 10, 11].includes(total)) {
            won = true;
            payout = selectedChip * 2;
          } else {
            won = false;
          }
        }

        if (won && payout > 0) {
          awardMoney(payout, 'Craps Win');
          SoundEngine.playVictory(player.soundEnabled);
          setCrapsResultMsg(`🎉 Rolled ${d1} + ${d2} = ${total}! Won +🌿 ${payout.toLocaleString()} GREEN!`);
        } else if (isPush) {
          awardMoney(payout, 'Craps Push');
          SoundEngine.playCash(player.soundEnabled);
          setCrapsResultMsg(`Push on 12! Wager returned.`);
        } else {
          SoundEngine.playLoss(player.soundEnabled);
          setCrapsResultMsg(`Rolled ${d1} + ${d2} = ${total}. House takes 🌿 ${selectedChip.toLocaleString()} GREEN.`);
        }
      }
    }, 110);
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

    const ok = deductMoney(selectedChip, 'Keno Draw');
    if (!ok) {
      setKenoResultMsg('Insufficient pocket GREEN.');
      return;
    }

    setIsDrawingKeno(true);
    setKenoDrawn([]);
    setKenoResultMsg(null);

    const drawnPool = new Set<number>();
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
        const matchCount = matches.length;

        let multiplier = 0;
        if (kenoSelected.length === 1 && matchCount === 1) multiplier = 2.5;
        else if (kenoSelected.length <= 4 && matchCount >= 2) multiplier = matchCount * 2;
        else if (kenoSelected.length >= 5 && matchCount >= 3) multiplier = matchCount * 3;

        if (multiplier > 0) {
          const payout = Math.round(selectedChip * multiplier);
          awardMoney(payout, `Keno ${matchCount} Matches`);
          SoundEngine.playVictory(player.soundEnabled);
          setKenoResultMsg(`🎉 Matched ${matchCount} numbers! Won +🌿 ${payout.toLocaleString()} GREEN!`);
        } else {
          SoundEngine.playLoss(player.soundEnabled);
          setKenoResultMsg(`Matched ${matchCount} numbers. House takes 🌿 ${selectedChip.toLocaleString()} GREEN.`);
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
    const ok = deductMoney(selectedChip, 'Scratch Ticket Purchase');
    if (!ok) {
      setScratchResultMsg('Insufficient pocket GREEN.');
      return;
    }

    const symbols = [
      { symbol: 'GREEN', icon: '🌿' },
      { symbol: 'DIAMOND', icon: '💎' },
      { symbol: 'CASH', icon: '💰' },
      { symbol: 'GUN', icon: '🔫' },
      { symbol: 'CHERRY', icon: '🍒' },
    ];

    const isWinner = Math.random() < 0.35;
    let tiles: ScratchTile[] = [];
    if (isWinner) {
      const winSym = symbols[Math.floor(Math.random() * symbols.length)];
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

    if (updated.every((t) => t.revealed)) {
      const counts: Record<string, number> = {};
      updated.forEach((t) => {
        counts[t.symbol] = (counts[t.symbol] || 0) + 1;
      });
      const match = Object.entries(counts).find(([_, count]) => count >= 3);
      if (match) {
        const mult = match[0] === 'GREEN' ? 10 : match[0] === 'DIAMOND' ? 5 : 3;
        const payout = selectedChip * mult;
        awardMoney(payout, `Scratcher 3x ${match[0]}`);
        setScratchResultMsg(`★ JACKPOT! 3x Matching ${match[0]} revealed! Won +🌿 ${payout.toLocaleString()} GREEN! ★`);
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

    const ok = deductMoney(selectedChip, 'Drag Race Bet');
    if (!ok) {
      setRaceResultMsg('Insufficient pocket GREEN.');
      return;
    }

    setIsRacing(true);
    setRacersProgress([0, 0, 0, 0]);
    setRaceResultMsg(null);
    SoundEngine.playHit(player.soundEnabled);

    const chosenIndex = RACERS.findIndex((r) => r.id === selectedRacerId);
    const chosenRacer = RACERS[chosenIndex];

    const currentPositions = [0, 0, 0, 0];
    const raceInterval = setInterval(() => {
      let finished = false;
      let winnerIdx = -1;

      for (let i = 0; i < 4; i++) {
        const boost = Math.random() * 9 + 4;
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
          const payout = Math.round(selectedChip * chosenRacer.odds);
          awardMoney(payout, `Drag Race ${winningRacer.name}`);
          setRaceResultMsg(`🏁 ${winningRacer.name} WON THE RACE! Won +🌿 ${payout.toLocaleString()} GREEN!`);
          SoundEngine.playVictory(player.soundEnabled);
        } else {
          setRaceResultMsg(`🏁 ${winningRacer.name} crossed first. Your car placed #${winnerIdx + 1}. House takes wager.`);
          SoundEngine.playLoss(player.soundEnabled);
        }
      }
    }, 110);
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

          <div className="text-center sm:text-right bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-xl">
            <span className="text-[10px] font-mono text-purple-400 block tracking-widest uppercase">
              🌿 Progressive Jackpot
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 tracking-tight">
              🌿 {progressiveJackpot.toLocaleString()} GREEN
            </div>
          </div>
        </div>

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
      {/* GAME 2: AUTHENTIC 2D EUROPEAN ROULETTE (TORN FELT & DRAG-AND-DROP)    */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedGame === 'ROULETTE' && (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden font-mono select-none">
          {/* Header & Sub-links */}
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                Lucky Shot Casino • European Single-Zero Felt
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                🎡 Roulette
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-bold">
              <span className="hover:text-emerald-400 cursor-pointer">🕒 Last Games</span>
              <span>•</span>
              <span className="hover:text-emerald-400 cursor-pointer">📊 Statistics</span>
              <span>•</span>
              <button onClick={() => setSelectedGame('SLOTS')} className="hover:text-amber-400 cursor-pointer">
                ↩ Back to Casino
              </button>
            </div>
          </div>

          {/* Tutorial Banner */}
          <div className="my-3 p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800 text-neutral-300 text-xs flex items-start gap-2.5">
            <span className="text-amber-400 text-base shrink-0">💡</span>
            <p className="leading-relaxed">
              <strong>Roulette Tutorial:</strong> To win, attempt to predict where the ball will land. Drag the money chips on to your preferred bet, then click the wheel. The amount you win increases drastically by selecting options which the ball is less likely to land on.
            </p>
          </div>

          {/* Action Prompt Banner */}
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{rouletteResultMsg || 'Please make at least one bet by dragging a chip or clicking a cell.'}</span>
            </div>
            {rouletteWinningPocket && (
              <span className="text-emerald-400 font-bold">
                Last Pocket: {rouletteWinningPocket.num} ({rouletteWinningPocket.color.toUpperCase()})
              </span>
            )}
          </div>

          {/* Felt Arena: Wheel on Left, Authentic Betting Grid on Right */}
          <div className="p-3 sm:p-5 rounded-3xl bg-emerald-950/30 border-2 border-emerald-700/40 shadow-inner">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Wheel Canvas Container (Click to spin) */}
              <div
                onClick={() => {
                  if (!isSpinningRoulette && totalRouletteBet > 0) handleSpinRoulette();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-2xl shrink-0 transition-transform ${
                  !isSpinningRoulette && totalRouletteBet > 0 ? 'cursor-pointer hover:border-emerald-500 hover:scale-[1.01]' : ''
                }`}
                title={totalRouletteBet > 0 ? 'Click wheel to spin!' : 'Place bets to spin'}
              >
                <RouletteWheelCanvas
                  isSpinning={isSpinningRoulette}
                  winningNumber={targetWinningNumber}
                  onSpinComplete={handleRouletteSpinComplete}
                  soundEnabled={player.soundEnabled}
                />
                <span className="mt-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  {isSpinningRoulette ? 'Spinning...' : totalRouletteBet > 0 ? '👉 Click Wheel to Spin!' : 'Place Bets Below'}
                </span>
              </div>

              {/* Authentic Green Felt Betting Board */}
              <div className="flex-1 w-full space-y-2.5">
                {/* Actions: Repeat Bets & Clear Bets */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRepeatBets}
                      disabled={isSpinningRoulette}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 disabled:opacity-40 text-xs text-neutral-300 font-bold cursor-pointer transition-all active:scale-95"
                    >
                      Repeat Bets
                    </button>
                    <button
                      onClick={clearRouletteBets}
                      disabled={isSpinningRoulette || totalRouletteBet === 0}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-rose-800 disabled:opacity-40 text-xs text-neutral-300 font-bold cursor-pointer transition-all active:scale-95"
                    >
                      Clear Bets
                    </button>
                  </div>

                  <span className="text-xs text-neutral-400">
                    Active Bet: <strong className="text-emerald-400">🌿 {totalRouletteBet.toLocaleString()} GREEN</strong>
                  </span>
                </div>

                {/* Top Outside Bets Row (6 Equal Columns) */}
                <div className="grid grid-cols-6 gap-1.5 text-xs font-bold text-center">
                  {[
                    { id: '1-18', label: '1 to 18' },
                    { id: 'EVEN', label: 'EVEN' },
                    { id: 'RED', label: '◆ RED', isRed: true },
                    { id: 'BLACK', label: '◆ BLACK', isBlack: true },
                    { id: 'ODD', label: 'ODD' },
                    { id: '19-36', label: '19 to 36' },
                  ].map((b) => (
                    <div
                      key={b.id}
                      onClick={() => placeRouletteBet(b.id)}
                      onContextMenu={(e) => { e.preventDefault(); removeRouletteBet(b.id); }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                        placeRouletteBet(b.id, val);
                      }}
                      className={`relative py-2.5 px-1 rounded-lg border transition-all cursor-pointer select-none text-center flex items-center justify-center ${
                        b.isRed
                          ? 'bg-rose-900/70 border-rose-600 text-rose-200 hover:bg-rose-800'
                          : b.isBlack
                          ? 'bg-neutral-950 border-neutral-700 text-neutral-200 hover:bg-neutral-900'
                          : 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                      }`}
                    >
                      <span>{b.label}</span>
                      {rouletteBets[b.id] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                            {rouletteBets[b.id] >= 1000 ? `${(rouletteBets[b.id]/1000).toFixed(0)}K` : rouletteBets[b.id]}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Main Number Grid: 0 on Left, 3 Rows x 12 Cols of Numbers + 2-1 on Right */}
                <div className="flex gap-1.5 items-stretch">
                  {/* Single 0 Green Felt (Spans 3 Rows) */}
                  <div
                    onClick={() => placeRouletteBet('0')}
                    onContextMenu={(e) => { e.preventDefault(); removeRouletteBet('0'); }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                      placeRouletteBet('0', val);
                    }}
                    className="w-12 sm:w-14 rounded-lg bg-emerald-900/80 border-2 border-emerald-500 text-emerald-200 hover:bg-emerald-800 font-black text-lg flex items-center justify-center cursor-pointer relative shadow-inner"
                  >
                    <span>0</span>
                    {rouletteBets['0'] && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[10px] font-black text-neutral-950 flex items-center justify-center">
                          {rouletteBets['0'] >= 1000 ? `${(rouletteBets['0']/1000).toFixed(0)}K` : rouletteBets['0']}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 12 Columns x 3 Rows Numbers Grid */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    {/* Row 1 (Top Numbers): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 + Column Bet COL_3 (2-1) */}
                    <div className="flex gap-1.5">
                      <div className="flex-1 grid grid-cols-12 gap-1.5">
                        {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((num) => {
                          const isRed = RED_NUMBERS.includes(num);
                          return (
                            <div
                              key={num}
                              onClick={() => placeRouletteBet(`${num}`)}
                              onContextMenu={(e) => { e.preventDefault(); removeRouletteBet(`${num}`); }}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                                placeRouletteBet(`${num}`, val);
                              }}
                              className={`relative py-2 sm:py-2.5 rounded border text-center font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                                isRed
                                  ? 'bg-rose-950 border-rose-700 text-rose-200 hover:bg-rose-900'
                                  : 'bg-neutral-950 border-neutral-700 text-neutral-200 hover:bg-neutral-900'
                              }`}
                            >
                              <span>{num}</span>
                              {rouletteBets[`${num}`] && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                                    {rouletteBets[`${num}`] >= 1000 ? `${(rouletteBets[`${num}`]/1000).toFixed(0)}K` : rouletteBets[`${num}`]}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Column 3 Bet Button (2-1) */}
                      <div
                        onClick={() => placeRouletteBet('COL_3')}
                        onContextMenu={(e) => { e.preventDefault(); removeRouletteBet('COL_3'); }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                          placeRouletteBet('COL_3', val);
                        }}
                        className="w-10 sm:w-12 rounded bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-neutral-300 font-bold text-xs flex items-center justify-center cursor-pointer relative"
                        title="Column 3 (Pays 2 to 1)"
                      >
                        <span>2-1</span>
                        {rouletteBets['COL_3'] && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                              {rouletteBets['COL_3'] >= 1000 ? `${(rouletteBets['COL_3']/1000).toFixed(0)}K` : rouletteBets['COL_3']}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 2 (Middle Numbers): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 + Column Bet COL_2 (2-1) */}
                    <div className="flex gap-1.5">
                      <div className="flex-1 grid grid-cols-12 gap-1.5">
                        {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((num) => {
                          const isRed = RED_NUMBERS.includes(num);
                          return (
                            <div
                              key={num}
                              onClick={() => placeRouletteBet(`${num}`)}
                              onContextMenu={(e) => { e.preventDefault(); removeRouletteBet(`${num}`); }}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                                placeRouletteBet(`${num}`, val);
                              }}
                              className={`relative py-2 sm:py-2.5 rounded border text-center font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                                isRed
                                  ? 'bg-rose-950 border-rose-700 text-rose-200 hover:bg-rose-900'
                                  : 'bg-neutral-950 border-neutral-700 text-neutral-200 hover:bg-neutral-900'
                              }`}
                            >
                              <span>{num}</span>
                              {rouletteBets[`${num}`] && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                                    {rouletteBets[`${num}`] >= 1000 ? `${(rouletteBets[`${num}`]/1000).toFixed(0)}K` : rouletteBets[`${num}`]}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Column 2 Bet Button (2-1) */}
                      <div
                        onClick={() => placeRouletteBet('COL_2')}
                        onContextMenu={(e) => { e.preventDefault(); removeRouletteBet('COL_2'); }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                          placeRouletteBet('COL_2', val);
                        }}
                        className="w-10 sm:w-12 rounded bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-neutral-300 font-bold text-xs flex items-center justify-center cursor-pointer relative"
                        title="Column 2 (Pays 2 to 1)"
                      >
                        <span>2-1</span>
                        {rouletteBets['COL_2'] && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                              {rouletteBets['COL_2'] >= 1000 ? `${(rouletteBets['COL_2']/1000).toFixed(0)}K` : rouletteBets['COL_2']}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 3 (Bottom Numbers): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34 + Column Bet COL_1 (2-1) */}
                    <div className="flex gap-1.5">
                      <div className="flex-1 grid grid-cols-12 gap-1.5">
                        {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((num) => {
                          const isRed = RED_NUMBERS.includes(num);
                          return (
                            <div
                              key={num}
                              onClick={() => placeRouletteBet(`${num}`)}
                              onContextMenu={(e) => { e.preventDefault(); removeRouletteBet(`${num}`); }}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                                placeRouletteBet(`${num}`, val);
                              }}
                              className={`relative py-2 sm:py-2.5 rounded border text-center font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                                isRed
                                  ? 'bg-rose-950 border-rose-700 text-rose-200 hover:bg-rose-900'
                                  : 'bg-neutral-950 border-neutral-700 text-neutral-200 hover:bg-neutral-900'
                              }`}
                            >
                              <span>{num}</span>
                              {rouletteBets[`${num}`] && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                                    {rouletteBets[`${num}`] >= 1000 ? `${(rouletteBets[`${num}`]/1000).toFixed(0)}K` : rouletteBets[`${num}`]}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Column 1 Bet Button (2-1) */}
                      <div
                        onClick={() => placeRouletteBet('COL_1')}
                        onContextMenu={(e) => { e.preventDefault(); removeRouletteBet('COL_1'); }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                          placeRouletteBet('COL_1', val);
                        }}
                        className="w-10 sm:w-12 rounded bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-neutral-300 font-bold text-xs flex items-center justify-center cursor-pointer relative"
                        title="Column 1 (Pays 2 to 1)"
                      >
                        <span>2-1</span>
                        {rouletteBets['COL_1'] && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                              {rouletteBets['COL_1'] >= 1000 ? `${(rouletteBets['COL_1']/1000).toFixed(0)}K` : rouletteBets['COL_1']}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dozens Row (Under Numbers): 1st 12, 2nd 12, 3rd 12 */}
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold text-center pl-14 sm:pl-16 pr-12 sm:pr-14">
                  {[
                    { id: '1st_12', label: '1st 12' },
                    { id: '2nd_12', label: '2nd 12' },
                    { id: '3rd_12', label: '3rd 12' },
                  ].map((d) => (
                    <div
                      key={d.id}
                      onClick={() => placeRouletteBet(d.id)}
                      onContextMenu={(e) => { e.preventDefault(); removeRouletteBet(d.id); }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const val = parseInt(e.dataTransfer.getData('text/plain'), 10) || selectedChip;
                        placeRouletteBet(d.id, val);
                      }}
                      className="relative py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer flex items-center justify-center"
                    >
                      <span>{d.label}</span>
                      {rouletteBets[d.id] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-white shadow text-[9px] font-black text-neutral-950 flex items-center justify-center">
                            {rouletteBets[d.id] >= 1000 ? `${(rouletteBets[d.id]/1000).toFixed(0)}K` : rouletteBets[d.id]}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chip Denominations Rack (Draggable & Clickable) */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <span className="text-[11px] text-neutral-400 font-bold mr-1">Chips:</span>
                  {[
                    { value: 10, label: '10', bg: 'from-neutral-300 to-neutral-500', text: 'text-neutral-950', ring: 'ring-neutral-300' },
                    { value: 100, label: '100', bg: 'from-amber-300 to-amber-500', text: 'text-neutral-950', ring: 'ring-amber-400' },
                    { value: 1000, label: '1K', bg: 'from-sky-400 to-blue-600', text: 'text-white', ring: 'ring-sky-400' },
                    { value: 10000, label: '10K', bg: 'from-emerald-400 to-emerald-600', text: 'text-white', ring: 'ring-emerald-400' },
                    { value: 100000, label: '100K', bg: 'from-indigo-500 to-purple-700', text: 'text-white', ring: 'ring-indigo-400' },
                    { value: 1000000, label: '1M', bg: 'from-rose-500 to-red-700', text: 'text-white', ring: 'ring-rose-400' },
                    { value: 10000000, label: '10M', bg: 'from-purple-500 to-fuchsia-800', text: 'text-white', ring: 'ring-fuchsia-400' },
                  ].map((c) => {
                    const isSelected = selectedChip === c.value;
                    return (
                      <div
                        key={c.value}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(c.value));
                          e.dataTransfer.effectAllowed = 'copy';
                          setSelectedChip(c.value);
                        }}
                        onClick={() => {
                          setSelectedChip(c.value);
                          SoundEngine.playChipClick(player.soundEnabled);
                        }}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${c.bg} border-2 border-dashed border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[10px] sm:text-xs font-black ${c.text} transition-transform ${
                          isSelected ? 'scale-110 ring-4 ring-amber-400 shadow-amber-500/50' : 'hover:scale-105 opacity-90'
                        }`}
                        title={`Drag & drop onto table or click to select ${c.label}`}
                      >
                        {c.label}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Status Bar (Matching Authentic Torn) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Money</span>
                    <span className="font-bold text-emerald-400">🌿 {(player.money || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Tokens</span>
                    <span className="font-bold text-white">{((player as unknown) as { casinoTokens?: number }).casinoTokens ?? 75}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Current Bet</span>
                    <span className="font-bold text-amber-400">🌿 {totalRouletteBet.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Won</span>
                    <span className="font-bold text-emerald-300">🌿 {lastRouletteWon.toLocaleString()}</span>
                  </div>
                </div>

                {/* Spin Wheel Button */}
                <div className="pt-1">
                  <button
                    onClick={handleSpinRoulette}
                    disabled={isSpinningRoulette || totalRouletteBet === 0}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                      isSpinningRoulette || totalRouletteBet === 0
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-950/40 active:scale-95'
                    }`}
                  >
                    <RotateCw className={`w-4 h-4 ${isSpinningRoulette ? 'animate-spin' : ''}`} />
                    <span>{isSpinningRoulette ? 'Wheel Spinning...' : `Spin Wheel (🌿 ${totalRouletteBet.toLocaleString()} GREEN)`}</span>
                  </button>
                </div>
              </div>
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
              <div className="text-[11px] text-neutral-400">({winStreak} wins in a row) • Multiplier: <span className="text-emerald-400 font-bold">{100 + (winStreak * 50)}%</span></div>
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
                    💰 Cash Out (+🌿 {currentPot.toLocaleString()} GREEN)
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
