'use client';

export interface BotanicalCategoryDef {
  id: string;
  name: string;
  icon: string;
  badge: string;
}

export interface BotanicalCardDef {
  id: string;
  title: string;
  flavor: string;
  baseCost: number;
  sparksPerSec: number;
  icon: string;
  category: string;
  badge: string;
  costMultiplier?: number;
  requiredCardId?: string; // Prerequisite Card ID
  requiredCardLevel?: number; // Prerequisite Card Level
}

export interface DynamicItemDef {
  id: string;
  name: string;
  description: string;
  category: 'WEAPON' | 'ARMOR' | 'FOOD' | 'MEDICAL' | 'CONTRABAND' | 'TOOL' | 'LUXURY' | 'ENHANCER';
  price: number;
  marketValue: number;
  icon: string;
  damage?: number;
  defense?: number;
  foodRestore?: number;
  energyRestore?: number;
  lifeRestore?: number;
  requiredCardId?: string; // Prerequisite card required
  requiredCardLevel?: number; // Prerequisite card level
}

export const INITIAL_BOTANICAL_CATEGORIES: BotanicalCategoryDef[] = [
  { id: 'SPORES', name: 'Mini Spores & Fungi', icon: '🍄', badge: 'Tier 1' },
  { id: 'FLORA', name: 'Luminescent Flora', icon: '🌸', badge: 'Tier 2' },
  { id: 'BIG_TREES', name: 'World Ancient Trees', icon: '🌳', badge: 'Tier 3' },
  { id: 'COSMIC', name: 'Cosmic Bio-Engines', icon: '✨', badge: 'Tier 4' },
];

export const INITIAL_BOTANICAL_CARDS: BotanicalCardDef[] = [
  // 🍄 SECTION 1: Mini Spores & Fungi
  {
    id: 'card_photosynthesis',
    title: 'Micro Chlorophyll Sprout',
    flavor: 'Absorbs residual dreamlight to convert into organic spark energy.',
    baseCost: 25,
    sparksPerSec: 1,
    icon: '🌱',
    category: 'SPORES',
    badge: 'Mini Spore',
  },
  {
    id: 'card_mycelium',
    title: 'Sub-Terranean Mycelium',
    flavor: 'Underground fungal threads transmitting subterranean bio-nutrients.',
    baseCost: 110,
    sparksPerSec: 3,
    icon: '🍄',
    category: 'SPORES',
    badge: 'Fungi Web',
    requiredCardId: 'card_photosynthesis',
    requiredCardLevel: 1,
  },
  {
    id: 'card_spore_chamber',
    title: 'Bio-Pressure Spore Pod',
    flavor: 'Explosive spore dispersers populating surrounding chambers.',
    baseCost: 450,
    sparksPerSec: 8,
    icon: '🫧',
    category: 'SPORES',
    badge: 'Pod Emitter',
    requiredCardId: 'card_mycelium',
    requiredCardLevel: 2,
  },
  {
    id: 'card_bioluminescent_algae',
    title: 'Bioluminescent Micro-Algae',
    flavor: 'Glowing deep-cave algae vibrating at high chlorophyll frequencies.',
    baseCost: 1600,
    sparksPerSec: 18,
    icon: '🧪',
    category: 'SPORES',
    badge: 'Glow Culture',
    requiredCardId: 'card_spore_chamber',
    requiredCardLevel: 2,
  },
  {
    id: 'card_cordyceps',
    title: 'Cognitive Cordyceps Cluster',
    flavor: 'Intelligent psychic fungal minds coordinating spark synthesis.',
    baseCost: 5200,
    sparksPerSec: 35,
    icon: '🧠',
    category: 'SPORES',
    badge: 'Psionic Fungi',
    requiredCardId: 'card_bioluminescent_algae',
    requiredCardLevel: 3,
  },

  // 🌸 SECTION 2: Luminescent Flora
  {
    id: 'card_greenhouse',
    title: 'Urban Sprout Nursery',
    flavor: 'Enclosed botanical micro-climate maximizing sprout generation.',
    baseCost: 16000,
    sparksPerSec: 75,
    icon: '🏡',
    category: 'FLORA',
    badge: 'Glass Nursery',
  },
  {
    id: 'card_hydroponic_array',
    title: 'Automated Hydroponics Grid',
    flavor: 'Precision nutrient-fluid circulating through automated vertical trays.',
    baseCost: 48000,
    sparksPerSec: 150,
    icon: '💧',
    category: 'FLORA',
    badge: 'Liquid Tech',
    requiredCardId: 'card_greenhouse',
    requiredCardLevel: 2,
  },
  {
    id: 'card_ginseng',
    title: 'Centennial Golden Ginseng',
    flavor: 'Rare underworld root condensing pure vitality into crystalline sap.',
    baseCost: 140000,
    sparksPerSec: 320,
    icon: '🪴',
    category: 'FLORA',
    badge: 'Vital Root',
    requiredCardId: 'card_hydroponic_array',
    requiredCardLevel: 3,
  },
  {
    id: 'card_ayahuasca',
    title: 'Visionary Dream Vine',
    flavor: 'Twisted psychoactive jungle vine tapping directly into the dreaming nexus.',
    baseCost: 420000,
    sparksPerSec: 680,
    icon: '🌿',
    category: 'FLORA',
    badge: 'Nexus Vine',
    requiredCardId: 'card_ginseng',
    requiredCardLevel: 4,
  },

  // 🌳 SECTION 3: World Ancient Trees
  {
    id: 'card_mango',
    title: 'Sacred Banyan Canopy',
    flavor: 'Expansive sacred banyan dropping aerial prop roots over city rooftops.',
    baseCost: 1200000,
    sparksPerSec: 1400,
    icon: '🌳',
    category: 'BIG_TREES',
    badge: 'Giant Canopy',
  },
  {
    id: 'card_coconut',
    title: 'Iron-Bark Acacia Trunk',
    flavor: 'Indestructible dense timber tree radiating deep magnetic grounding.',
    baseCost: 3500000,
    sparksPerSec: 2800,
    icon: '🪵',
    category: 'BIG_TREES',
    badge: 'Ironwood',
    requiredCardId: 'card_mango',
    requiredCardLevel: 2,
  },
  {
    id: 'card_baobab',
    title: 'Colossal Primordial Baobab',
    flavor: 'Ancient water-storing monolith surviving multiple earthly epochs.',
    baseCost: 9500000,
    sparksPerSec: 5500,
    icon: '🏕️',
    category: 'BIG_TREES',
    badge: 'Epoch Titan',
    requiredCardId: 'card_coconut',
    requiredCardLevel: 3,
  },
  {
    id: 'card_redwood',
    title: 'Apex Redwood Sentinel',
    flavor: 'Towering 400-foot titan piercing through the tropospheric cloud layer.',
    baseCost: 25000000,
    sparksPerSec: 11000,
    icon: '🌲',
    category: 'BIG_TREES',
    badge: 'Sky Sentinel',
    requiredCardId: 'card_baobab',
    requiredCardLevel: 4,
  },

  // ✨ SECTION 4: Cosmic Bio-Engines
  {
    id: 'card_sacred_grove',
    title: 'Planetary Biosphere Grid',
    flavor: 'Harmonized continental ecosystem resonating in unified chlorophyll melody.',
    baseCost: 70000000,
    sparksPerSec: 22000,
    icon: '🌍',
    category: 'COSMIC',
    badge: 'Planetary Grid',
  },
  {
    id: 'card_genetic_synthesizer',
    title: 'Quantum Bio-Synthesizer',
    flavor: 'Molecular fabricator transmuting photons directly into organic carbon.',
    baseCost: 200000000,
    sparksPerSec: 50000,
    icon: '⚡',
    category: 'COSMIC',
    badge: 'Quantum Gen',
    requiredCardId: 'card_sacred_grove',
    requiredCardLevel: 2,
  },
  {
    id: 'card_quantum_chloroplast',
    title: 'Zero-Point Chloroplast Matrix',
    flavor: 'Sub-atomic photon collectors harvesting vacuum energy through living leaves.',
    baseCost: 600000000,
    sparksPerSec: 110000,
    icon: '🔮',
    category: 'COSMIC',
    badge: 'Zero Point',
    requiredCardId: 'card_genetic_synthesizer',
    requiredCardLevel: 3,
  },
  {
    id: 'card_yggdrasil_uplink',
    title: 'Yggdrasil World Tree Uplink',
    flavor: 'Direct cosmic conduit connecting your mind to the immortal Norse World Tree.',
    baseCost: 2000000000,
    sparksPerSec: 280000,
    icon: '🌌',
    category: 'COSMIC',
    badge: 'Apex Mythic',
    requiredCardId: 'card_quantum_chloroplast',
    requiredCardLevel: 4,
  },
];

const CATALOG_STORAGE_KEY = 'METROPOLIS_DYNAMIC_CATALOG';

export interface DailyComboDef {
  date: string; // YYYY-MM-DD
  cardIds: [string, string, string];
  rewardSparks: number;
  isCustomOverride?: boolean;
}

export interface DailyStreakRewardItem {
  day: number;
  label: string;
  reward: string;
  icon: string;
  cash?: number;
  energy?: number;
  nerve?: number;
  sparks?: number;
  green?: number;
  item?: string;
}

export const DEFAULT_DAILY_STREAK_REWARDS: DailyStreakRewardItem[] = [
  { day: 1, label: 'Day 1', reward: '$10,000 Cash + 25 Energy', icon: '🪙', cash: 10000, energy: 25 },
  { day: 2, label: 'Day 2', reward: '50 Sparks + 10 Nerve', icon: '🔑', sparks: 50, nerve: 10 },
  { day: 3, label: 'Day 3', reward: 'Titanium Lockpick + $25,000', icon: '🪙', cash: 25000, item: 'Titanium Tension Lockpick' },
  { day: 4, label: 'Day 4', reward: '🌿 50 GREEN + 50 Energy Surge', icon: '🔑', green: 50, energy: 50 },
  { day: 5, label: 'Day 5', reward: 'Tactical Wagyu Ribeye + 15 Nerve', icon: '🪙', nerve: 15, item: 'Tactical Wagyu Ribeye' },
  { day: 6, label: 'Day 6', reward: '18k Gold Ring + 100 Sparks', icon: '🔑', sparks: 100, item: '18k Gold Signet Ring' },
  { day: 7, label: 'Day 7', reward: '👑 Syndicate Grand Crate: 🌿 150 GREEN + $100K', icon: '🌿', cash: 100000, energy: 100, nerve: 20, green: 150 },
];

export interface DynamicCatalogData {
  categories: BotanicalCategoryDef[];
  cards: BotanicalCardDef[];
  customItems: DynamicItemDef[];
  dailyComboOverride?: DailyComboDef;
  customDailyStreakRewards?: DailyStreakRewardItem[];
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDailyCombo(catalog: DynamicCatalogData): DailyComboDef {
  const today = getTodayDateString();
  if (
    catalog.dailyComboOverride &&
    catalog.dailyComboOverride.date === today &&
    catalog.dailyComboOverride.isCustomOverride
  ) {
    return catalog.dailyComboOverride;
  }

  // Automatic deterministic daily pseudo-random selection based on date string
  const cards = catalog.cards && catalog.cards.length >= 3 ? catalog.cards : INITIAL_BOTANICAL_CARDS;
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const idx1 = absHash % cards.length;
  let idx2 = (absHash * 3 + 7) % cards.length;
  if (idx2 === idx1) idx2 = (idx1 + 1) % cards.length;
  let idx3 = (absHash * 7 + 13) % cards.length;
  if (idx3 === idx1 || idx3 === idx2) idx3 = (idx1 + 2) % cards.length;

  return {
    date: today,
    cardIds: [cards[idx1].id, cards[idx2].id, cards[idx3].id],
    rewardSparks: catalog.dailyComboOverride?.rewardSparks || 5000000,
    isCustomOverride: false,
  };
}

export function loadCatalogData(): DynamicCatalogData {
  if (typeof window === 'undefined') {
    return {
      categories: INITIAL_BOTANICAL_CATEGORIES,
      cards: INITIAL_BOTANICAL_CARDS,
      customItems: [],
    };
  }

  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_BOTANICAL_CATEGORIES,
        cards: parsed.cards && parsed.cards.length > 0 ? parsed.cards : INITIAL_BOTANICAL_CARDS,
        customItems: parsed.customItems || [],
        dailyComboOverride: parsed.dailyComboOverride,
        customDailyStreakRewards: parsed.customDailyStreakRewards,
      };
    }
  } catch (err) {
    console.error('Failed to load dynamic catalog from localStorage:', err);
  }

  return {
    categories: INITIAL_BOTANICAL_CATEGORIES,
    cards: INITIAL_BOTANICAL_CARDS,
    customItems: [],
  };
}

export function saveCatalogData(data: DynamicCatalogData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data));
    // Also broadcast to cluster API in background
    fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_catalog', catalog: data }),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save dynamic catalog:', err);
  }
}

export async function syncCatalogFromServer(onUpdated?: (catalog: DynamicCatalogData) => void): Promise<DynamicCatalogData | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/catalog');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.catalog) {
      const merged: DynamicCatalogData = {
        categories: json.catalog.categories && json.catalog.categories.length > 0 ? json.catalog.categories : INITIAL_BOTANICAL_CATEGORIES,
        cards: json.catalog.cards && json.catalog.cards.length > 0 ? json.catalog.cards : INITIAL_BOTANICAL_CARDS,
        customItems: json.catalog.customItems || [],
        dailyComboOverride: json.catalog.dailyComboOverride,
        customDailyStreakRewards: json.catalog.customDailyStreakRewards,
      };
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(merged));
      if (onUpdated) onUpdated(merged);
      return merged;
    }
  } catch {
    // Offline or fallback silently
  }
  return null;
}
