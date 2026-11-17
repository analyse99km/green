'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Zap,
  Sparkles,
  Utensils,
  Shield,
  Activity,
  Smile,
  Check,
  Lock,
  BatteryCharging,
  TrendingUp,
  Sprout,
  TreeDeciduous,
  Leaf,
  Layers,
  ArrowUpRight,
  Users,
  X,
} from 'lucide-react';
import ReferralView from './ReferralView';
import { SoundEngine } from '../gameAudio';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export type BotanicalCategory = 'ALL' | 'SPORES' | 'FLORA' | 'BIG_TREES' | 'COSMIC';

export default function DreamTapView() {
  const {
    player,
    tapDreamEnergy,
    exchangeDreamSparks,
    upgradeDreamCard,
    unlockTapperSkin,
    equipTapperSkin,
    installBodyAugmentation,
  } = useGame();

  const [activeSubTab, setActiveSubTab] = useState<'TAP_CORE' | 'IDLE_CARDS' | 'PLANTS' | 'MARKET' | 'REFERRALS'>('TAP_CORE');
  const [selectedCategory, setSelectedCategory] = useState<BotanicalCategory>('ALL');
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastCardUpgrade, setLastCardUpgrade] = useState<{
    cardId: string;
    message: string;
    success: boolean;
  } | null>(null);
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [isPressing, setIsPressing] = useState(false);

  const isAwakened = Boolean(
    (player.money || 0) > 0 &&
    (player.energy || 0) > 0 &&
    (player.nerve || 0) > 0 &&
    (player.happy || 0) > 0 &&
    (player.life || 0) > 0 &&
    (player.food || 0) > 0
  );

  const cards = player.dreamCards || {};
  const unlockedPlants = player.unlockedTapperSkins || ['tree_sprout'];
  const activePlant = player.activeTapperSkinId || 'tree_sprout';
  const augmentations = player.bodyAugmentations || [];

  const autoSparksPerSec =
    (cards.card_photosynthesis || 0) * 1 +
    (cards.card_mycelium || 0) * 3 +
    (cards.card_spore_chamber || 0) * 8 +
    (cards.card_bioluminescent_algae || 0) * 18 +
    (cards.card_cordyceps || 0) * 35 +
    (cards.card_greenhouse || 0) * 75 +
    (cards.card_hydroponic_array || 0) * 150 +
    (cards.card_ginseng || 0) * 320 +
    (cards.card_ayahuasca || 0) * 680 +
    (cards.card_mango || 0) * 1400 +
    (cards.card_coconut || 0) * 2800 +
    (cards.card_baobab || 0) * 5500 +
    (cards.card_redwood || 0) * 11000 +
    (cards.card_sacred_grove || 0) * 22000 +
    (cards.card_genetic_synthesizer || 0) * 50000 +
    (cards.card_quantum_chloroplast || 0) * 110000 +
    (cards.card_yggdrasil_uplink || 0) * 280000;

  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if ((player.tapStamina ?? 500) <= 0) {
      setFeedback('⚠️ Tap Stamina exhausted! Refills +10 every 15 seconds.');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    const res = tapDreamEnergy();
    SoundEngine.playTap(player.soundEnabled);
    setCombo(res.comboStreak);

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newFloater: FloatingText = {
      id: Date.now() + Math.random(),
      text: res.comboStreak % 10 === 0 ? `🌿 +${res.sparksEarned} Sparks & +1 ENERGY!` : `+${res.sparksEarned}`,
      x: (clientX % 80) + 40,
      y: (clientY % 50) + 20,
      color: res.comboStreak > 10 ? 'text-amber-300' : 'text-emerald-300',
    };

    setFloaters((prev) => [...prev.slice(-6), newFloater]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== newFloater.id));
    }, 900);
  };

  const handleExchange = (exchangeId: string) => {
    const res = exchangeDreamSparks(exchangeId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCardUpgrade = (cardId: string) => {
    const res = upgradeDreamCard(cardId);
    setFeedback(res.message);
    setLastCardUpgrade({ cardId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handlePlantAction = (plantId: string) => {
    if (unlockedPlants.includes(plantId)) {
      const res = equipTapperSkin(plantId);
      setFeedback(res.message);
    } else {
      const res = unlockTapperSkin(plantId);
      setFeedback(res.message);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleInstallAugmentation = (augId: string) => {
    const res = installBodyAugmentation(augId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  // 16 Categorized Botanical Idle Cards Definitions
  const botanicalCards = [
    // 🍄 SECTION 1: Mini Spores & Fungi
    {
      id: 'card_photosynthesis',
      title: 'Micro Chlorophyll Sprout',
      flavor: 'Absorbs residual dreamlight to convert into organic spark energy.',
      baseCost: 25,
      sparksPerSec: 1,
      icon: '🌱',
      category: 'SPORES' as const,
      badge: 'Mini Spore',
    },
    {
      id: 'card_mycelium',
      title: 'Sub-Terranean Mycelium',
      flavor: 'Underground fungal threads transmitting subterranean bio-nutrients.',
      baseCost: 80,
      sparksPerSec: 3,
      icon: '🍄',
      category: 'SPORES' as const,
      badge: 'Fungi Colony',
    },
    {
      id: 'card_spore_chamber',
      title: 'Spore Dispersion Chamber',
      flavor: 'Aerosolized bio-luminescent spores floating through sleep cycles.',
      baseCost: 250,
      sparksPerSec: 8,
      icon: '✨',
      category: 'SPORES' as const,
      badge: 'Spore Cloud',
    },
    {
      id: 'card_bioluminescent_algae',
      title: 'Bioluminescent Neon Algae',
      flavor: 'High-density photosynthetic cyanobacteria emitting constant neon sparks.',
      baseCost: 650,
      sparksPerSec: 18,
      icon: '🌊',
      category: 'SPORES' as const,
      badge: 'Neon Algae',
    },
    {
      id: 'card_cordyceps',
      title: 'Golden Cordyceps Colony',
      flavor: 'Rare parasitic fungi network generating rapid synaptic bio-electricity.',
      baseCost: 1500,
      sparksPerSec: 35,
      icon: '🧪',
      category: 'SPORES' as const,
      badge: 'Rare Fungi',
    },

    // 🌿 SECTION 2: Medicinal Shrubs & Flora
    {
      id: 'card_greenhouse',
      title: 'Geodesic Greenhouse Dome',
      flavor: 'Controlled climate biome accelerating botanical cell division.',
      baseCost: 3200,
      sparksPerSec: 75,
      icon: '🌿',
      category: 'FLORA' as const,
      badge: 'Biome Dome',
    },
    {
      id: 'card_hydroponic_array',
      title: 'Hydroponic Nutrient Canopy',
      flavor: 'Computer-calibrated mineral cascades feeding glowing root systems.',
      baseCost: 7500,
      sparksPerSec: 150,
      icon: '💧',
      category: 'FLORA' as const,
      badge: 'Hydroponics',
    },
    {
      id: 'card_ginseng',
      title: 'Ancient Panax Ginseng',
      flavor: 'Centuries-old mountain root synthesizing endurance vital resonance.',
      baseCost: 16000,
      sparksPerSec: 320,
      icon: '🪴',
      category: 'FLORA' as const,
      badge: 'Medicinal Herb',
    },
    {
      id: 'card_ayahuasca',
      title: 'Amazonian Sacred Vine',
      flavor: 'Psychoactive jungle vine unlocking higher-dimensional spark clarity.',
      baseCost: 35000,
      sparksPerSec: 680,
      icon: '🎋',
      category: 'FLORA' as const,
      badge: 'Sacred Shrub',
    },

    // 🌴 SECTION 3: Big Trees & Tropical Flora
    {
      id: 'card_mango',
      title: 'Giant Alphonso Mango Arbor',
      flavor: 'Heirloom giant mango tree laden with rich solar-infused nectar fruit.',
      baseCost: 75000,
      sparksPerSec: 1400,
      icon: '🥭',
      category: 'BIG_TREES' as const,
      badge: 'Fruit Canopy',
    },
    {
      id: 'card_coconut',
      title: 'Coastal Coconut Palm Grove',
      flavor: 'Towering salt-mist coconut palms with resilient fiber-optic trunks.',
      baseCost: 150000,
      sparksPerSec: 2800,
      icon: '🥥',
      category: 'BIG_TREES' as const,
      badge: 'Tropical Palm',
    },
    {
      id: 'card_baobab',
      title: 'Millennium Baobab Sanctuary',
      flavor: 'Prehistoric tree of life storing tens of thousands of gallons of vital sap.',
      baseCost: 320000,
      sparksPerSec: 5500,
      icon: '🌳',
      category: 'BIG_TREES' as const,
      badge: 'Ancient Giant',
    },
    {
      id: 'card_redwood',
      title: 'Pacific Redwood Titan',
      flavor: 'Thousand-foot colossal redwoods reaching straight through cloud banks.',
      baseCost: 700000,
      sparksPerSec: 11000,
      icon: '🌲',
      category: 'BIG_TREES' as const,
      badge: 'Titan Redwood',
    },

    // ⚡ SECTION 4: Cosmic & Quantum World Trees
    {
      id: 'card_sacred_grove',
      title: 'Sacred Ancient Druid Grove',
      flavor: 'Thousand-year-old giants anchoring the dreaming subconscious.',
      baseCost: 1500000,
      sparksPerSec: 22000,
      icon: '🌌',
      category: 'COSMIC' as const,
      badge: 'Cosmic Sanctuary',
    },
    {
      id: 'card_genetic_synthesizer',
      title: 'Botanical DNA Synthesizer',
      flavor: 'Engineers hyper-efficient genetic strains of energy-yielding flora.',
      baseCost: 3500000,
      sparksPerSec: 50000,
      icon: '🧬',
      category: 'COSMIC' as const,
      badge: 'Bio-Synthesis',
    },
    {
      id: 'card_quantum_chloroplast',
      title: 'Quantum Chloroplast Array',
      flavor: 'Superconductive quantum flora harvesting zero-point vacuum energy.',
      baseCost: 8000000,
      sparksPerSec: 110000,
      icon: '⚛️',
      category: 'COSMIC' as const,
      badge: 'Quantum Flora',
    },
    {
      id: 'card_yggdrasil_uplink',
      title: 'Yggdrasil Celestial Uplink',
      flavor: 'Direct synaptic conduit to the legendary Cosmic World Tree of Life.',
      baseCost: 20000000,
      sparksPerSec: 280000,
      icon: '🌠',
      category: 'COSMIC' as const,
      badge: 'World Tree',
    },
  ];

  // 8 Plant & Tree Evolution Stages
  const plantEvolutionStages = [
    {
      id: 'tree_sprout',
      name: 'Seedling Sprout (Stage 1)',
      desc: 'Humble young green sprout emerging from the rich soil.',
      bonus: '1x Base (1 Spark/tap)',
      icon: '🌱',
      sparksCost: 0,
      greenCost: 0,
      style: 'from-emerald-500 to-green-600 ring-emerald-400',
    },
    {
      id: 'tree_mint',
      name: 'Mint Basil Shrub (Stage 2)',
      desc: 'Fragrant, resilient herb cluster with doubled aromatic vitality.',
      bonus: '2x (2 Sparks/tap)',
      icon: '🌿',
      sparksCost: 150,
      greenCost: 0,
      style: 'from-teal-500 to-emerald-600 ring-teal-400',
    },
    {
      id: 'tree_bonsai',
      name: 'Zen Bonsai Pine (Stage 3)',
      desc: 'Meticulously cultivated miniature evergreen of supreme balance.',
      bonus: '4x (4 Sparks/tap)',
      icon: '🪴',
      sparksCost: 400,
      greenCost: 0,
      style: 'from-green-600 to-lime-700 ring-lime-400',
    },
    {
      id: 'tree_bamboo',
      name: 'Lucky Bamboo Grove (Stage 4)',
      desc: 'Fast-growing flexible stalks channeling vital currents.',
      bonus: '8x (8 Sparks/tap)',
      icon: '🎋',
      sparksCost: 1000,
      greenCost: 0,
      style: 'from-lime-500 to-emerald-700 ring-lime-300',
    },
    {
      id: 'tree_oak',
      name: 'Sacred Ancient Oak (Stage 5)',
      desc: 'Majestic broadleaf tree with expansive canopy and strong roots.',
      bonus: '16x (16 Sparks/tap)',
      icon: '🌳',
      sparksCost: 2500,
      greenCost: 0,
      style: 'from-amber-600 to-emerald-800 ring-amber-400',
    },
    {
      id: 'tree_cyberpalm',
      name: 'Cybernetic Bio-Palm (Stage 6)',
      desc: 'Neon-infused cyber-flora glowing with digital sap and fiber optics.',
      bonus: '32x (32 Sparks/tap)',
      icon: '🌴',
      sparksCost: 6000,
      greenCost: 0,
      style: 'from-cyan-500 via-emerald-500 to-teal-700 ring-cyan-300',
    },
    {
      id: 'tree_redwood',
      name: 'Giant California Redwood (Stage 7)',
      desc: 'Colossal ancient pillar towering thousands of feet into the sky.',
      bonus: '75x (75 Sparks/tap)',
      icon: '🌲',
      sparksCost: 15000,
      greenCost: 0,
      style: 'from-emerald-700 via-green-800 to-neutral-900 ring-emerald-500',
    },
    {
      id: 'tree_yggdrasil',
      name: 'Yggdrasil Tree of Life (Stage 8)',
      desc: 'The divine cosmic world tree connecting all realms of consciousness.',
      bonus: '200x (200 Sparks/tap!)',
      icon: '🌌',
      sparksCost: 40000,
      greenCost: 50,
      style: 'from-purple-600 via-emerald-500 to-cyan-500 ring-purple-300',
    },
  ];

  // Botanical Bio-Augmentations
  const botanicalAugmentations = [
    {
      id: 'aug_bark_armor',
      title: 'Ironwood Bark Plating',
      desc: 'Permanent +30 Defense to your Battle Stats.',
      sparks: 200,
      green: 20,
      icon: '🛡️',
    },
    {
      id: 'aug_chlorophyll_lungs',
      title: 'Chlorophyll Bio-Lungs',
      desc: 'Permanent +20 Max Energy capacity.',
      sparks: 350,
      green: 25,
      icon: '🫁',
    },
    {
      id: 'aug_neural_vine',
      title: 'Neural Bio-Vine Synapses',
      desc: 'Permanent +5 Max Nerve capacity.',
      sparks: 400,
      green: 30,
      icon: '🧠',
    },
    {
      id: 'aug_ironwood_muscles',
      title: 'Ironwood Lignin Muscle Weave',
      desc: 'Permanent +30 Strength to your Battle Stats.',
      sparks: 250,
      green: 20,
      icon: '🦾',
    },
    {
      id: 'aug_tap_chloroplast',
      title: 'Enduring Tap Chloroplast',
      desc: 'Permanent +250 Max Tap Stamina capacity.',
      sparks: 500,
      green: 35,
      icon: '🔋',
    },
  ];

  const currentPlant = plantEvolutionStages.find((p) => p.id === activePlant) || plantEvolutionStages[0];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-emerald-950/40 to-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h2 className="text-xl font-bold text-white">Lucid Dream Botanical Sanctuary</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Cultivate your inner plant species, evolve legendary trees, and level up <strong>Botanical Idle Cards</strong> for round-the-clock spark production. Exchange sparks for real Energy, Satiety Food, and permanent Bio-Augmentations!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sparks Bank */}
            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs flex items-center gap-2.5">
              <div>
                <span className="text-[10px] text-neutral-500 block">Dream Sparks Bank</span>
                <span className="text-emerald-400 font-bold text-sm sm:text-base flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{(player.dreamPoints || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-500 font-normal">Sparks</span>
                </span>
              </div>
            </div>

            {/* Passive Rate Pill */}
            <div className="bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 font-mono text-xs">
              <span className="text-[10px] text-neutral-500 block">Passive Income</span>
              <span className="text-cyan-400 font-bold text-xs sm:text-sm flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{autoSparksPerSec} Sparks/s</span>
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs text-center font-bold">
            {feedback}
          </div>
        )}
      </div>

      {/* Operative Awakening Banner & Vital Checklist (Shown when any vital is 0) */}
      {!isAwakened && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-indigo-950/80 border border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Pioneer Awakening: Restore All 6 Vitals to Unlock Metropolis
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              AWAKENING PHASE
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            All new operatives begin at zero. Tap the <strong>Plant Core</strong> below to harvest Dream Sparks, then visit the <strong>Dream Market</strong> tab to make all 6 vitals above zero!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-mono text-xs">
            <div className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 ${player.money > 0 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
              <div>
                <span className="text-[10px] text-neutral-500 block">1. Currency</span>
                <span className="font-bold text-white">🌿 GREEN</span>
              </div>
              {player.money > 0 ? (
                <span className="text-emerald-400 font-bold text-[11px]">✓ {player.money} Coins</span>
              ) : (
                <button onClick={() => { setActiveSubTab('MARKET'); handleExchange('GREEN_STARTER'); }} className="py-1 px-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all cursor-pointer">
                  Mint (15✨)
                </button>
              )}
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 ${player.energy > 0 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
              <div>
                <span className="text-[10px] text-neutral-500 block">2. Energy</span>
                <span className="font-bold text-white">⚡ Stamina</span>
              </div>
              {player.energy > 0 ? (
                <span className="text-emerald-400 font-bold text-[11px]">✓ {player.energy} Energy</span>
              ) : (
                <button onClick={() => { setActiveSubTab('MARKET'); handleExchange('ENERGY_STEM'); }} className="py-1 px-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all cursor-pointer">
                  Stem (25✨)
                </button>
              )}
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 ${player.nerve > 0 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
              <div>
                <span className="text-[10px] text-neutral-500 block">3. Nerve</span>
                <span className="font-bold text-white">🛡️ Courage</span>
              </div>
              {player.nerve > 0 ? (
                <span className="text-emerald-400 font-bold text-[11px]">✓ {player.nerve} Nerve</span>
              ) : (
                <button onClick={() => { setActiveSubTab('MARKET'); handleExchange('NERVE_NECTAR'); }} className="py-1 px-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-all cursor-pointer">
                  Nectar (30✨)
                </button>
              )}
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 ${player.happy > 0 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
              <div>
                <span className="text-[10px] text-neutral-500 block">4. Happy</span>
                <span className="font-bold text-white">😊 Morale</span>
              </div>
              {player.happy > 0 ? (
                <span className="text-emerald-400 font-bold text-[11px]">✓ {player.happy} Happy</span>
              ) : (
                <button onClick={() => { setActiveSubTab('MARKET'); handleExchange('HAPPY_FLORA'); }} className="py-1 px-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all cursor-pointer">
                  Flora (20✨)
                </button>
              )}
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 ${player.life > 0 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
              <div>
                <span className="text-[10px] text-neutral-500 block">5. Life</span>
                <span className="font-bold text-white">💖 Health</span>
              </div>
              {player.life > 0 ? (
                <span className="text-emerald-400 font-bold text-[11px]">✓ {player.life} Life</span>
              ) : (
                <button onClick={() => { setActiveSubTab('MARKET'); handleExchange('LIFE_SAP'); }} className="py-1 px-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all cursor-pointer">
                  Sap (35✨)
                </button>
              )}
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 ${player.food > 0 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}>
              <div>
                <span className="text-[10px] text-neutral-500 block">6. Food</span>
                <span className="font-bold text-white">🍞 Satiety</span>
              </div>
              {player.food > 0 ? (
                <span className="text-emerald-400 font-bold text-[11px]">✓ {player.food} Food</span>
              ) : (
                <button onClick={() => { setActiveSubTab('MARKET'); handleExchange('FOOD_SOURDOUGH'); }} className="py-1 px-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold transition-all cursor-pointer">
                  Sourdough (40✨)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 max-w-full overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('TAP_CORE')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'TAP_CORE'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>🌱 Plant Core</span>
        </button>

        <button
          onClick={() => setActiveSubTab('IDLE_CARDS')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'IDLE_CARDS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>🃏 Botanical Cards (16)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PLANTS')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'PLANTS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>🌳 Tree Evolution (8)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MARKET')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'MARKET'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>🏪 Dream Market</span>
        </button>

        <button
          onClick={() => setActiveSubTab('REFERRALS')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'REFERRALS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>👥 Syndicate Referrals</span>
        </button>
      </div>

      {/* SUB-TAB 1: PLANT TAP CORE */}
      {activeSubTab === 'TAP_CORE' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Background Radial Glow */}
            <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Tap Stamina Bar */}
            <div className="w-full max-w-xs mb-6 font-mono text-xs">
              <div className="flex justify-between items-center text-neutral-400 mb-1">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <BatteryCharging className="w-3.5 h-3.5" /> Tap Stamina
                </span>
                <span>
                  {player.tapStamina ?? 500}/{player.maxTapStamina ?? 500}
                </span>
              </div>
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((player.tapStamina ?? 500) / (player.maxTapStamina ?? 500)) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 text-center block mt-1">
                Refills +10 stamina every 15s • Tap power acts as tapping fuel
              </span>
            </div>

            {/* Current Plant Active Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{currentPlant.icon}</span>
              <span className="font-bold text-white text-sm">{currentPlant.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {currentPlant.bonus}
              </span>
            </div>

            {/* THE BIG PLANT TAPPER COIN BUTTON */}
            <div className="relative my-4">
              <button
                onClick={handleTap}
                onTouchStart={() => setIsPressing(true)}
                onTouchEnd={() => setIsPressing(false)}
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr ${currentPlant.style} p-1.5 shadow-2xl ring-4 transition-transform duration-75 select-none cursor-pointer flex items-center justify-center ${
                  isPressing ? 'scale-90 shadow-inner' : 'scale-100 hover:scale-105 active:scale-95'
                }`}
              >
                <div className="w-full h-full rounded-full bg-neutral-950/85 backdrop-blur-sm flex flex-col items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-6xl sm:text-7xl filter drop-shadow-lg animate-bounce select-none">
                    {currentPlant.icon}
                  </span>
                  <span className="font-black text-xs sm:text-sm tracking-wider text-emerald-300 uppercase mt-1">
                    TAP PLANT
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400/80">
                    {currentPlant.bonus}
                  </span>
                </div>
              </button>

              {/* Floating Sparks Animation Numbers */}
              {floaters.map((f) => (
                <div
                  key={f.id}
                  className={`absolute pointer-events-none font-black text-sm sm:text-base font-mono animate-floatUp ${f.color}`}
                  style={{ top: `${f.y}%`, left: `${f.x}%` }}
                >
                  {f.text}
                </div>
              ))}
            </div>

            {/* Combo Streak Ribbon */}
            <div className="mt-4 flex items-center gap-3 font-mono text-xs">
              <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-300 flex items-center gap-2">
                <span>Streak:</span>
                <span className="text-amber-400 font-bold text-sm">{combo}x</span>
                {combo >= 10 && <span className="text-[10px] text-emerald-400 font-bold">⚡ ENERGY SYNC!</span>}
              </div>

              <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 text-[11px]">
                Total Taps: <strong className="text-white">{(player.totalTaps || 0).toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 font-mono mt-4 text-center max-w-sm">
              💡 Every 10 consecutive taps grants <strong>+1 Real Energy</strong> directly to your character!
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BOTANICAL IDLE CARDS (16 CARDS ORGANIZED IN 4 CATEGORIES) */}
      {activeSubTab === 'IDLE_CARDS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono">
            <span className="text-neutral-300">
              Idle Botanical Cards generate round-the-clock sparks automatically even while offline!
            </span>
            <span className="text-emerald-400 font-bold">
              Total Production: +{autoSparksPerSec} Sparks/sec
            </span>
          </div>

          {/* Section Category Filter Tabs (Mini Spores, Shrubs/Flora, Big Trees, Cosmic World Trees) */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              All Cards ({botanicalCards.length})
            </button>
            <button
              onClick={() => setSelectedCategory('SPORES')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'SPORES'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              🍄 Mini Spores & Fungi (5)
            </button>
            <button
              onClick={() => setSelectedCategory('FLORA')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'FLORA'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              🌿 Shrubs & Flora (4)
            </button>
            <button
              onClick={() => setSelectedCategory('BIG_TREES')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'BIG_TREES'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              🌴 Big Trees (Mango/Coconut) (4)
            </button>
            <button
              onClick={() => setSelectedCategory('COSMIC')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'COSMIC'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              ⚡ Cosmic World Trees (4)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {botanicalCards
              .filter((card) => selectedCategory === 'ALL' || card.category === selectedCategory)
              .map((card) => {
              const currentLvl = cards[card.id] || 0;
              const nextCost = Math.round(card.baseCost * Math.pow(1.35, currentLvl));
              const canAfford = (player.dreamPoints || 0) >= nextCost;

              return (
                <div
                  key={card.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                          {card.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm">{card.title}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            Level {currentLvl} • Produces +{card.sparksPerSec * currentLvl} Sparks/s
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                        Base: +{card.sparksPerSec}/s
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">{card.flavor}</p>
                  </div>

                  <button
                    onClick={() => handleCardUpgrade(card.id)}
                    className={`w-full py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-between transition-all cursor-pointer shadow active:scale-95 ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                        : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700/60'
                    }`}
                  >
                    <span>Upgrade to Lvl {currentLvl + 1}</span>
                    <span className="text-[11px] font-normal">{nextCost.toLocaleString()} Sparks</span>
                  </button>

                  {lastCardUpgrade?.cardId === card.id && (
                    <div
                      className={`mt-2 p-2 rounded-xl text-[11px] font-mono animate-fadeIn flex items-center gap-1.5 shadow ${
                        lastCardUpgrade.success
                          ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/90 border border-rose-500/50 text-rose-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                      <span>{lastCardUpgrade.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PLANT & TREE EVOLUTION STAGES (8 STAGES) */}
      {activeSubTab === 'PLANTS' && (
        <div className="space-y-4">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300">
            Evolve your inner plant species to permanently multiply your sparks per tap! Each stage embodies a distinct tree archetype.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plantEvolutionStages.map((plant) => {
              const isUnlocked = unlockedPlants.includes(plant.id);
              const isActive = activePlant === plant.id;
              const canAfford =
                (player.dreamPoints || 0) >= plant.sparksCost &&
                (plant.greenCost === 0 || (player.money || 0) >= plant.greenCost);

              return (
                <div
                  key={plant.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                        {plant.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">{plant.name}</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          {plant.bonus}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 mb-3">{plant.desc}</p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] font-mono text-neutral-400">
                      {isUnlocked ? (
                        <span className="text-emerald-400 font-bold">✓ Unlocked</span>
                      ) : (
                        <span>
                          Cost: {plant.sparksCost.toLocaleString()} Sparks
                          {plant.greenCost > 0 ? ` + 🌿 ${plant.greenCost} GREEN` : ''}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlantAction(plant.id)}
                      disabled={!isUnlocked && !canAfford}
                      className={`px-4 py-1.5 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-neutral-800 text-neutral-500 cursor-default'
                          : isUnlocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                          : canAfford
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow'
                          : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      {isActive ? 'Equipped' : isUnlocked ? 'Equip Species' : 'Evolve Plant'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DREAM MARKET & EXCHANGE */}
      {activeSubTab === 'MARKET' && (
        <div className="space-y-6">
          {/* Section 1: Vitals & Energy Stems */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" /> Botanical Vitality Stems
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 font-mono">
                    <span>⚡ Energy Stem</span>
                    <span>25 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Converts dream resonance into +10 Energy.</p>
                </div>
                <button
                  onClick={() => handleExchange('ENERGY_STEM')}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Exchange (25 Sparks)
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-amber-400 font-mono">
                    <span>🛡️ Nerve Nectar</span>
                    <span>30 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Calms street anxiety and restores +5 Nerve.</p>
                </div>
                <button
                  onClick={() => handleExchange('NERVE_NECTAR')}
                  className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Exchange (30 Sparks)
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-blue-400 font-mono">
                    <span>😊 Happy Blossom</span>
                    <span>20 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Floral bliss that boosts +25 Happy.</p>
                </div>
                <button
                  onClick={() => handleExchange('HAPPY_FLORA')}
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Exchange (20 Sparks)
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-rose-400 font-mono">
                    <span>💖 Life Sap</span>
                    <span>35 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Reconstructs damaged tissue with +50 HP.</p>
                </div>
                <button
                  onClick={() => handleExchange('LIFE_SAP')}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Exchange (35 Sparks)
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Gourmet Botanical Harvest Food (Satiety) */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-400" /> Gourmet Harvest Food (Prevents Starvation!)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-orange-400 font-mono">
                    <span>🍞 Sprout Sourdough</span>
                    <span>40 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Organic nutrient-rich loaf. Restores +35 Food Satiety & +15 Happy.
                  </p>
                </div>
                <button
                  onClick={() => handleExchange('FOOD_SOURDOUGH')}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Eat Sourdough (40 Sparks)
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-orange-400 font-mono">
                    <span>🥗 Hydroponic Salad</span>
                    <span>75 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Mineral-packed leafy green bowl. Restores +60 Food Satiety, +20 Life & +25 Happy.
                  </p>
                </div>
                <button
                  onClick={() => handleExchange('FOOD_SUPERFOOD')}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Eat Salad (75 Sparks)
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-orange-400 font-mono">
                    <span>🍇 Yggdrasil Ambrosia</span>
                    <span>150 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Legendary celestial fruit. Restores 100% Full Satiety, +15 Energy & +40 Life!
                  </p>
                </div>
                <button
                  onClick={() => handleExchange('FOOD_AMBROSIA')}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Eat Ambrosia (150 Sparks)
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Sparks to GREEN Coins Currency Mint */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <span>🌿</span> Sparks-to-GREEN Currency Mint
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/40 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 font-mono">
                    <span>🌿 Starter Mint: 10 GREEN</span>
                    <span className="text-amber-400">15 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Awaken your currency! Converts 15 sparks into 10 liquid GREEN coins.</p>
                </div>
                <button
                  onClick={() => handleExchange('GREEN_STARTER')}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Mint 🌿 10 GREEN (15 Sparks)
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 font-mono">
                    <span>🌿 Mint 50 GREEN</span>
                    <span>500 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Converts 500 Sparks directly into 50 real GREEN coins.</p>
                </div>
                <button
                  onClick={() => handleExchange('GREEN_50')}
                  className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Mint 🌿 50 GREEN
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 font-mono">
                    <span>🌿 Mint 250 GREEN</span>
                    <span>2,200 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Bulk mint 250 real GREEN coins for your street expenses.</p>
                </div>
                <button
                  onClick={() => handleExchange('GREEN_250')}
                  className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Mint 🌿 250 GREEN
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 font-mono">
                    <span>🌿 Mint 1,000 GREEN</span>
                    <span>8,000 Sparks</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Syndicate-scale minting of 1,000 GREEN coins.</p>
                </div>
                <button
                  onClick={() => handleExchange('GREEN_1000')}
                  className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs font-mono transition-all cursor-pointer shadow active:scale-95"
                >
                  Mint 🌿 1,000 GREEN
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Permanent Botanical Body Augmentations */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <span>🧬</span> Permanent Botanical Body Bio-Augmentations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {botanicalAugmentations.map((aug) => {
                const installed = augmentations.includes(aug.id);
                const canAfford =
                  (player.dreamPoints || 0) >= aug.sparks && (player.money || 0) >= aug.green;

                return (
                  <div
                    key={aug.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      installed
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-neutral-900 border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="text-xl">{aug.icon}</span> {aug.title}
                        </span>
                        {installed && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                            INSTALLED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1.5">{aug.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-mono text-neutral-400">
                        Cost: {aug.sparks} Sparks + 🌿 {aug.green} GREEN
                      </span>

                      <button
                        onClick={() => handleInstallAugmentation(aug.id)}
                        disabled={installed || !canAfford}
                        className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                          installed
                            ? 'bg-neutral-800 text-neutral-500 cursor-default'
                            : canAfford
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow'
                            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                        }`}
                      >
                        {installed ? 'Active' : 'Install Bio-Augment'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SYNDICATE REFERRALS & TILL (ACCESSIBLE IN DREAM TAP) */}
      {activeSubTab === 'REFERRALS' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300">
              🌿 Cultivate your viral syndicate! Recruits earn you passive lifetime 10% GREEN royalties.
            </span>
            <span className="text-emerald-400 font-bold">
              Dream Tap Syndicate Hub
            </span>
          </div>
          <ReferralView />
        </div>
      )}

      {/* Global Floating Action Notification Toast */}
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
