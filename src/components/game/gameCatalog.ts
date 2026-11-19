'use client';

export interface ReferralTierConfig {
  tier: number;
  jumpLabel: string;
  percent: number;
}

export interface ReferralMilestoneConfig {
  recruits: number;
  rewardGreen: number;
  label: string;
}

export interface ReferralRewardsConfig {
  recruiterInstantBounty: number;
  recruitWelcomeBonus: number;
  dailyRecruitStipend: number;
  tiers: ReferralTierConfig[];
  milestones: ReferralMilestoneConfig[];
}

export const DEFAULT_REFERRAL_REWARDS: ReferralRewardsConfig = {
  recruiterInstantBounty: 100,
  recruitWelcomeBonus: 100,
  dailyRecruitStipend: 50,
  tiers: [
    { tier: 1, jumpLabel: 'Direct Link (0 Jumps)', percent: 10 },
    { tier: 2, jumpLabel: '1 Jump (2nd Generation)', percent: 4 },
    { tier: 3, jumpLabel: '2 Jumps (3rd Generation)', percent: 2 },
    { tier: 4, jumpLabel: '3 Jumps (4th Generation)', percent: 1 },
    { tier: 5, jumpLabel: '4+ Jumps (5th Generation)', percent: 0.5 },
  ],
  milestones: [
    { recruits: 3, rewardGreen: 500, label: 'Street Crew' },
    { recruits: 5, rewardGreen: 1200, label: 'District Cell' },
    { recruits: 10, rewardGreen: 3000, label: 'Underworld Syndicate' },
    { recruits: 25, rewardGreen: 10000, label: 'City Cartel' },
    { recruits: 50, rewardGreen: 25000, label: 'Metropolis Mafia' },
    { recruits: 100, rewardGreen: 60000, label: 'Underworld Kingpin' },
  ],
};

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
  alignment?: 'CRIME' | 'GOOD' | 'NEUTRAL';
  synergy?: string;
  ammo?: string;
  concealment?: string;
  durability?: number;
  price: number;
  marketValue?: number;
  shopliftDifficulty?: number;
  icon: string;
  damage?: number;
  accuracy?: number;
  defense?: number;
  foodRestore?: number;
  energyRestore?: number;
  happyRestore?: number;
  lifeRestore?: number;
  usableIn?: ('ALL' | 'HOME' | 'RESTAURANT')[];
  statBonus?: Record<string, number>;
  perkDescription?: string;
  requiredCardId?: string; // Prerequisite card required
  requiredCardLevel?: number; // Prerequisite card level
  forgePrice?: number;
  forgeSparksPrice?: number;
  forgeDamageBonus?: number;
  forgeAccuracyBonus?: number;
  forgeDefenseBonus?: number;
}

export interface DreamMarketItemDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  sparkCost: number;
  givesEnergy?: number;
  givesFood?: number;
  givesNerve?: number;
  givesHappy?: number;
  givesLife?: number;
  givesGreen?: number;
  requiredCardId?: string;
  requiredCardLevel?: number;
}

export const INITIAL_DREAM_MARKET_ITEMS: DreamMarketItemDef[] = [
  {
    id: 'dream_surge_battery',
    title: 'Surge Energy Battery',
    description: 'Overcharged electrolytic cell providing an immediate injection of operational energy.',
    icon: '⚡',
    sparkCost: 300,
    givesEnergy: 50,
  },
  {
    id: 'dream_hydro_sourdough',
    title: 'Hydro-Nutrient Sourdough',
    description: 'Dense bio-fermented loaf restoring food satiety and baseline happiness.',
    icon: '🍞',
    sparkCost: 250,
    givesFood: 45,
    givesHappy: 15,
  },
  {
    id: 'dream_lucid_nectar',
    title: 'Lucid Nerve Nectar',
    description: 'Concentrated neuro-botanical extract restoring nerve capacity and mental focus.',
    icon: '🧪',
    sparkCost: 350,
    givesNerve: 20,
    givesHappy: 10,
  },
  {
    id: 'dream_euphoria_spores',
    title: 'Euphoria Spore Vial',
    description: 'Therapeutic bio-spores soothing stress and restoring player morale & happiness.',
    icon: '🌸',
    sparkCost: 200,
    givesHappy: 45,
    givesNerve: 5,
  },
  {
    id: 'dream_cellular_salve',
    title: 'Cellular Regeneration Salve',
    description: 'Advanced organic stem-gel sealing lacerations and restoring health/life points.',
    icon: '💊',
    sparkCost: 350,
    givesLife: 60,
    givesHappy: 5,
  },
  {
    id: 'dream_mint_green_tokens',
    title: 'Mint 25 GREEN Coins',
    description: 'Crystallize pure dream sparks into minted liquid GREEN economic currency.',
    icon: '🪙',
    sparkCost: 500,
    givesGreen: 25,
  },
  {
    id: 'dream_grand_restoration',
    title: 'Grand All-Vitals Tonic',
    description: 'Master bio-brew revitalizing Energy, Satiety, Nerve, Happy, and Life simultaneously.',
    icon: '✨',
    sparkCost: 950,
    givesEnergy: 40,
    givesFood: 40,
    givesNerve: 15,
    givesHappy: 35,
    givesLife: 50,
    givesGreen: 10,
  },
];

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
  dreamMarketItems?: DreamMarketItemDef[];
  dailyComboOverride?: DailyComboDef;
  customDailyStreakRewards?: DailyStreakRewardItem[];
  referralRewards?: ReferralRewardsConfig;
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
      dreamMarketItems: INITIAL_DREAM_MARKET_ITEMS,
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
        dreamMarketItems: parsed.dreamMarketItems && parsed.dreamMarketItems.length > 0 ? parsed.dreamMarketItems : INITIAL_DREAM_MARKET_ITEMS,
        dailyComboOverride: parsed.dailyComboOverride,
        customDailyStreakRewards: parsed.customDailyStreakRewards,
        referralRewards: parsed.referralRewards || DEFAULT_REFERRAL_REWARDS,
      };
    }
  } catch (err) {
    console.error('Failed to load dynamic catalog from localStorage:', err);
  }

  return {
    categories: INITIAL_BOTANICAL_CATEGORIES,
    cards: INITIAL_BOTANICAL_CARDS,
    customItems: [],
    dreamMarketItems: INITIAL_DREAM_MARKET_ITEMS,
    referralRewards: DEFAULT_REFERRAL_REWARDS,
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
        dreamMarketItems: json.catalog.dreamMarketItems && json.catalog.dreamMarketItems.length > 0 ? json.catalog.dreamMarketItems : INITIAL_DREAM_MARKET_ITEMS,
        dailyComboOverride: json.catalog.dailyComboOverride,
        customDailyStreakRewards: json.catalog.customDailyStreakRewards,
        referralRewards: json.catalog.referralRewards || DEFAULT_REFERRAL_REWARDS,
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
