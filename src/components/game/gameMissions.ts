import { Mission, PlayerState } from './types';

// Helper to get standard date keys
export function getDailyDateKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function getWeeklyDateKey(): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

export function getMonthlyDateKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// ── 1. DAILY MISSIONS DEFINITION (Refreshes Every 24 Hours) ───────────────────
export function getDailyMissions(dateKey: string): Mission[] {
  return [
    {
      id: `daily_tap_50_${dateKey}`,
      title: 'Chlorophyll Mint Surge',
      contractor: 'Botanical Overseer',
      description: 'Tap the sacred central Green Mint leaf 50 times to harvest raw synthesis energy.',
      category: 'DAILY',
      reqType: 'TAP',
      targetCount: 50,
      currentCount: 0,
      rewardGreen: 10,
      rewardSparks: 150,
      rewardCredits: 5,
      rewardCash: 1000,
      completed: false,
      claimed: false,
      icon: '🌿',
    },
    {
      id: `daily_card_upgrade_${dateKey}`,
      title: 'Botanical Network Synthesis',
      contractor: 'Spore Colony Council',
      description: 'Purchase or level up any Botanical Card in the Spores & Flora catalog.',
      category: 'DAILY',
      reqType: 'CARD_UPGRADE',
      targetCount: 1,
      currentCount: 0,
      rewardGreen: 15,
      rewardSparks: 300,
      rewardCredits: 5,
      rewardCash: 2500,
      completed: false,
      claimed: false,
      icon: '🃏',
    },
    {
      id: `daily_crime_3_${dateKey}`,
      title: 'Underworld Scouting Run',
      contractor: 'Fixer Vance',
      description: 'Execute 3 successful street crimes to collect intelligence and cash.',
      category: 'DAILY',
      reqType: 'CRIME',
      targetCount: 3,
      currentCount: 0,
      rewardGreen: 10,
      rewardSparks: 0,
      rewardCredits: 5,
      rewardCash: 4000,
      completed: false,
      claimed: false,
      icon: '🕵️',
    },
    {
      id: `daily_casino_1_${dateKey}`,
      title: 'Neon Casino Wager',
      contractor: 'Underworld Syndicate Boss',
      description: 'Place at least 1 bet at the Torn Casino (Slots, Roulette, Blackjack, or Craps).',
      category: 'DAILY',
      reqType: 'CASINO',
      targetCount: 1,
      currentCount: 0,
      rewardGreen: 20,
      rewardSparks: 100,
      rewardCredits: 5,
      rewardCash: 1500,
      completed: false,
      claimed: false,
      icon: '🎰',
    },
    {
      id: `daily_gym_2_${dateKey}`,
      title: 'Physical Conditioning',
      contractor: 'Gym Master Jax',
      description: 'Complete 2 training sessions at the Iron Haven Gym to fortify your battle stats.',
      category: 'DAILY',
      reqType: 'TRAIN',
      targetCount: 2,
      currentCount: 0,
      rewardGreen: 10,
      rewardSparks: 0,
      rewardCredits: 5,
      rewardCash: 2000,
      completed: false,
      claimed: false,
      icon: '💪',
    },
  ];
}

// ── 2. WEEKLY MISSIONS DEFINITION (Refreshes Every 7 Days) ────────────────────
export function getWeeklyMissions(weekKey: string): Mission[] {
  return [
    {
      id: `weekly_tap_300_${weekKey}`,
      title: 'Harvesting Titan',
      contractor: 'Botanical Overseer',
      description: 'Accumulate 300 taps on the Green Mint leaf this week.',
      category: 'WEEKLY',
      reqType: 'TAP',
      targetCount: 300,
      currentCount: 0,
      rewardGreen: 50,
      rewardSparks: 2500,
      rewardCredits: 20,
      rewardCash: 25000,
      completed: false,
      claimed: false,
      icon: '⚡',
    },
    {
      id: `weekly_cards_8_${weekKey}`,
      title: 'Canopy Expansion Protocol',
      contractor: 'Spore Colony Council',
      description: 'Acquire or level up 8 Botanical Cards to build a resilient idle passive income network.',
      category: 'WEEKLY',
      reqType: 'CARD_UPGRADE',
      targetCount: 8,
      currentCount: 0,
      rewardGreen: 75,
      rewardSparks: 5000,
      rewardCredits: 25,
      rewardCash: 50000,
      completed: false,
      claimed: false,
      icon: '🌱',
    },
    {
      id: `weekly_crimes_15_${weekKey}`,
      title: 'Underworld Heist Mastery',
      contractor: 'Syndicate Boss Duke',
      description: 'Pull off 15 successful street operations across the metropolis.',
      category: 'WEEKLY',
      reqType: 'CRIME',
      targetCount: 15,
      currentCount: 0,
      rewardGreen: 60,
      rewardSparks: 0,
      rewardCredits: 25,
      rewardCash: 75000,
      completed: false,
      claimed: false,
      icon: '🔫',
    },
    {
      id: `weekly_gym_10_${weekKey}`,
      title: 'Syndicate Enforcer Conditioning',
      contractor: 'Gym Master Jax',
      description: 'Complete 10 high-intensity gym training sessions.',
      category: 'WEEKLY',
      reqType: 'TRAIN',
      targetCount: 10,
      currentCount: 0,
      rewardGreen: 40,
      rewardSparks: 0,
      rewardCredits: 20,
      rewardCash: 40000,
      completed: false,
      claimed: false,
      icon: '🏋️',
    },
    {
      id: `weekly_tree_evolve_${weekKey}`,
      title: 'Species Transmutation',
      contractor: 'Ancient Botanical Circle',
      description: 'Unlock and equip a higher tree evolution stage (e.g. Bonsai, Bamboo, or Banyan).',
      category: 'WEEKLY',
      reqType: 'TREE_EVOLVE',
      targetCount: 1,
      currentCount: 0,
      rewardGreen: 100,
      rewardSparks: 4000,
      rewardCredits: 30,
      rewardCash: 60000,
      completed: false,
      claimed: false,
      icon: '🌳',
    },
  ];
}

// ── 3. MONTHLY MISSIONS DEFINITION (Refreshes Every 30 Days) ───────────────────
export function getMonthlyMissions(monthKey: string): Mission[] {
  return [
    {
      id: `monthly_sparks_20k_${monthKey}`,
      title: 'Continental Bio-Harvester',
      contractor: 'Apex Ecological Syndicate',
      description: 'Mint over 20,000 total Chlorophyll Sparks this month.',
      category: 'MONTHLY',
      reqType: 'TAP',
      targetCount: 1000,
      currentCount: 0,
      rewardGreen: 300,
      rewardSparks: 20000,
      rewardCredits: 75,
      rewardCash: 250000,
      completed: false,
      claimed: false,
      icon: '👑',
    },
    {
      id: `monthly_cards_25_${monthKey}`,
      title: 'Great Emerald Ecosystem',
      contractor: 'Spore Colony Council',
      description: 'Reach 25 total Botanical Card upgrades across your underground garden.',
      category: 'MONTHLY',
      reqType: 'CARD_UPGRADE',
      targetCount: 25,
      currentCount: 0,
      rewardGreen: 500,
      rewardSparks: 35000,
      rewardCredits: 100,
      rewardCash: 500000,
      completed: false,
      claimed: false,
      icon: '🏮',
    },
    {
      id: `monthly_crimes_50_${monthKey}`,
      title: 'Master of the Underworld',
      contractor: 'Syndicate Boss Duke',
      description: 'Complete 50 street operations and establish sovereign district authority.',
      category: 'MONTHLY',
      reqType: 'CRIME',
      targetCount: 50,
      currentCount: 0,
      rewardGreen: 400,
      rewardSparks: 0,
      rewardCredits: 120,
      rewardCash: 750000,
      completed: false,
      claimed: false,
      icon: '💼',
    },
    {
      id: `monthly_level_5_${monthKey}`,
      title: 'Apex Operative Promotion',
      contractor: 'Chief O\'Connor',
      description: 'Elevate your operative profile to Level 5 or higher.',
      category: 'MONTHLY',
      reqType: 'LEVEL',
      targetCount: 5,
      currentCount: 1,
      rewardGreen: 350,
      rewardSparks: 15000,
      rewardCredits: 80,
      rewardCash: 300000,
      completed: false,
      claimed: false,
      icon: '🎖️',
    },
  ];
}

// ── 4. STORY & ONBOARDING MISSIONS (Lifetime Progression) ─────────────────────
export const INITIAL_STORY_MISSIONS: Mission[] = [
  {
    id: 'story_first_spark',
    title: 'The First Spark',
    contractor: 'Botanical Overseer',
    description: 'Tap the green mint leaf 10 times to awaken your bio-synthetic implant.',
    category: 'STORY',
    reqType: 'TAP',
    targetCount: 10,
    currentCount: 0,
    rewardGreen: 5,
    rewardSparks: 50,
    rewardCredits: 2,
    rewardCash: 500,
    completed: false,
    claimed: false,
    icon: '🌱',
  },
  {
    id: 'story_first_spore_card',
    title: 'Expanding The Mycelium',
    contractor: 'Spore Colony Council',
    description: 'Purchase your first card in the Cards Store to start generating passive profit per second.',
    category: 'STORY',
    reqType: 'CARD_UPGRADE',
    targetCount: 1,
    currentCount: 0,
    rewardGreen: 10,
    rewardSparks: 100,
    rewardCredits: 5,
    rewardCash: 1000,
    completed: false,
    claimed: false,
    icon: '🍄',
  },
  {
    id: 'story_first_crime',
    title: 'Street Intelligence',
    contractor: 'Fixer Vance',
    description: 'Navigate to Metropolis (Home) and execute your first Search for Cash crime.',
    category: 'STORY',
    reqType: 'CRIME',
    targetCount: 1,
    currentCount: 0,
    rewardGreen: 10,
    rewardSparks: 0,
    rewardCredits: 5,
    rewardCash: 2500,
    completed: false,
    claimed: false,
    icon: '💰',
  },
  {
    id: 'story_tree_evolve',
    title: 'Botanical Transmutation',
    contractor: 'Botanical Overseer',
    description: 'Evolve your plant organism from Chlorophyll Sprout to Peppermint Shrub in the Plants menu.',
    category: 'STORY',
    reqType: 'TREE_EVOLVE',
    targetCount: 1,
    currentCount: 0,
    rewardGreen: 25,
    rewardSparks: 250,
    rewardCredits: 10,
    rewardCash: 5000,
    completed: false,
    claimed: false,
    icon: '🌿',
  },
  {
    id: 'story_first_workout',
    title: 'Iron Fortification',
    contractor: 'Gym Master Jax',
    description: 'Train at the Iron Haven Gym to increase your Strength or Defense.',
    category: 'STORY',
    reqType: 'TRAIN',
    targetCount: 1,
    currentCount: 0,
    rewardGreen: 10,
    rewardSparks: 0,
    rewardCredits: 5,
    rewardCash: 2000,
    completed: false,
    claimed: false,
    icon: '🏋️',
  },
  {
    id: 'story_casino_spin',
    title: 'Lady Luck In The Neon Mist',
    contractor: 'Syndicate Boss Duke',
    description: 'Visit the Underworld Casino and spin the Slots or European Roulette wheel.',
    category: 'STORY',
    reqType: 'CASINO',
    targetCount: 1,
    currentCount: 0,
    rewardGreen: 20,
    rewardSparks: 200,
    rewardCredits: 10,
    rewardCash: 5000,
    completed: false,
    claimed: false,
    icon: '🎰',
  },
];

// ── 5. MISSIONS SYNCHRONIZATION & AUTO-ROLLOVER ENGINE ─────────────────────────
export function ensureMissionsSynchronized(player: PlayerState): { updated: boolean; missions: Mission[]; lastDaily: string; lastWeekly: string; lastMonthly: string } {
  const currentDailyKey = getDailyDateKey();
  const currentWeeklyKey = getWeeklyDateKey();
  const currentMonthlyKey = getMonthlyDateKey();

  let existingMissions = Array.isArray(player.missions) ? [...player.missions] : [];
  let updated = false;

  // 1. Ensure story missions exist
  const storyIds = new Set(existingMissions.filter((m) => m.category === 'STORY').map((m) => m.id));
  for (const storyMsn of INITIAL_STORY_MISSIONS) {
    if (!storyIds.has(storyMsn.id)) {
      existingMissions.push({ ...storyMsn });
      updated = true;
    }
  }

  // 2. Daily Missions Rollover
  if (player.lastDailyMissionsDate !== currentDailyKey) {
    // Keep completed story / weekly / monthly missions, replace daily
    existingMissions = existingMissions.filter((m) => m.category !== 'DAILY');
    existingMissions.push(...getDailyMissions(currentDailyKey));
    updated = true;
  }

  // 3. Weekly Missions Rollover
  if (player.lastWeeklyMissionsWeek !== currentWeeklyKey) {
    existingMissions = existingMissions.filter((m) => m.category !== 'WEEKLY');
    existingMissions.push(...getWeeklyMissions(currentWeeklyKey));
    updated = true;
  }

  // 4. Monthly Missions Rollover
  if (player.lastMonthlyMissionsMonth !== currentMonthlyKey) {
    existingMissions = existingMissions.filter((m) => m.category !== 'MONTHLY');
    existingMissions.push(...getMonthlyMissions(currentMonthlyKey));
    updated = true;
  }

  return {
    updated,
    missions: existingMissions,
    lastDaily: currentDailyKey,
    lastWeekly: currentWeeklyKey,
    lastMonthly: currentMonthlyKey,
  };
}

// ── 6. DYNAMIC MISSION PROGRESS INCREMENTER ───────────────────────────────────
export function recordMissionAction(
  missions: Mission[],
  reqType: Mission['reqType'],
  amount: number = 1,
  absoluteValue?: number
): { updated: boolean; updatedMissions: Mission[]; newCompleted: Mission[] } {
  let updated = false;
  const newCompleted: Mission[] = [];

  const updatedMissions = missions.map((m) => {
    if (m.completed || m.claimed || m.reqType !== reqType) return m;

    let newCount = m.currentCount;
    if (absoluteValue !== undefined) {
      newCount = Math.max(newCount, absoluteValue);
    } else {
      newCount += amount;
    }

    if (newCount !== m.currentCount) {
      updated = true;
      const isNowCompleted = newCount >= m.targetCount;
      const updatedMsn = {
        ...m,
        currentCount: Math.min(newCount, m.targetCount),
        completed: isNowCompleted,
      };
      if (isNowCompleted && !m.completed) {
        newCompleted.push(updatedMsn);
      }
      return updatedMsn;
    }
    return m;
  });

  return { updated, updatedMissions, newCompleted };
}
