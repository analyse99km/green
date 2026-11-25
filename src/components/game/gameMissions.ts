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
export function ensureMissionsSynchronized(
  player: PlayerState,
  customAdminMissions?: Mission[]
): { updated: boolean; missions: Mission[]; lastDaily: string; lastWeekly: string; lastMonthly: string } {
  const currentDailyKey = getDailyDateKey();
  const currentWeeklyKey = getWeeklyDateKey();
  const currentMonthlyKey = getMonthlyDateKey();

  let existingMissions = Array.isArray(player.missions) ? [...player.missions] : [];
  let updated = false;

  // Irrevocable Claim Ledger: merge player.claimedMissionIds and persistent standalone localStorage
  const persistentClaimedSet = new Set<string>(player.claimedMissionIds || []);
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('metropolis_claimed_missions');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach((id: string) => persistentClaimedSet.add(id));
      }
    } catch {}
  }
  for (const m of existingMissions) {
    if (m.claimed) persistentClaimedSet.add(m.id);
  }

  // 1. Ensure story missions exist (permanently preserve claimed status across reloads/logins)
  const storyIds = new Set(existingMissions.filter((m) => m.category === 'STORY').map((m) => m.id));
  for (const storyMsn of INITIAL_STORY_MISSIONS) {
    if (!storyIds.has(storyMsn.id)) {
      const isAlreadyClaimed = persistentClaimedSet.has(storyMsn.id);
      existingMissions.push({
        ...storyMsn,
        completed: isAlreadyClaimed || storyMsn.completed,
        claimed: isAlreadyClaimed || storyMsn.claimed,
      });
      updated = true;
    }
  }

  // 2. Custom Admin-Created Missions (Watch Video, Open Partner Link, Ads, Specific Cards)
  if (customAdminMissions && customAdminMissions.length > 0) {
    for (const cm of customAdminMissions) {
      const idx = existingMissions.findIndex((m) => m.id === cm.id);
      if (idx === -1) {
        const isAlreadyClaimed = persistentClaimedSet.has(cm.id);
        existingMissions.push({
          ...cm,
          completed: isAlreadyClaimed || cm.completed,
          claimed: isAlreadyClaimed || cm.claimed,
        });
        updated = true;
      }
    }
  }

  // 3. Daily Missions Rollover
  if (player.lastDailyMissionsDate !== currentDailyKey) {
    existingMissions = existingMissions.filter((m) => m.category !== 'DAILY');
    existingMissions.push(...getDailyMissions(currentDailyKey));
    updated = true;
  }

  // 4. Weekly Missions Rollover
  if (player.lastWeeklyMissionsWeek !== currentWeeklyKey) {
    existingMissions = existingMissions.filter((m) => m.category !== 'WEEKLY');
    existingMissions.push(...getWeeklyMissions(currentWeeklyKey));
    updated = true;
  }

  // 5. Monthly Missions Rollover
  if (player.lastMonthlyMissionsMonth !== currentMonthlyKey) {
    existingMissions = existingMissions.filter((m) => m.category !== 'MONTHLY');
    existingMissions.push(...getMonthlyMissions(currentMonthlyKey));
    updated = true;
  }

  // 6. Guarantee that any mission in persistentClaimedSet is NEVER marked unclaimed
  existingMissions = existingMissions.map((m) => {
    if (persistentClaimedSet.has(m.id)) {
      if (!m.claimed || !m.completed) {
        updated = true;
        return { ...m, completed: true, claimed: true };
      }
    }
    return m;
  });

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

// ── 7. IRREVOCABLE CLIENT LEDGER & STATE MERGE HELPERS ─────────────────────────
export function getStandaloneClaimedMissions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('metropolis_claimed_missions');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((id) => typeof id === 'string');
    }
  } catch {}
  return [];
}

export function getStandaloneReferredBy(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem('metropolis_user_referred_by');
    if (val && val !== 'null' && val !== 'undefined') return val.trim().toUpperCase();
  } catch {}
  return null;
}

export function persistLedgerToLocalAndParent(claimedIds: string[], referredBy?: string | null, userEmail?: string) {
  if (typeof window === 'undefined') return;
  const cleanIds = Array.from(new Set([...getStandaloneClaimedMissions(), ...(claimedIds || [])]));
  const cleanSponsor = referredBy && referredBy !== 'null' && referredBy !== 'undefined'
    ? String(referredBy).trim().toUpperCase()
    : getStandaloneReferredBy();

  try {
    if (cleanIds.length > 0) {
      localStorage.setItem('metropolis_claimed_missions', JSON.stringify(cleanIds));
    }
    if (cleanSponsor) {
      localStorage.setItem('metropolis_user_referred_by', cleanSponsor);
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'METROPOLIS_PERSIST_LEDGER',
          email: userEmail || '',
          claimedMissionIds: cleanIds,
          referredBy: cleanSponsor,
        },
        '*'
      );
    }
  } catch {}
}

/**
 * Unifies local and server/cloud PlayerState objects without ever wiping
 * claimed missions, sponsor attribution, recruits, milestones, or card levels.
 */
export function mergeClientPlayerStates(
  baseState: any,
  incomingState: any,
  fallbackDefaults: any = {},
  authHints?: { name?: string; userId?: string; userReferralCode?: string; referredBy?: string | null; telegramId?: string | number; email?: string }
): any {
  const prev = baseState || {};
  const cloud = incomingState || {};

  const localRecruits = Array.isArray(prev.referrals?.recruits) ? prev.referrals.recruits : [];
  const cloudRecruits = Array.isArray(cloud.referrals?.recruits) ? cloud.referrals.recruits : [];
  const allRecruits = [...cloudRecruits];
  for (const lr of localRecruits) {
    if (
      !allRecruits.some(
        (r: any) =>
          (lr.id && r.id === lr.id) ||
          (r.email && lr.email && r.email.toLowerCase() === lr.email.toLowerCase())
      )
    ) {
      allRecruits.push(lr);
    }
  }

  const mergedMilestones = Array.from(
    new Set([
      ...(Array.isArray(prev.referrals?.claimedMilestones) ? prev.referrals.claimedMilestones : []),
      ...(Array.isArray(cloud.referrals?.claimedMilestones) ? cloud.referrals.claimedMilestones : []),
    ])
  );

  const standaloneSponsor = getStandaloneReferredBy();
  const preservedReferredBy =
    standaloneSponsor ||
    cloud.referrals?.referredBy ||
    prev.referrals?.referredBy ||
    authHints?.referredBy ||
    undefined;

  const standaloneClaimed = getStandaloneClaimedMissions();
  const mergedClaimedMissionIds = Array.from(
    new Set([
      ...(Array.isArray(prev.claimedMissionIds) ? prev.claimedMissionIds : []),
      ...(Array.isArray(cloud.claimedMissionIds) ? cloud.claimedMissionIds : []),
      ...standaloneClaimed,
      ...((Array.isArray(prev.missions) ? prev.missions : []).filter((m: any) => m?.claimed).map((m: any) => m.id)),
      ...((Array.isArray(cloud.missions) ? cloud.missions : []).filter((m: any) => m?.claimed).map((m: any) => m.id)),
    ])
  );

  const claimedSet = new Set(mergedClaimedMissionIds);
  const msnMap = new Map<string, any>();
  for (const m of Array.isArray(prev.missions) ? prev.missions : []) {
    if (m?.id) msnMap.set(m.id, { ...m });
  }
  for (const m of Array.isArray(cloud.missions) ? cloud.missions : []) {
    if (!m?.id) continue;
    const existing = msnMap.get(m.id);
    const isClaimed = Boolean(existing?.claimed || m.claimed || claimedSet.has(m.id));
    msnMap.set(m.id, {
      ...(existing || {}),
      ...m,
      currentCount: Math.max(Number(existing?.currentCount || 0), Number(m.currentCount || 0)),
      completed: Boolean(existing?.completed || m.completed || isClaimed),
      claimed: isClaimed,
    });
  }
  for (const id of mergedClaimedMissionIds) {
    const m = msnMap.get(id);
    if (m) {
      m.completed = true;
      m.claimed = true;
    }
  }
  const mergedMissions = Array.from(msnMap.values());

  const prevCombo = prev.dailyComboProgress;
  const cloudCombo = cloud.dailyComboProgress;
  let mergedCombo = cloudCombo || prevCombo;
  if (prevCombo && cloudCombo && prevCombo.date === cloudCombo.date) {
    mergedCombo = {
      date: prevCombo.date,
      upgradedCardIds: Array.from(new Set([...(prevCombo.upgradedCardIds || []), ...(cloudCombo.upgradedCardIds || [])])),
      claimed: Boolean(prevCombo.claimed || cloudCombo.claimed),
    };
  }

  const prevTs = Number(prev.lastSaveTimestamp || 0);
  const cloudTs = Number(cloud.lastSaveTimestamp || 0);
  const cloudIsNewer = cloudTs >= prevTs;

  const mergedCards: Record<string, number> = { ...(prev.dreamCards || {}) };
  for (const [cid, lvl] of Object.entries(cloud.dreamCards || {})) {
    mergedCards[cid] = Math.max(Number(mergedCards[cid] || 0), Number(lvl || 0));
  }

  const tier1Count = allRecruits.filter((r: any) => (r.tier || 1) === 1).length;
  const mergedReferrals = {
    ...(fallbackDefaults.referrals || {}),
    ...(prev.referrals || {}),
    ...(cloud.referrals || {}),
    referredBy: preservedReferredBy,
    hasClaimedWelcomeBonus: Boolean(preservedReferredBy || prev.referrals?.hasClaimedWelcomeBonus || cloud.referrals?.hasClaimedWelcomeBonus),
    recruits: allRecruits,
    totalRecruits: Math.max(
      Number(prev.referrals?.totalRecruits || 0),
      Number(cloud.referrals?.totalRecruits || 0),
      tier1Count
    ),
    networkTotalCitizens: Math.max(
      Number(prev.referrals?.networkTotalCitizens || 0),
      Number(cloud.referrals?.networkTotalCitizens || 0),
      allRecruits.length
    ),
    unclaimedCommissionGreen: cloudIsNewer
      ? Number(cloud.referrals?.unclaimedCommissionGreen ?? prev.referrals?.unclaimedCommissionGreen ?? 0)
      : Math.max(Number(prev.referrals?.unclaimedCommissionGreen || 0), Number(cloud.referrals?.unclaimedCommissionGreen || 0)),
    lifetimeCommissionGreen: Math.max(
      Number(prev.referrals?.lifetimeCommissionGreen || 0),
      Number(cloud.referrals?.lifetimeCommissionGreen || 0)
    ),
    lastDailyStipendClaimTimestamp: Math.max(
      Number(prev.referrals?.lastDailyStipendClaimTimestamp || 0),
      Number(cloud.referrals?.lastDailyStipendClaimTimestamp || 0)
    ),
    lastDailyRoyaltyClaimTimestamp: Math.max(
      Number(prev.referrals?.lastDailyRoyaltyClaimTimestamp || 0),
      Number(cloud.referrals?.lastDailyRoyaltyClaimTimestamp || 0)
    ),
    claimedMilestones: mergedMilestones,
    referralCode:
      authHints?.userReferralCode ||
      cloud.referrals?.referralCode ||
      prev.referrals?.referralCode ||
      `NEON-TG-${authHints?.telegramId || prev.id || 'OPER'}`,
  };

  persistLedgerToLocalAndParent(mergedClaimedMissionIds, preservedReferredBy, authHints?.email);

  return {
    ...fallbackDefaults,
    ...prev,
    ...cloud,
    missions: mergedMissions.length > 0 ? mergedMissions : (prev.missions || fallbackDefaults.missions || []),
    claimedMissionIds: mergedClaimedMissionIds,
    referrals: mergedReferrals,
    name: authHints?.name || cloud.name || prev.name || fallbackDefaults.name,
    money: Math.max(Number(prev.money || 0), Number(cloud.money || 0)),
    bankMoney: Math.max(Number(prev.bankMoney || 0), Number(cloud.bankMoney || 0)),
    dreamPoints: Math.max(Number(prev.dreamPoints || 0), Number(cloud.dreamPoints || cloud.sparks || 0)),
    greenTokens: Math.max(Number(prev.greenTokens || 0), Number(cloud.greenTokens || 0)),
    level: Math.max(Number(prev.level || 1), Number(cloud.level || 1)),
    inventory: Array.isArray(cloud.inventory) && cloud.inventory.length > 0 ? cloud.inventory : (prev.inventory || []),
    dreamCards: mergedCards,
    dailyComboProgress: mergedCombo,
    lastSaveTimestamp: Math.max(prevTs, cloudTs, Date.now()),
  };
}
