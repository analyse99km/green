'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PlayerState,
  PlayerRole,
  Property,
  InventoryItem,
  FixedDeposit,
  BankLoan,
  Crime,
  GameLog,
  BattleStats,
  WorkingStats,
  EducationCourse,
  BusinessRegistry,
  LicenseTier,
  Mission,
  BazaarListing,
  CombatTarget,
  ReferredUser,
} from './types';
import {
  DEFAULT_METROPOLIS_PLAYER,
  INITIAL_EDUCATION_COURSES,
  INITIAL_BUSINESS_REGISTRIES,
  METROPOLIS_CRIMES,
  LIMITED_DEFAULT_STORE_ITEMS,
  INITIAL_BAZAAR_LISTINGS,
  COMBAT_TARGETS,
  CRIMES_SEARCH_LOCATIONS,
  BOOTLEG_GENRES,
  GRAFFITI_DISTRICTS,
  SHOPLIFTING_TARGETS,
  PICKPOCKETING_TARGETS,
  SKIMMER_LOCATIONS,
  BURGLARY_TARGETS,
  HUSTLING_GAMES,
  DISPOSAL_TIERS,
  FORGERY_PROJECTS,
  SCAMMING_EMAILS,
  ARSON_LOCATIONS,
} from './gameData';
import { SoundEngine } from './gameAudio';
import {
  computeStateHash,
  checkCashRatio,
  P2P_BAZAAR_STORAGE_KEY,
  P2P_RECEIPTS_STORAGE_KEY,
  broadcastP2PBazaarEvent,
  loadP2PBazaarMesh,
  saveP2PBazaarMesh,
  loadP2PReceipts,
  saveP2PReceipts,
  getGossipChannel,
  P2PBazaarEvent,
} from './gameCrypto';
import { InsufficientFundsData } from './InsufficientFundsModal';
import { P2PPurchaseReceipt } from './types';

const LOCAL_STORAGE_KEY = 'neon_metropolis_v6_botanical_green';

interface GameContextType {
  player: PlayerState;
  isSaving: boolean;
  saveSuccess: boolean;
  logs: GameLog[];
  cashCompliance: ReturnType<typeof checkCashRatio>;
  saveGame: () => Promise<void>;
  togglePropertyLock: (propertyId: string) => void;
  sleepAtHome: () => { success: boolean; message: string };
  depositToBank: (amount: number) => { success: boolean; message: string };
  withdrawFromBank: (amount: number) => { success: boolean; message: string };
  createFixedDeposit: (principal: number, days: number) => { success: boolean; message: string };
  takeLoan: (amount: number) => { success: boolean; message: string };
  repayLoan: (loanId: string) => { success: boolean; message: string };
  buyProperty: (propertyId: string) => { success: boolean; message: string };
  buyItem: (item: InventoryItem) => { success: boolean; message: string };
  shopliftItem: (item: InventoryItem) => { success: boolean; message: string };
  consumeItem: (itemId: string, location?: 'ANY' | 'HOME' | 'RESTAURANT') => { success: boolean; message: string };
  commitCrime: (crime: Crime) => { success: boolean; message: string };
  trainStat: (stat: keyof BattleStats, energyCost: number) => { success: boolean; message: string };
  startEducation: (courseId: string) => { success: boolean; message: string };
  submitExam: (courseId: string, answers: number[]) => { success: boolean; message: string; score: number };
  upgradeVital: (vital: 'maxEnergy' | 'maxLife' | 'maxNerve' | 'maxHappy') => { success: boolean; message: string };
  registerBusiness: (businessId: string, customName: string) => { success: boolean; message: string };
  upgradeBusinessLicenseTier: (businessId: string, tier: LicenseTier) => { success: boolean; message: string };
  toggleBusinessService: (businessId: string, serviceId: string) => { success: boolean; message: string };
  collectBusinessRevenue: (businessId: string) => { success: boolean; message: string };
  spendMissionCredits: (cost: number, item: InventoryItem) => { success: boolean; message: string };
  playCasinoGame: (
    game: 'SLOTS' | 'ROULETTE' | 'HIGH_LOW' | 'KENO' | 'CRAPS' | 'BOOKIE' | 'LOTTERY' | 'BLACKJACK',
    bet: number
  ) => { won: boolean; payout: number; message: string };
  startSleep: (durationMinutes: number) => { success: boolean; message: string };
  wakeUp: () => { success: boolean; message: string };
  consumeFoodAt: (itemId: string, location: 'ANY' | 'HOME' | 'RESTAURANT') => { success: boolean; message: string };
  executeSearchCrime: (locId: string) => { success: boolean; message: string; lootName?: string; cash?: number };
  executeBootlegCopy: (genreId: string) => { success: boolean; message: string };
  executeBootlegSell: () => { success: boolean; message: string; cash?: number };
  executeGraffiti: (districtId: string) => { success: boolean; message: string };
  executeShopliftTarget: (targetId: string) => { success: boolean; message: string; stolenItem?: string };
  executePickpocketTarget: (targetId: string) => { success: boolean; message: string; cash?: number };
  executeSkimInstall: (locId: string) => { success: boolean; message: string };
  executeSkimSell: (locId: string) => { success: boolean; message: string; cash?: number };
  executeBurglaryScout: (targetId: string) => { success: boolean; message: string; cash?: number };
  executeHustling: (gameId: string) => { success: boolean; message: string; cash?: number };
  executeDisposal: (tierId: string) => { success: boolean; message: string; cash?: number };
  executeForgeryStep: (projId: string) => { success: boolean; message: string; completed?: boolean };
  executeScamPhishing: (emailId: string) => { success: boolean; message: string; cash?: number };
  executeArson: (targetId: string, actionType?: 'BREACH' | 'INQUIRE' | 'PLACE') => { success: boolean; message: string; cash?: number };
  toggleSound: () => void;
  spinDailyWheel: () => { rewardText: string; rewardCash?: number; rewardItem?: string };
  claimDailyStreak: () => { success: boolean; message: string; day: number; reward: string };
  upgradeItemInForge: (itemId: string, useSparks?: boolean) => { success: boolean; message: string; newLevel?: number };
  syncCloudItems: () => Promise<{ success: boolean; newCount: number; message: string }>;
  tapDreamEnergy: () => { sparksEarned: number; comboStreak: number; totalSparks: number };
  upgradeDreamCard: (cardId: string) => { success: boolean; message: string; newLevel?: number };
  equipTapperSkin: (skinId: string) => { success: boolean; message: string };
  unlockTapperSkin: (skinId: string) => { success: boolean; message: string };
  installBodyAugmentation: (augId: string) => { success: boolean; message: string };
  exchangeDreamSparks: (exchangeId: string) => { success: boolean; message: string };
  syncP2PMesh: () => { syncedPeers: number; updatedListings: number; newlySettledTill: number };
  bazaarListings: BazaarListing[];
  buyBazaarListing: (listingId: string) => { success: boolean; message: string };
  createBazaarListing: (itemId: string, price: number, quantity: number) => { success: boolean; message: string };
  removeBazaarListing: (listingId: string) => { success: boolean; message: string };
  collectBazaarTill: () => { success: boolean; message: string; amount: number };
  combatTargets: CombatTarget[];
  executeAttackRound: (
    targetId: string,
    playerWeapon: 'FISTS' | 'KNIFE' | 'PISTOL' | 'SMG'
  ) => {
    playerHit: boolean;
    playerDmg: number;
    targetHit: boolean;
    targetDmg: number;
    targetDefeated: boolean;
    playerDefeated: boolean;
    isCrit: boolean;
    message: string;
  };
  finishCombatAction: (
    targetId: string,
    action: 'MUG' | 'HOSPITALIZE' | 'LEAVE'
  ) => { success: boolean; message: string; cashStolen?: number; xpGained?: number };
  healInHospital: () => { success: boolean; message: string };
  bailFromJail: () => { success: boolean; message: string };
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => { success: boolean; message: string };
  claimReferralMilestone: (recruitsRequired: number) => { success: boolean; message: string };
  collectReferralCommission: () => { success: boolean; message: string; amount: number };
  redeemInviteCode: (code: string) => { success: boolean; message: string };
  simulateNewRecruit: () => { success: boolean; recruitName: string; message: string };
  updatePlayerName: (newName: string) => { success: boolean; message: string };
  insufficientFundsModal: InsufficientFundsData | null;
  triggerInsufficientFunds: (data: Omit<InsufficientFundsData, 'isOpen'>) => void;
  closeInsufficientFunds: () => void;
  addLog: (log: Omit<GameLog, 'id' | 'timestamp'>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(DEFAULT_METROPOLIS_PLAYER);
  const [insufficientFundsModal, setInsufficientFundsModal] = useState<InsufficientFundsData | null>(null);
  const [bazaarListings, setBazaarListings] = useState<BazaarListing[]>(INITIAL_BAZAAR_LISTINGS);
  const [combatTargets, setCombatTargets] = useState<CombatTarget[]>(COMBAT_TARGETS);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logs, setLogs] = useState<GameLog[]>([
    {
      id: 'log_0',
      timestamp: 0,
      type: 'CIVILIAN',
      message: 'Welcome to Neon Metropolis. Study courses, pass exams, eat chef meals, and expand your syndicate empire.',
    },
  ]);

  useEffect(() => {
    setMounted(true);
    let activeKey = LOCAL_STORAGE_KEY;
    const authUserRaw = localStorage.getItem('metropolis_auth_user');
    let authUser: any = null;
    if (authUserRaw) {
      try {
        authUser = JSON.parse(authUserRaw);
        if (authUser?.email) {
          activeKey = `neon_metropolis_user_${authUser.email.trim().toLowerCase()}`;
        }
      } catch {}
    }

    const saved = localStorage.getItem(activeKey) || localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (authUser?.name && (parsed.name === 'GreenNovice' || parsed.name === 'DPmafia' || !parsed.name)) {
          parsed.name = authUser.name;
        }
        if (!parsed.referrals) {
          parsed.referrals = DEFAULT_METROPOLIS_PLAYER.referrals;
        } else if (parsed.referrals.referralCode && parsed.referrals.referralCode.startsWith('GREEN-')) {
          parsed.referrals.referralCode = parsed.referrals.referralCode.replace('GREEN-', 'NEON-');
        }

        // Ensure every user has a unique deterministic referral code
        if (authUser?.userReferralCode) {
          parsed.referrals.referralCode = authUser.userReferralCode;
        } else if (!parsed.referrals.referralCode || parsed.referrals.referralCode === 'NEON-10001') {
          const seed = (parsed.id || parsed.xid || parsed.name || 'oper').replace(/[^a-zA-Z0-9]/g, '');
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
          }
          const codeSuffix = (Math.abs(hash) % 900000 + 100000).toString(16).toUpperCase();
          parsed.referrals.referralCode = `NEON-${codeSuffix}`;
        }
        if (!parsed.arsonStats) {
          parsed.arsonStats = DEFAULT_METROPOLIS_PLAYER.arsonStats;
        }
        if (!parsed.arsonProgress) {
          parsed.arsonProgress = DEFAULT_METROPOLIS_PLAYER.arsonProgress;
        }
        setPlayer((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    } else if (authUser?.name) {
      setPlayer((prev) => ({
        ...prev,
        name: authUser.name,
        id: authUser.userId || prev.id,
        referrals: {
          ...prev.referrals,
          referralCode: authUser.userReferralCode || prev.referrals?.referralCode || `NEON-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      }));
    }

    // Load P2P Decentralized Bazaar Mesh from shared local/node storage
    const meshListings = loadP2PBazaarMesh(INITIAL_BAZAAR_LISTINGS);
    setBazaarListings(meshListings);
  }, []);

  const addLog = useCallback((log: Omit<GameLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        ...log,
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        timestamp: Date.now(),
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  // Live P2P Gossip Bus Listener: Reacts in real-time when another user/tab lists or buys items!
  useEffect(() => {
    const channel = getGossipChannel();

    const handleGossipMessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'P2P_BAZAAR_EVENT') {
        const bazaarEvent: P2PBazaarEvent = ev.data.event;
        if (bazaarEvent.type === 'BAZAAR_LISTING_CREATED') {
          setBazaarListings((prev) => {
            if (prev.some((l) => l.id === bazaarEvent.listing.id)) return prev;
            return [bazaarEvent.listing, ...prev];
          });
        } else if (bazaarEvent.type === 'BAZAAR_ITEM_BOUGHT') {
          setBazaarListings((prev) =>
            prev.map((l) =>
              l.id === bazaarEvent.listingId
                ? {
                    ...l,
                    quantity: l.quantity - 1,
                    status: l.quantity - 1 <= 0 ? 'FINALIZED' : 'ACTIVE',
                  }
                : l
            )
          );

          // If current logged-in user is the seller, credit their till immediately!
          if (bazaarEvent.receipt.sellerId === player.id) {
            setPlayer((prev) => ({
              ...prev,
              bazaarTillCash: (prev.bazaarTillCash || 0) + bazaarEvent.receipt.price,
              hasUnsavedActions: true,
            }));
            SoundEngine.playCash(player.soundEnabled);
            addLog({
              type: 'SHOP',
              message: `P2P Sale Alert: Peer operative ${bazaarEvent.receipt.buyerName} bought your ${bazaarEvent.receipt.itemName} for 🌿 ${bazaarEvent.receipt.price.toLocaleString()} GREEN! Proceeds added to your Till.`,
            });
          }
        } else if (bazaarEvent.type === 'BAZAAR_LISTING_REMOVED') {
          setBazaarListings((prev) => prev.filter((l) => l.id !== bazaarEvent.listingId));
        } else if (bazaarEvent.type === 'BAZAAR_MESH_SYNC') {
          setBazaarListings(bazaarEvent.listings);
        }
      }
    };

    const handleCustomEvent = (ev: any) => {
      if (ev.detail) {
        handleGossipMessage({ data: { type: 'P2P_BAZAAR_EVENT', event: ev.detail } } as MessageEvent);
      }
    };

    const handleStorageEvent = (ev: StorageEvent) => {
      if (ev.key === P2P_BAZAAR_STORAGE_KEY && ev.newValue) {
        try {
          const updated = JSON.parse(ev.newValue);
          if (Array.isArray(updated)) {
            setBazaarListings(updated);
          }
        } catch {}
      }
    };

    if (channel) {
      channel.addEventListener('message', handleGossipMessage);
    }
    window.addEventListener('neon_metropolis_bazaar_update', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) {
        channel.removeEventListener('message', handleGossipMessage);
      }
      window.removeEventListener('neon_metropolis_bazaar_update', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [player.id, player.soundEnabled, addLog]);

  const triggerInsufficientFunds = useCallback((data: Omit<InsufficientFundsData, 'isOpen'>) => {
    setInsufficientFundsModal({ ...data, isOpen: true });
  }, []);

  const closeInsufficientFunds = useCallback(() => {
    setInsufficientFundsModal(null);
  }, []);

  const cashCompliance = checkCashRatio(player.money, player.bankMoney);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (player.hasUnsavedActions) {
        e.preventDefault();
        e.returnValue = 'You have unsaved actions! Please click Save Game before closing.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [player.hasUnsavedActions]);

  // Periodic 1-second timer tick for Sleep countdown, Hospital & Jail timers
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayer((prev) => {
        let isSleeping = prev.isSleeping;
        let sleepRemaining = prev.sleepRemainingSeconds;
        let energy = prev.energy;
        let happy = prev.happy;
        let life = prev.life;
        let food = prev.food ?? 70;

        if (isSleeping && sleepRemaining > 0) {
          sleepRemaining -= 1;
          if (sleepRemaining <= 0) {
            isSleeping = false;
          }
        }

        let newJail = Math.max(0, prev.jailTimeRemainingSeconds - 1);
        let newHospital = Math.max(0, prev.hospitalTimeRemainingSeconds - 1);

        // When discharged from hospital after starvation collapse, wake with 30 food!
        if (prev.hospitalTimeRemainingSeconds === 1 && food <= 0) {
          food = 30;
          life = Math.min(prev.maxLife, Math.max(life, 50));
        }

        return {
          ...prev,
          isSleeping,
          sleepRemainingSeconds: sleepRemaining,
          energy,
          happy,
          life,
          food,
          jailTimeRemainingSeconds: newJail,
          hospitalTimeRemainingSeconds: newHospital,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Periodic passive satiety burn, tap stamina, and idle botanical cards tick
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer((prev) => {
        // Food burns passively over time
        let food = Math.max(0, (prev.food ?? 70) - 1);
        let hospitalTime = prev.hospitalTimeRemainingSeconds;
        let life = prev.life;

        // STARVATION COLLAPSE: If food hits 0, player collapses into ICU for 2 minutes (120s)!
        if (food <= 0 && hospitalTime <= 0) {
          hospitalTime = 120; // 2 minutes
          life = 15;
          addLog({
            type: 'FOOD',
            message: '🚑 STARVATION COLLAPSE! Satiety dropped to 0! You passed out in the street and were rushed to ICU for 2 minutes. Eat food from inventory to survive!',
          });
        }

        const staminaGain = (prev.tapStamina || 0) < (prev.maxTapStamina || 500) ? 10 : 0;

        // 10 Botanical Idle Cards Auto-Production
        const cards = prev.dreamCards || {};
        const idleSparks =
          (cards.card_photosynthesis || 0) * 1 +
          (cards.card_mycelium || 0) * 3 +
          (cards.card_spore_chamber || 0) * 8 +
          (cards.card_greenhouse || 0) * 20 +
          (cards.card_hydroponic_array || 0) * 50 +
          (cards.card_bioluminescent_algae || 0) * 120 +
          (cards.card_sacred_grove || 0) * 300 +
          (cards.card_genetic_synthesizer || 0) * 750 +
          (cards.card_yggdrasil_uplink || 0) * 2000 +
          (cards.card_quantum_chloroplast || 0) * 6000;

        return {
          ...prev,
          food,
          hospitalTimeRemainingSeconds: hospitalTime,
          life,
          tapStamina: Math.min(prev.maxTapStamina || 500, (prev.tapStamina || 0) + staminaGain),
          dreamPoints: (prev.dreamPoints || 0) + idleSparks,
        };
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const saveGame = async () => {
    setIsSaving(true);
    try {
      const newHash = await computeStateHash(player, player.stateHash);
      const updatedPlayer: PlayerState = {
        ...player,
        stateHash: newHash,
        lastSaveTimestamp: Date.now(),
        hasUnsavedActions: false,
      };

      let activeKey = LOCAL_STORAGE_KEY;
      const authUserRaw = localStorage.getItem('metropolis_auth_user');
      if (authUserRaw) {
        try {
          const authUser = JSON.parse(authUserRaw);
          if (authUser?.email) {
            activeKey = `neon_metropolis_user_${authUser.email.trim().toLowerCase()}`;
          }
        } catch {}
      }

      localStorage.setItem(activeKey, JSON.stringify(updatedPlayer));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlayer));
      await new Promise((r) => setTimeout(r, 600));

      setPlayer(updatedPlayer);
      setIsSaving(false);
      setSaveSuccess(true);
      addLog({
        type: 'SAVE',
        message: '✓ Cryptographic game state signed & backed up. Safe to close browser!',
      });

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch {
      setIsSaving(false);
    }
  };

  const updatePlayerName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return { success: false, message: 'Operative name cannot be empty.' };

    const updated = { ...player, name: trimmed, hasUnsavedActions: true };
    setPlayer(updated);

    let activeKey = LOCAL_STORAGE_KEY;
    const authUserRaw = localStorage.getItem('metropolis_auth_user');
    if (authUserRaw) {
      try {
        const authUser = JSON.parse(authUserRaw);
        authUser.name = trimmed;
        localStorage.setItem('metropolis_auth_user', JSON.stringify(authUser));
        if (authUser?.email) {
          activeKey = `neon_metropolis_user_${authUser.email.trim().toLowerCase()}`;
        }
      } catch {}
    }

    localStorage.setItem(activeKey, JSON.stringify(updated));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    addLog({
      type: 'CIVILIAN',
      message: `Operative codename updated to "${trimmed}". Identity verified!`,
    });
    return { success: true, message: `Operative codename updated to "${trimmed}".` };
  };

  const togglePropertyLock = (propertyId: string) => {
    setPlayer((prev) => {
      const updatedProps = prev.properties.map((p) =>
        p.id === propertyId ? { ...p, isLocked: !p.isLocked } : p
      );
      const target = updatedProps.find((p) => p.id === propertyId);
      addLog({
        type: 'CIVILIAN',
        message: `${target?.name} is now ${target?.isLocked ? '🔒 LOCKED (Protected from Muggers)' : '🔓 UNLOCKED'}.`,
      });
      return { ...prev, properties: updatedProps, hasUnsavedActions: true };
    });
  };

  // Sleeping System: 1-hour restful sleep where player can browse the app but actions are locked until awake
  const startSleep = (durationMinutes: number = 60) => {
    const currentProp = player.properties.find((p) => p.id === player.currentPropertyId);
    if (!currentProp?.isLocked) {
      return {
        success: false,
        message: 'Lock your apartment door first! Sleeping with an unlocked door leaves you vulnerable to street muggers.',
      };
    }
    const seconds = durationMinutes * 60;
    setPlayer((prev) => ({
      ...prev,
      isSleeping: true,
      sleepRemainingSeconds: seconds,
      hasUnsavedActions: true,
    }));
    addLog({
      type: 'CIVILIAN',
      message: `Went to sleep behind locked doors (${durationMinutes} min rest). Actions locked while asleep.`,
    });
    return { success: true, message: `Asleep for ${durationMinutes} mins! Vitals restoring.` };
  };

  const wakeUp = () => {
    if (!player.isSleeping) return { success: false, message: 'You are not currently sleeping.' };
    setPlayer((prev) => ({
      ...prev,
      isSleeping: false,
      sleepRemainingSeconds: 0,
      hasUnsavedActions: true,
    }));
    addLog({
      type: 'CIVILIAN',
      message: 'Awoke from Lucid Dream World. Returned to the streets.',
    });
    return { success: true, message: 'Woke up from Lucid Dream World!' };
  };

  const sleepAtHome = () => {
    return startSleep(60);
  };

  // Vital & Stat Upgrades using Level Points & GREEN Coins - Gritty & Costly (No Upper Limit!)
  const upgradeVital = (vital: 'maxEnergy' | 'maxLife' | 'maxNerve' | 'maxHappy') => {
    const currentVal = player[vital] || 20;
    const greenCost = Math.round(currentVal * 6);

    if (player.money < greenCost) {
      triggerInsufficientFunds({
        currency: 'GREEN',
        requiredAmount: greenCost,
        currentBalance: player.money,
        itemName: `Permanent Vital Cap Upgrade: ${vital}`,
      });
      return { success: false, message: `Need 🌿 ${greenCost.toLocaleString()} GREEN Coins to forge this vital upgrade!` };
    }

    if (player.unallocatedStatPoints <= 0) {
      return { success: false, message: 'No unallocated attribute points available. Level up to earn points!' };
    }

    // Hardcore increments: +1 Energy max, +1 Nerve max, +5 Happy max, +10 Life max
    const increments = {
      maxEnergy: 1,
      maxNerve: 1,
      maxHappy: 5,
      maxLife: 10,
    };

    const inc = increments[vital];

    setPlayer((prev) => ({
      ...prev,
      money: prev.money - greenCost,
      unallocatedStatPoints: prev.unallocatedStatPoints - 1,
      [vital]: prev[vital] + inc,
      hasUnsavedActions: true,
    }));

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'LEVEL_UP',
      message: `Vital Upgraded: Paid 🌿 ${greenCost} GREEN + 1 Point to increase ${vital.toUpperCase()} by +${inc}! (New Max: ${player[vital] + inc})`,
    });

    return { success: true, message: `Upgraded ${vital} by +${inc}! (Cost: 🌿 ${greenCost} GREEN)` };
  };

  // Consume Food or Medicine (can be eaten in Home kitchen, Restaurant, or anywhere)
  const consumeItem = (itemId: string, location: 'ANY' | 'HOME' | 'RESTAURANT' = 'ANY') => {
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || item.quantity <= 0) return { success: false, message: 'Item not in inventory.' };

    if (item.category === 'FOOD' && location !== 'ANY') {
      if (location === 'HOME' && item.usableIn && !item.usableIn.includes('HOME')) {
        return { success: false, message: 'Cannot prepare this dish at home.' };
      }
      if (location === 'RESTAURANT' && item.usableIn && !item.usableIn.includes('RESTAURANT')) {
        return { success: false, message: 'This item is not served at restaurants.' };
      }
    }

    setPlayer((prev) => {
      const newEnergy = Math.min(prev.maxEnergy, prev.energy + (item.energyRestore || 0));
      const newHappy = Math.min(prev.maxHappy, prev.happy + (item.happyRestore || 0));
      const newLife = Math.min(prev.maxLife, prev.life + (item.lifeRestore || 0));
      const newFood = Math.min(prev.maxFood || 100, (prev.food ?? 70) + (item.foodRestore || 20));

      const updatedInv = prev.inventory
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      return {
        ...prev,
        energy: newEnergy,
        happy: newHappy,
        life: newLife,
        food: newFood,
        inventory: updatedInv,
        hasUnsavedActions: true,
      };
    });

    addLog({
      type: 'FOOD',
      message: `Ate ${item.name}! +${item.foodRestore || 20} Food ${item.energyRestore ? `+${item.energyRestore} Energy ` : ''}${item.happyRestore ? `+${item.happyRestore} Happy ` : ''}${item.lifeRestore ? `+${item.lifeRestore} Life` : ''}.`,
    });

    return { success: true, message: `Ate ${item.name}! Vitals restored.` };
  };

  const consumeFoodAt = (itemId: string, location: 'ANY' | 'HOME' | 'RESTAURANT') => {
    return consumeItem(itemId, location);
  };

  // Banking
  const depositToBank = (amount: number) => {
    if (amount <= 0 || amount > player.money) return { success: false, message: 'Invalid deposit amount.' };
    setPlayer((prev) => ({
      ...prev,
      money: prev.money - amount,
      bankMoney: prev.bankMoney + amount,
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: `Deposited $${amount.toLocaleString()} into Bank Vault.` });
    return { success: true, message: `Deposited $${amount.toLocaleString()}` };
  };

  const withdrawFromBank = (amount: number) => {
    if (amount <= 0 || amount > player.bankMoney) return { success: false, message: 'Insufficient bank balance.' };
    setPlayer((prev) => ({
      ...prev,
      money: prev.money + amount,
      bankMoney: prev.bankMoney - amount,
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: `Withdrew $${amount.toLocaleString()} in cash.` });
    return { success: true, message: `Withdrew $${amount.toLocaleString()}` };
  };

  const createFixedDeposit = (principal: number, days: number) => {
    if (principal <= 0 || principal > player.bankMoney) return { success: false, message: 'Insufficient funds.' };
    const rate = days === 7 ? 0.05 : days === 14 ? 0.12 : 0.25;
    const newFD: FixedDeposit = {
      id: 'fd_' + Date.now(),
      principal,
      interestRate: rate,
      durationDays: days,
      startedAt: Date.now(),
      maturesAt: Date.now() + days * 60 * 1000,
      claimed: false,
    };
    setPlayer((prev) => ({
      ...prev,
      bankMoney: prev.bankMoney - principal,
      fixedDeposits: [...prev.fixedDeposits, newFD],
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: `Opened ${days}-day Fixed Deposit ($${principal.toLocaleString()}).` });
    return { success: true, message: 'Fixed Deposit created!' };
  };

  const takeLoan = (amount: number) => {
    if (amount <= 0 || amount > 150000) return { success: false, message: 'Exceeds loan line ($150k max).' };
    const newLoan: BankLoan = {
      id: 'loan_' + Date.now(),
      principal: amount,
      amountDue: Math.round(amount * 1.15),
      interestRate: 0.15,
      dueDate: Date.now() + 7 * 24 * 3600 * 1000,
      isForeclosed: false,
    };
    setPlayer((prev) => ({
      ...prev,
      bankMoney: prev.bankMoney + amount,
      loans: [...prev.loans, newLoan],
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: `Bank Loan approved: +🌿 ${amount.toLocaleString()} GREEN` });
    return { success: true, message: `Loan credited: 🌿 ${amount.toLocaleString()} GREEN` };
  };

  const repayLoan = (loanId: string) => {
    const loan = player.loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Loan not found.' };
    if (player.bankMoney < loan.amountDue) return { success: false, message: 'Insufficient bank funds.' };
    setPlayer((prev) => ({
      ...prev,
      bankMoney: prev.bankMoney - loan.amountDue,
      loans: prev.loans.filter((l) => l.id !== loanId),
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: `Paid off loan of 🌿 ${loan.amountDue.toLocaleString()} GREEN.` });
    return { success: true, message: 'Loan cleared!' };
  };

  const buyProperty = (propertyId: string) => {
    const target = player.properties.find((p) => p.id === propertyId);
    if (!target || target.owned) return { success: false, message: 'Property unavailable.' };
    if (player.bankMoney < target.cost) {
      triggerInsufficientFunds({
        currency: 'BANK',
        requiredAmount: target.cost,
        currentBalance: player.bankMoney,
        itemName: target.name,
      });
      return { success: false, message: 'Insufficient funds.' };
    }
    setPlayer((prev) => ({
      ...prev,
      bankMoney: prev.bankMoney - target.cost,
      properties: prev.properties.map((p) => (p.id === propertyId ? { ...p, owned: true, isLocked: true } : p)),
      currentPropertyId: propertyId,
      maxEnergy: prev.maxEnergy + target.maxEnergyBonus,
      maxHappy: prev.maxHappy + target.maxHappyBonus,
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: `Acquired property: ${target.name}!` });
    return { success: true, message: `Purchased ${target.name}!` };
  };

  const buyItem = (item: InventoryItem) => {
    if (player.money < item.price) {
      triggerInsufficientFunds({
        currency: 'GREEN',
        requiredAmount: item.price,
        currentBalance: player.money,
        itemName: item.name,
      });
      return { success: false, message: 'Not enough pocket cash.' };
    }
    setPlayer((prev) => {
      const existing = prev.inventory.find((i) => i.id === item.id);
      const newInv = existing
        ? prev.inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.inventory, { ...item, quantity: 1 }];

      return {
        ...prev,
        money: prev.money - item.price,
        inventory: newInv,
        hasUnsavedActions: true,
      };
    });
    addLog({ type: 'SHOP', message: `Purchased ${item.name} for $${item.price.toLocaleString()}.` });
    return { success: true, message: `Bought ${item.name}!` };
  };

  const shopliftItem = (item: InventoryItem) => {
    if (player.energy < 10) return { success: false, message: 'Need 10 Energy to shoplift.' };
    const skill = player.criminalSkills.shoplifting;
    const successChance = Math.max(15, Math.min(90, skill * 8 - item.shopliftDifficulty * 0.4 + 40));
    const roll = Math.random() * 100;

    if (roll <= successChance) {
      setPlayer((prev) => {
        const existing = prev.inventory.find((i) => i.id === item.id);
        const newInv = existing
          ? prev.inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...prev.inventory, { ...item, quantity: 1 }];

        return {
          ...prev,
          energy: prev.energy - 10,
          inventory: newInv,
          criminalSkills: {
            ...prev.criminalSkills,
            shoplifting: +(prev.criminalSkills.shoplifting + 0.15).toFixed(2),
          },
          criminalRecord: {
            ...prev.criminalRecord,
            totalOffenses: prev.criminalRecord.totalOffenses + 1,
            theft: prev.criminalRecord.theft + 1,
          },
          xp: prev.xp + 25,
          hasUnsavedActions: true,
        };
      });
      addLog({
        type: 'CRIME',
        message: `🥷 CHEAT SUCCESS: Slipped ${item.name} past store scanners for free!`,
      });
      return { success: true, message: `Swiped ${item.name}!` };
    } else {
      // Fine charged according to item stolen: 50% of item value + (1/3 per level above level 1)
      const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
      const baseItemFine = Math.round(item.price * 0.5);
      const scaledFine = Math.max(50, Math.round(baseItemFine * levelMultiplier));

      const fromPocket = Math.min(player.money, scaledFine);
      const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
      const totalConfiscated = fromPocket + fromBank;

      setPlayer((prev) => ({
        ...prev,
        energy: prev.energy - 10,
        money: prev.money - fromPocket,
        bankMoney: prev.bankMoney - fromBank,
        totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
        jailTimeRemainingSeconds: 120,
        currentBailAmount: scaledFine,
        lastCrimeReason: `Attempted Shoplift: ${item.name} (Value: 🌿 ${item.price.toLocaleString()})`,
        hasUnsavedActions: true,
      }));

      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'POLICE',
        message: `🚨 BUSTED: Store alarms caught you stealing ${item.name}. Fined 🌿 ${scaledFine.toLocaleString()} GREEN (50% item value + Lv.${player.level} heat scaling). Jailed for 2 mins!`,
      });
      return {
        success: false,
        message: `Caught stealing ${item.name}! Fined 🌿 ${scaledFine.toLocaleString()} GREEN and jailed.`,
      };
    }
  };

  const commitCrime = (crime: Crime) => {
    if (player.nerve < crime.nerveCost) return { success: false, message: `Need ${crime.nerveCost} Nerve.` };
    const skillKey =
      crime.category === 'SEARCH_CASH'
        ? 'searchForCash'
        : crime.category === 'SHOPLIFT'
        ? 'shoplifting'
        : crime.category === 'GRAFFITI'
        ? 'graffiti'
        : crime.category === 'BOOTLEG'
        ? 'bootlegging'
        : crime.category === 'FORGERY'
        ? 'forgery'
        : crime.category === 'BURGLARY'
        ? 'burglary'
        : crime.category === 'SKIMMING'
        ? 'cardSkimming'
        : 'arson';

    const currentSkill = player.criminalSkills[skillKey];
    const successRate = Math.max(20, Math.min(95, crime.successRateBase + currentSkill * 2.5));
    const roll = Math.random() * 100;

    if (roll <= successRate) {
      const reward = Math.floor(Math.random() * (crime.cashRewardMax - crime.cashRewardMin + 1)) + crime.cashRewardMin;
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - crime.nerveCost,
        money: prev.money + reward,
        xp: prev.xp + 35,
        criminalSkills: {
          ...prev.criminalSkills,
          [skillKey]: +(prev.criminalSkills[skillKey] + 0.12).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          theft: prev.criminalRecord.theft + 1,
        },
        hasUnsavedActions: true,
      }));
      addLog({
        type: 'CRIME',
        message: `Crime Success: "${crime.name}" executed! Escaped with 🌿 ${reward.toLocaleString()} GREEN!`,
      });
      return { success: true, message: `+🌿 ${reward.toLocaleString()} GREEN!` };
    } else {
      const jailSecs = crime.jailTimeMinutes * 60;
      const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
      const baseFine = Math.round((crime.cashRewardMax || 250) * 0.5);
      const scaledFine = Math.max(75, Math.round(baseFine * levelMultiplier));

      const fromPocket = Math.min(player.money, scaledFine);
      const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
      const totalConfiscated = fromPocket + fromBank;

      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - crime.nerveCost,
        money: prev.money - fromPocket,
        bankMoney: prev.bankMoney - fromBank,
        totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
        jailTimeRemainingSeconds: jailSecs,
        currentBailAmount: scaledFine,
        lastCrimeReason: `Failed Crime: ${crime.name}`,
        hasUnsavedActions: true,
      }));
      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'POLICE',
        message: `CRIME FAILED: Busted during "${crime.name}". Fined 🌿 ${scaledFine.toLocaleString()} GREEN and jailed for ${crime.jailTimeMinutes} mins!`,
      });
      return { success: false, message: `Failed and arrested! Fined 🌿 ${scaledFine.toLocaleString()} GREEN.` };
    }
  };

  // CRIMES 2.0: Search for Cash at specific sub-locations with real items discovery!
  const executeSearchCrime = (locId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const loc = CRIMES_SEARCH_LOCATIONS.find((l) => l.id === locId) || CRIMES_SEARCH_LOCATIONS[0];
    if (player.nerve < loc.nerveCost) return { success: false, message: `Need ${loc.nerveCost} Nerve.` };

    const cashFound = Math.floor(Math.random() * (loc.maxCash - loc.minCash + 1)) + loc.minCash;
    const foundItemRoll = Math.random() < 0.50; // 50% chance of discovery
    let discoveredItem: InventoryItem | null = null;

    if (foundItemRoll && loc.lootPool.length > 0) {
      const loot = loc.lootPool[Math.floor(Math.random() * loc.lootPool.length)];
      discoveredItem = {
        id: loot.id + '_' + Date.now().toString(36),
        name: loot.name,
        description: loot.desc,
        category: loot.category,
        price: loot.val,
        marketValue: loot.val,
        shopliftDifficulty: 30,
        icon: loot.icon,
        quantity: 1,
        foodRestore: loot.foodRestore,
        energyRestore: loot.energyRestore,
        happyRestore: loot.happyRestore,
        perkDescription: loot.perkDescription,
      };
    }

    setPlayer((prev) => {
      let updatedInv = prev.inventory;
      if (discoveredItem) {
        const existing = prev.inventory.find((i) => i.name === discoveredItem?.name);
        if (existing) {
          updatedInv = prev.inventory.map((i) =>
            i.name === discoveredItem?.name ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          updatedInv = [...prev.inventory, discoveredItem];
        }
      }

      return {
        ...prev,
        nerve: prev.nerve - loc.nerveCost,
        money: prev.money + cashFound,
        inventory: updatedInv,
        xp: prev.xp + 25,
        criminalSkills: {
          ...prev.criminalSkills,
          searchForCash: +(prev.criminalSkills.searchForCash + 0.12).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          theft: prev.criminalRecord.theft + 1,
        },
        hasUnsavedActions: true,
      };
    });

    const msg = discoveredItem
      ? `Found $${cashFound} and looted "${discoveredItem.name}" in ${loc.name}!`
      : `Found $${cashFound} loose cash in ${loc.name}!`;

    addLog({ type: 'CRIME', message: `🔍 ${msg}` });
    return { success: true, message: msg, lootName: discoveredItem?.name, cash: cashFound };
  };

  // CRIMES 2.0: Bootlegging DVD copies
  const executeBootlegCopy = (genreId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    if (player.nerve < 2) return { success: false, message: 'Need 2 Nerve to burn discs.' };
    const genre = BOOTLEG_GENRES.find((g) => g.id === genreId) || BOOTLEG_GENRES[0];

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - 2,
      xp: prev.xp + 15,
      criminalSkills: {
        ...prev.criminalSkills,
        bootlegging: +(prev.criminalSkills.bootlegging + 0.10).toFixed(2),
      },
      hasUnsavedActions: true,
    }));

    addLog({ type: 'CRIME', message: `💿 Burned and packaged 1 copy of "${genre.name}" onto DVD!` });
    return { success: true, message: `Burned 1 copy of "${genre.name}"!` };
  };

  const executeBootlegSell = () => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    if (player.nerve < 5) return { success: false, message: 'Need 5 Nerve to peddle DVDs.' };
    const payout = Math.floor(Math.random() * 1200) + 1400;

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - 5,
      money: prev.money + payout,
      xp: prev.xp + 45,
      criminalSkills: {
        ...prev.criminalSkills,
        bootlegging: +(prev.criminalSkills.bootlegging + 0.25).toFixed(2),
      },
      criminalRecord: {
        ...prev.criminalRecord,
        totalOffenses: prev.criminalRecord.totalOffenses + 1,
        counterfeiting: prev.criminalRecord.counterfeiting + 1,
      },
      hasUnsavedActions: true,
    }));

    addLog({ type: 'CRIME', message: `💰 Sold a batch of counterfeit cyber media discs for +🌿 ${payout.toLocaleString()} GREEN!` });
    return { success: true, message: `Sold bootleg DVDs for +🌿 ${payout.toLocaleString()} GREEN!`, cash: payout };
  };

  // CRIMES 2.0: Graffiti Tagging
  const executeGraffiti = (districtId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const dist = GRAFFITI_DISTRICTS.find((d) => d.id === districtId) || GRAFFITI_DISTRICTS[0];
    if (player.nerve < dist.nerveCost) return { success: false, message: `Need ${dist.nerveCost} Nerve.` };

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - dist.nerveCost,
      xp: prev.xp + 30,
      faction: {
        ...prev.faction,
        respect: prev.faction.respect + dist.respectGain,
      },
      criminalSkills: {
        ...prev.criminalSkills,
        graffiti: +(prev.criminalSkills.graffiti + 0.15).toFixed(2),
      },
      criminalRecord: {
        ...prev.criminalRecord,
        totalOffenses: prev.criminalRecord.totalOffenses + 1,
        vandalism: prev.criminalRecord.vandalism + 1,
      },
      hasUnsavedActions: true,
    }));

    addLog({ type: 'CRIME', message: `🎨 Sprayed syndicate symbol in ${dist.name}! +${dist.respectGain} Faction Respect.` });
    return { success: true, message: `Tagged ${dist.name}! +${dist.respectGain} Respect.` };
  };

  // CRIMES 2.0: Shoplifting Store Displays
  const executeShopliftTarget = (targetId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const tgt = SHOPLIFTING_TARGETS.find((t) => t.id === targetId) || SHOPLIFTING_TARGETS[0];
    if (player.nerve < tgt.nerveCost) return { success: false, message: `Need ${tgt.nerveCost} Nerve.` };

    const skill = player.criminalSkills.shoplifting;
    const successRate = Math.max(20, Math.min(92, 45 + skill * 4 - tgt.diff * 0.3));
    const roll = Math.random() * 100;

    if (roll <= successRate) {
      const stolenItem: InventoryItem = {
        id: 'shoplift_' + tgt.id + '_' + Date.now().toString(36),
        name: tgt.storeLoot,
        description: `Stolen from ${tgt.name}.`,
        category: 'CONTRABAND',
        price: tgt.lootVal,
        marketValue: tgt.lootVal,
        shopliftDifficulty: tgt.diff,
        icon: tgt.icon,
        quantity: 1,
      };

      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - tgt.nerveCost,
        inventory: [...prev.inventory, stolenItem],
        xp: prev.xp + 40,
        criminalSkills: {
          ...prev.criminalSkills,
          shoplifting: +(prev.criminalSkills.shoplifting + 0.18).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          theft: prev.criminalRecord.theft + 1,
        },
        hasUnsavedActions: true,
      }));

      addLog({ type: 'CRIME', message: `🏪 Shoplifted "${tgt.storeLoot}" ($${tgt.lootVal}) from ${tgt.name}!` });
      return { success: true, message: `Slipped away with ${tgt.storeLoot}!`, stolenItem: tgt.storeLoot };
    } else {
      const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
      const baseFine = Math.round(tgt.lootVal * 0.5);
      const scaledFine = Math.max(100, Math.round(baseFine * levelMultiplier));

      const fromPocket = Math.min(player.money, scaledFine);
      const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
      const totalConfiscated = fromPocket + fromBank;

      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - tgt.nerveCost,
        money: prev.money - fromPocket,
        bankMoney: prev.bankMoney - fromBank,
        totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
        jailTimeRemainingSeconds: 120,
        currentBailAmount: scaledFine,
        lastCrimeReason: `Shoplifting "${tgt.storeLoot}" from ${tgt.name}`,
        hasUnsavedActions: true,
      }));
      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'POLICE',
        message: `🚨 BUSTED: Store security caught you inside ${tgt.name}. Fined 🌿 ${scaledFine.toLocaleString()} GREEN (50% value + Lv.${player.level} heat). Jailed for 2 mins!`,
      });
      return { success: false, message: `Busted by store security! Fined 🌿 ${scaledFine.toLocaleString()} GREEN.` };
    }
  };

  // CRIMES 2.0: Pickpocketing Pedestrians
  const executePickpocketTarget = (targetId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const tgt = PICKPOCKETING_TARGETS.find((t) => t.id === targetId) || PICKPOCKETING_TARGETS[0];
    if (player.nerve < tgt.nerveCost) return { success: false, message: `Need ${tgt.nerveCost} Nerve.` };

    const roll = Math.random() * 100;
    if (roll <= tgt.successRate) {
      const cash = Math.floor(Math.random() * (tgt.cashMax - tgt.cashMin + 1)) + tgt.cashMin;
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - tgt.nerveCost,
        money: prev.money + cash,
        xp: prev.xp + 35,
        criminalSkills: {
          ...prev.criminalSkills,
          shoplifting: +(prev.criminalSkills.shoplifting + 0.12).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          theft: prev.criminalRecord.theft + 1,
        },
        hasUnsavedActions: true,
      }));
      addLog({ type: 'CRIME', message: `👛 Pickpocketed $${cash} from a ${tgt.name}!` });
      return { success: true, message: `Lifted $${cash} without getting noticed!`, cash };
    } else {
      const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
      const baseFine = Math.round(tgt.cashMax * 0.5);
      const scaledFine = Math.max(75, Math.round(baseFine * levelMultiplier));

      const fromPocket = Math.min(player.money, scaledFine);
      const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
      const totalConfiscated = fromPocket + fromBank;

      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - tgt.nerveCost,
        money: prev.money - fromPocket,
        bankMoney: prev.bankMoney - fromBank,
        totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
        jailTimeRemainingSeconds: 90,
        currentBailAmount: scaledFine,
        lastCrimeReason: `Pickpocketing ${tgt.name}`,
        hasUnsavedActions: true,
      }));
      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'POLICE',
        message: `🚨 BUSTED: The ${tgt.name} grabbed your wrist and yelled for police! Fined 🌿 ${scaledFine.toLocaleString()} GREEN and jailed for 90s.`,
      });
      return { success: false, message: `Caught red-handed! Fined 🌿 ${scaledFine.toLocaleString()} GREEN.` };
    }
  };

  // CRIMES 2.0: Card Skimming
  const executeSkimInstall = (locId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    if (player.nerve < 6) return { success: false, message: 'Need 6 Nerve to install skimmer.' };
    const loc = SKIMMER_LOCATIONS.find((l) => l.id === locId) || SKIMMER_LOCATIONS[0];

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - 6,
      xp: prev.xp + 45,
      criminalSkills: {
        ...prev.criminalSkills,
        cardSkimming: +(prev.criminalSkills.cardSkimming + 0.20).toFixed(2),
      },
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CRIME', message: `💳 Hardware skimmer successfully placed at ${loc.name}!` });
    return { success: true, message: `Installed skimmer at ${loc.name}!` };
  };

  const executeSkimSell = (locId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    if (player.nerve < 6) return { success: false, message: 'Need 6 Nerve to sell card dumps.' };
    const payout = Math.floor(Math.random() * 1600) + 1800;

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - 6,
      money: prev.money + payout,
      xp: prev.xp + 55,
      criminalSkills: {
        ...prev.criminalSkills,
        cardSkimming: +(prev.criminalSkills.cardSkimming + 0.35).toFixed(2),
      },
      criminalRecord: {
        ...prev.criminalRecord,
        totalOffenses: prev.criminalRecord.totalOffenses + 1,
        fraud: prev.criminalRecord.fraud + 1,
      },
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CRIME', message: `💸 Sold cloned ATM card magnetic dump for +🌿 ${payout.toLocaleString()} GREEN!` });
    return { success: true, message: `Dump sold for +🌿 ${payout.toLocaleString()} GREEN!`, cash: payout };
  };

  // CRIMES 2.0: Burglary
  const executeBurglaryScout = (targetId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const tgt = BURGLARY_TARGETS.find((b) => b.id === targetId) || BURGLARY_TARGETS[0];
    if (player.nerve < tgt.nerveCost) return { success: false, message: `Need ${tgt.nerveCost} Nerve.` };

    const skill = player.criminalSkills.burglary;
    const successRate = Math.max(25, Math.min(90, 50 + skill * 4 - tgt.lockDiff * 0.3));
    const roll = Math.random() * 100;

    if (roll <= successRate) {
      const loot = Math.floor(Math.random() * (tgt.lootMax - tgt.lootMin + 1)) + tgt.lootMin;
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - tgt.nerveCost,
        money: prev.money + loot,
        xp: prev.xp + 65,
        criminalSkills: {
          ...prev.criminalSkills,
          burglary: +(prev.criminalSkills.burglary + 0.28).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          theft: prev.criminalRecord.theft + 1,
        },
        hasUnsavedActions: true,
      }));
      addLog({ type: 'CRIME', message: `🔓 Bypassed deadbolt on ${tgt.name}! Escaped with +🌿 ${loot.toLocaleString()} GREEN in loot.` });
      return { success: true, message: `Broke into ${tgt.name}! Looted +🌿 ${loot.toLocaleString()} GREEN`, cash: loot };
    } else {
      const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
      const baseFine = Math.round(tgt.lootMax * 0.5);
      const scaledFine = Math.max(250, Math.round(baseFine * levelMultiplier));

      const fromPocket = Math.min(player.money, scaledFine);
      const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
      const totalConfiscated = fromPocket + fromBank;

      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - tgt.nerveCost,
        money: prev.money - fromPocket,
        bankMoney: prev.bankMoney - fromBank,
        totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
        jailTimeRemainingSeconds: 180,
        currentBailAmount: scaledFine,
        lastCrimeReason: `Burglary Deadbolt Breach on ${tgt.name}`,
        hasUnsavedActions: true,
      }));
      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'POLICE',
        message: `🚨 ALARM TRIPPED: Silent alarm triggered at ${tgt.name}! Fined 🌿 ${scaledFine.toLocaleString()} GREEN and jailed for 3 mins.`,
      });
      return { success: false, message: `Silent alarm triggered! Fined 🌿 ${scaledFine.toLocaleString()} GREEN.` };
    }
  };

  // CRIMES 2.0: Street Hustling
  const executeHustling = (gameId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const game = HUSTLING_GAMES.find((g) => g.id === gameId) || HUSTLING_GAMES[0];
    if (player.nerve < game.nerveCost) return { success: false, message: `Need ${game.nerveCost} Nerve.` };

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - game.nerveCost,
      money: prev.money + game.payout,
      xp: prev.xp + 30,
      criminalSkills: {
        ...prev.criminalSkills,
        hustling: +(prev.criminalSkills.hustling + 0.18).toFixed(2),
      },
      criminalRecord: {
        ...prev.criminalRecord,
        totalOffenses: prev.criminalRecord.totalOffenses + 1,
        fraud: prev.criminalRecord.fraud + 1,
      },
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CRIME', message: `🎲 Ran street "${game.name}" for a gathered crowd! Collected +🌿 ${game.payout} GREEN.` });
    return { success: true, message: `Won +🌿 ${game.payout} GREEN from audience wagers!`, cash: game.payout };
  };

  // CRIMES 2.0: Waste Disposal
  const executeDisposal = (tierId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const tier = DISPOSAL_TIERS.find((t) => t.id === tierId) || DISPOSAL_TIERS[0];
    if (player.nerve < tier.nerveCost) return { success: false, message: `Need ${tier.nerveCost} Nerve.` };

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - tier.nerveCost,
      money: prev.money + tier.fee,
      xp: prev.xp + 35,
      criminalRecord: {
        ...prev.criminalRecord,
        totalOffenses: prev.criminalRecord.totalOffenses + 1,
      },
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CRIME', message: `☣️ Secretly disposed of "${tier.name}"! Earned +🌿 ${tier.fee.toLocaleString()} GREEN fee.` });
    return { success: true, message: `Disposed waste, earned +🌿 ${tier.fee.toLocaleString()} GREEN!`, cash: tier.fee };
  };

  // CRIMES 2.0: Forgery
  const executeForgeryStep = (projId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const proj = FORGERY_PROJECTS.find((p) => p.id === projId) || FORGERY_PROJECTS[0];
    if (player.nerve < proj.nervePerStep) return { success: false, message: `Need ${proj.nervePerStep} Nerve.` };

    setPlayer((prev) => ({
      ...prev,
      nerve: prev.nerve - proj.nervePerStep,
      money: prev.money + proj.payout,
      xp: prev.xp + 60,
      criminalSkills: {
        ...prev.criminalSkills,
        forgery: +(prev.criminalSkills.forgery + 0.25).toFixed(2),
      },
      criminalRecord: {
        ...prev.criminalRecord,
        totalOffenses: prev.criminalRecord.totalOffenses + 1,
        counterfeiting: prev.criminalRecord.counterfeiting + 1,
      },
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CRIME', message: `🖨️ Completed high-grade forged "${proj.name}"! Sold to underground broker for +🌿 ${proj.payout.toLocaleString()} GREEN.` });
    return { success: true, message: `Forged ${proj.name} for +🌿 ${proj.payout.toLocaleString()} GREEN!`, completed: true };
  };

  // CRIMES 2.0: Cyber Phishing & Scamming
  const executeScamPhishing = (emailId: string) => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const email = SCAMMING_EMAILS.find((e) => e.id === emailId) || SCAMMING_EMAILS[0];
    if (player.nerve < email.nerveCost) return { success: false, message: `Need ${email.nerveCost} Nerve.` };

    const roll = Math.random() * 100;
    if (roll <= email.successRate) {
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - email.nerveCost,
        money: prev.money + email.payout,
        xp: prev.xp + 50,
        criminalSkills: {
          ...prev.criminalSkills,
          cracking: +(prev.criminalSkills.cracking + 0.20).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          cybercrime: prev.criminalRecord.cybercrime + 1,
          fraud: prev.criminalRecord.fraud + 1,
        },
        hasUnsavedActions: true,
      }));
      addLog({ type: 'CRIME', message: `📧 Target fell for phishing campaign "${email.subject}"! Collected wire settlement +🌿 ${email.payout.toLocaleString()} GREEN.` });
      return { success: true, message: `Wire received: +🌿 ${email.payout.toLocaleString()} GREEN!`, cash: email.payout };
    } else {
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - email.nerveCost,
        hasUnsavedActions: true,
      }));
      addLog({ type: 'CRIME', message: `⚠️ Phishing campaign bounced back or flagged by spam filters.` });
      return { success: false, message: 'Target flagged email as spam. No payout.' };
    }
  };

  // CRIMES 2.0: Authentic Torn Arson System (BREACH / INQUIRE / PLACE)
  const executeArson = (targetId: string, actionType: 'BREACH' | 'INQUIRE' | 'PLACE' = 'BREACH') => {
    if (player.isSleeping) return { success: false, message: 'You are currently asleep resting! Wake up first.' };
    const tgt = ARSON_LOCATIONS.find((a) => a.id === targetId) || ARSON_LOCATIONS[0];
    const nerveRequired = actionType === 'PLACE' ? 5 : actionType === 'INQUIRE' ? 2 : 3;
    if (player.nerve < nerveRequired) return { success: false, message: `Need ${nerveRequired} Nerve.` };

    const currentStats = player.arsonStats || { breaches: 1, fails: 10, alerts: 0 };
    const currentProg = (player.arsonProgress || {})[targetId] || 0;

    // Action 1: INQUIRE (Reconnaissance - safe, maps perimeter)
    if (actionType === 'INQUIRE') {
      const newProg = Math.min(100, currentProg + 25);
      const scoutReward = Math.floor(Math.random() * 400) + 250;
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - nerveRequired,
        money: prev.money + scoutReward,
        xp: prev.xp + 35,
        criminalSkills: {
          ...prev.criminalSkills,
          arson: +(prev.criminalSkills.arson + 0.15).toFixed(2),
        },
        arsonStats: {
          ...currentStats,
          alerts: currentStats.alerts + 1,
        },
        arsonProgress: {
          ...(prev.arsonProgress || {}),
          [targetId]: newProg,
        },
        hasUnsavedActions: true,
      }));
      addLog({
        type: 'CRIME',
        message: `🔍 INQUIRE RECON: Scouted ${tgt.name} (${tgt.subtitle}). Mapped motion sensors & guard routes (+🌿 ${scoutReward} GREEN scout tip, +25% Recon).`,
      });
      return {
        success: true,
        message: `Inquired ${tgt.name}! Recon at ${newProg}%. +🌿 ${scoutReward} GREEN`,
        cash: scoutReward,
      };
    }

    // Action 2: BREACH (Breach perimeter locks, loot cash deposits)
    if (actionType === 'BREACH') {
      const skill = player.criminalSkills.arson;
      const reconBonus = currentProg > 50 ? 15 : currentProg > 0 ? 8 : 0;
      const successRate = Math.max(35, Math.min(92, 55 + skill * 3 + reconBonus - tgt.difficulty * 0.25));
      const roll = Math.random() * 100;

      if (roll <= successRate) {
        const payout = Math.floor(Math.random() * (tgt.payoutMax - tgt.payoutMin + 1)) + tgt.payoutMin;
        setPlayer((prev) => ({
          ...prev,
          nerve: prev.nerve - nerveRequired,
          money: prev.money + payout,
          xp: prev.xp + 85,
          criminalSkills: {
            ...prev.criminalSkills,
            arson: +(prev.criminalSkills.arson + 0.35).toFixed(2),
          },
          criminalRecord: {
            ...prev.criminalRecord,
            totalOffenses: prev.criminalRecord.totalOffenses + 1,
            extortion: prev.criminalRecord.extortion + 1,
          },
          arsonStats: {
            ...currentStats,
            breaches: currentStats.breaches + 1,
          },
          arsonProgress: {
            ...(prev.arsonProgress || {}),
            [targetId]: 100,
          },
          hasUnsavedActions: true,
        }));
        addLog({
          type: 'CRIME',
          message: `🚪 BREACH SUCCESS: Infiltrated ${tgt.name}! Bypassed perimeter locks and cleared safe. Collected +🌿 ${payout.toLocaleString()} GREEN.`,
        });
        return { success: true, message: `Breached ${tgt.name}! +🌿 ${payout.toLocaleString()} GREEN`, cash: payout };
      } else {
        const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
        const baseFine = Math.round((tgt.payoutMax || 2000) * 0.5);
        const scaledFine = Math.max(300, Math.round(baseFine * levelMultiplier));

        const fromPocket = Math.min(player.money, scaledFine);
        const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
        const totalConfiscated = fromPocket + fromBank;

        setPlayer((prev) => ({
          ...prev,
          nerve: prev.nerve - nerveRequired,
          money: prev.money - fromPocket,
          bankMoney: prev.bankMoney - fromBank,
          totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
          jailTimeRemainingSeconds: 180,
          currentBailAmount: scaledFine,
          lastCrimeReason: `Arson Breach at ${tgt.name}`,
          arsonStats: {
            ...currentStats,
            fails: currentStats.fails + 1,
          },
          hasUnsavedActions: true,
        }));
        SoundEngine.playHit(player.soundEnabled);
        addLog({
          type: 'POLICE',
          message: `🚨 BREACH ALARM: Perimeter tripwire tripped at ${tgt.name}! Fined 🌿 ${scaledFine.toLocaleString()} GREEN and jailed for 3 mins.`,
        });
        return { success: false, message: `Breach alarm tripped! Fined 🌿 ${scaledFine.toLocaleString()} GREEN.` };
      }
    }

    // Action 3: PLACE (Plant incendiary accelerants, explosive contract)
    const skill = player.criminalSkills.arson;
    const successRate = Math.max(30, Math.min(90, 50 + skill * 3.5 - tgt.difficulty * 0.3));
    const roll = Math.random() * 100;

    if (roll <= successRate) {
      const payout = Math.floor(Math.random() * (tgt.payoutMax - tgt.payoutMin + 1)) + tgt.payoutMin + 1500;
      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - nerveRequired,
        money: prev.money + payout,
        xp: prev.xp + 150,
        criminalSkills: {
          ...prev.criminalSkills,
          arson: +(prev.criminalSkills.arson + 0.50).toFixed(2),
        },
        criminalRecord: {
          ...prev.criminalRecord,
          totalOffenses: prev.criminalRecord.totalOffenses + 1,
          extortion: prev.criminalRecord.extortion + 1,
        },
        arsonStats: {
          ...currentStats,
          breaches: currentStats.breaches + 1,
        },
        arsonProgress: {
          ...(prev.arsonProgress || {}),
          [targetId]: 100,
        },
        hasUnsavedActions: true,
      }));
      addLog({
        type: 'CRIME',
        message: `🔥 INCENDIARY DETONATION: Placed accelerant charge at ${tgt.name}! Structural incineration confirmed. Collected +🌿 ${payout.toLocaleString()} GREEN.`,
      });
      return { success: true, message: `Placed incendiary at ${tgt.name}! +🌿 ${payout.toLocaleString()} GREEN`, cash: payout };
    } else {
      const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
      const baseFine = Math.round((tgt.payoutMax || 4000) * 0.5);
      const scaledFine = Math.max(500, Math.round(baseFine * levelMultiplier));

      const fromPocket = Math.min(player.money, scaledFine);
      const fromBank = Math.min(player.bankMoney, scaledFine - fromPocket);
      const totalConfiscated = fromPocket + fromBank;

      setPlayer((prev) => ({
        ...prev,
        nerve: prev.nerve - nerveRequired,
        money: prev.money - fromPocket,
        bankMoney: prev.bankMoney - fromBank,
        totalFinesPaid: (prev.totalFinesPaid || 0) + totalConfiscated,
        jailTimeRemainingSeconds: 240,
        currentBailAmount: scaledFine,
        lastCrimeReason: `Industrial Arson Incendiary at ${tgt.name}`,
        arsonStats: {
          ...currentStats,
          fails: currentStats.fails + 1,
        },
        hasUnsavedActions: true,
      }));
      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'POLICE',
        message: `🚨 ARSON TRAP: Fire marshals cordoned ${tgt.name} as you planted the fuse! Fined 🌿 ${scaledFine.toLocaleString()} GREEN and jailed for 4 mins.`,
      });
      return { success: false, message: `Busted by fire marshals! Fined 🌿 ${scaledFine.toLocaleString()} GREEN.` };
    }
  };

  const trainStat = (stat: keyof BattleStats, energyCost: number) => {
    if (player.energy < energyCost) return { success: false, message: `Need ${energyCost} Energy.` };
    const gain = Math.floor(Math.random() * 2) + 1;
    setPlayer((prev) => ({
      ...prev,
      energy: prev.energy - energyCost,
      battleStats: {
        ...prev.battleStats,
        [stat]: prev.battleStats[stat] + gain,
      },
      xp: prev.xp + 15,
      hasUnsavedActions: true,
    }));
    addLog({
      type: 'TRAIN',
      message: `Trained ${stat.toUpperCase()}! Gained +${gain} stat points.`,
    });
    return { success: true, message: `+${gain} ${stat.toUpperCase()} gained!` };
  };

  const startEducation = (courseId: string) => {
    setPlayer((prev) => ({
      ...prev,
      educationCourses: prev.educationCourses.map((c) =>
        c.id === courseId ? { ...c, completed: true } : c
      ),
      hasUnsavedActions: true,
    }));
    addLog({
      type: 'EDUCATION',
      message: 'Course completed! You may now take the official examination.',
    });
    return { success: true, message: 'Course completed! Ready for Exam.' };
  };

  const submitExam = (courseId: string, answers: number[]) => {
    const course = player.educationCourses.find((c) => c.id === courseId);
    if (!course) return { success: false, message: 'Course not found.', score: 0 };

    let correctCount = 0;
    course.examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.answerIndex) correctCount++;
    });

    const passed = correctCount === course.examQuestions.length;

    if (passed) {
      setPlayer((prev) => ({
        ...prev,
        role: course.unlocksProfession,
        educationCourses: prev.educationCourses.map((c) =>
          c.id === courseId ? { ...c, examPassed: true } : c
        ),
        workingStats: {
          ...prev.workingStats,
          intelligence: prev.workingStats.intelligence + 10,
        },
        xp: prev.xp + 150,
        hasUnsavedActions: true,
      }));
      addLog({
        type: 'EDUCATION',
        message: `🎓 EXAM PASSED! Scored ${correctCount}/${course.examQuestions.length}. Unlocked: ${course.unlocksProfession}!`,
      });
      return { success: true, message: `Passed ${correctCount}/${course.examQuestions.length}! Profession Unlocked: ${course.unlocksProfession}`, score: correctCount };
    } else {
      addLog({
        type: 'EDUCATION',
        message: `EXAM FAILED: Scored ${correctCount}/${course.examQuestions.length}. Need 100% to pass.`,
      });
      return { success: false, message: `Failed (${correctCount}/${course.examQuestions.length}).`, score: correctCount };
    }
  };

  const registerBusiness = (businessId: string, customName: string) => {
    const biz = player.businessRegistries.find((b) => b.id === businessId);
    if (!biz || biz.isRegistered) return { success: false, message: 'Business unavailable or registered.' };

    const requiredExam = player.educationCourses.find((c) => c.id === biz.requiredExamId);
    if (!requiredExam?.examPassed) {
      return { success: false, message: `Exam required: Must pass "${requiredExam?.title}" first!` };
    }

    const totalCost = biz.monthlyTax;
    if (player.bankMoney < totalCost + biz.requiredCapital) {
      return {
        success: false,
        message: `Insufficient capital: Requires $${biz.requiredCapital.toLocaleString()} reserve + $${biz.monthlyTax.toLocaleString()} filing tax in bank!`,
      };
    }

    setPlayer((prev) => ({
      ...prev,
      bankMoney: prev.bankMoney - totalCost,
      businessRegistries: prev.businessRegistries.map((b) =>
        b.id === businessId
          ? {
              ...b,
              name: customName || b.name,
              isRegistered: true,
              registeredAt: Date.now(),
            }
          : b
      ),
      hasUnsavedActions: true,
    }));
    addLog({
      type: 'BUSINESS',
      message: `CITY CHARTER ISSUED: "${customName || biz.name}" is officially incorporated!`,
    });
    return { success: true, message: `Charter registered: ${customName || biz.name}!` };
  };

  const upgradeBusinessLicenseTier = (businessId: string, tier: LicenseTier) => {
    const capacities: Record<LicenseTier, number> = {
      MICRO_50: 50,
      COMMERCIAL_500: 500,
      ENTERPRISE_5000: 5000,
      MEGA_10000: 10000,
    };

    setPlayer((prev) => ({
      ...prev,
      businessRegistries: prev.businessRegistries.map((b) =>
        b.id === businessId ? { ...b, licenseTier: tier, maxDailyCapacity: capacities[tier] } : b
      ),
      hasUnsavedActions: true,
    }));

    addLog({
      type: 'BUSINESS',
      message: `Upgraded business license capacity to ${capacities[tier]} units/day!`,
    });

    return { success: true, message: `License upgraded to ${capacities[tier]} units/day!` };
  };

  const toggleBusinessService = (businessId: string, serviceId: string) => {
    setPlayer((prev) => ({
      ...prev,
      businessRegistries: prev.businessRegistries.map((b) =>
        b.id === businessId
          ? {
              ...b,
              services: b.services.map((s) => (s.id === serviceId ? { ...s, active: !s.active } : s)),
            }
          : b
      ),
      hasUnsavedActions: true,
    }));
    return { success: true, message: 'Service availability updated!' };
  };

  const collectBusinessRevenue = (businessId: string) => {
    const biz = player.businessRegistries.find((b) => b.id === businessId && b.isRegistered);
    if (!biz) return { success: false, message: 'Business not registered.' };

    const netProfit = biz.dailyRevenue - biz.dailyUpkeep;
    setPlayer((prev) => ({
      ...prev,
      bankMoney: prev.bankMoney + netProfit,
      hasUnsavedActions: true,
    }));
    addLog({
      type: 'BUSINESS',
      message: `Dividends: Collected +🌿 ${netProfit.toLocaleString()} GREEN profit from ${biz.name}.`,
    });
    return { success: true, message: `Collected +🌿 ${netProfit.toLocaleString()} GREEN net profit!` };
  };

  const spendMissionCredits = (cost: number, item: InventoryItem) => {
    if (player.missionCredits < cost) return { success: false, message: 'Insufficient mission credits.' };
    setPlayer((prev) => {
      const existing = prev.inventory.find((i) => i.id === item.id);
      const newInv = existing
        ? prev.inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.inventory, { ...item, quantity: 1 }];

      return {
        ...prev,
        missionCredits: prev.missionCredits - cost,
        inventory: newInv,
        hasUnsavedActions: true,
      };
    });
    addLog({
      type: 'SHOP',
      message: `Mission Shop: Purchased ${item.name} for ${cost} Mission Credits!`,
    });
    return { success: true, message: `Acquired ${item.name}!` };
  };

  const playCasinoGame = (
    game: 'SLOTS' | 'ROULETTE' | 'HIGH_LOW' | 'KENO' | 'CRAPS' | 'BOOKIE' | 'LOTTERY' | 'BLACKJACK',
    bet: number
  ) => {
    if (bet <= 0 || bet > player.money) {
      return { won: false, payout: 0, message: 'Invalid bet or insufficient pocket cash.' };
    }

    const odds: Record<string, number> = {
      SLOTS: 0.45,
      ROULETTE: 0.48,
      HIGH_LOW: 0.50,
      KENO: 0.40,
      CRAPS: 0.49,
      BOOKIE: 0.46,
      LOTTERY: 0.15,
      BLACKJACK: 0.49,
    };

    const multipliers: Record<string, number> = {
      SLOTS: 3,
      ROULETTE: 2,
      HIGH_LOW: 2,
      KENO: 4,
      CRAPS: 2,
      BOOKIE: 2.2,
      LOTTERY: 10,
      BLACKJACK: 2,
    };

    const winProb = odds[game] || 0.48;
    const mult = multipliers[game] || 2;
    const won = Math.random() < winProb;

    if (won) {
      const winPayout = Math.round(bet * mult);
      setPlayer((prev) => ({
        ...prev,
        money: prev.money + (winPayout - bet),
        hasUnsavedActions: true,
      }));
      addLog({
        type: 'CIVILIAN',
        message: `🎰 CASINO WIN: Won $${winPayout.toLocaleString()} on ${game}!`,
      });
      return { won: true, payout: winPayout, message: `🎉 WIN! You won $${winPayout.toLocaleString()} on ${game}!` };
    } else {
      setPlayer((prev) => ({
        ...prev,
        money: prev.money - bet,
        hasUnsavedActions: true,
      }));
      addLog({
        type: 'CIVILIAN',
        message: `❌ CASINO LOSS: Lost $${bet.toLocaleString()} on ${game}.`,
      });
      return { won: false, payout: 0, message: `The house won. Lost $${bet.toLocaleString()} on ${game}.` };
    }
  };

  const healInHospital = () => {
    const cost = 250;
    if (player.money < cost) return { success: false, message: 'Need $250 for hospital care.' };
    setPlayer((prev) => ({
      ...prev,
      money: prev.money - cost,
      life: prev.maxLife,
      hospitalTimeRemainingSeconds: 0,
      hasUnsavedActions: true,
    }));
    addLog({ type: 'CIVILIAN', message: 'Treated at hospital. Full Life restored.' });
    return { success: true, message: 'Fully healed!' };
  };

  const bailFromJail = () => {
    // Dynamic bail: matches fine of crime committed (50% theft value + 1/3 per level)
    const levelMultiplier = 1 + Math.max(0, player.level - 1) * (1 / 3);
    const bailCost =
      player.currentBailAmount && player.currentBailAmount > 0
        ? player.currentBailAmount
        : Math.max(100, Math.round(300 * levelMultiplier));

    if (player.money + player.bankMoney < bailCost) {
      triggerInsufficientFunds({
        currency: 'GREEN',
        requiredAmount: bailCost,
        currentBalance: player.money + player.bankMoney,
        itemName: `Municipal Jail Bail Bond (${player.lastCrimeReason || 'Criminal Sentence'})`,
      });
      return {
        success: false,
        message: `Bail bond costs 🌿 ${bailCost.toLocaleString()} GREEN. Insufficient funds in pocket/bank!`,
      };
    }

    setPlayer((prev) => {
      const fromHand = Math.min(prev.money, bailCost);
      const fromBank = bailCost - fromHand;
      return {
        ...prev,
        money: prev.money - fromHand,
        bankMoney: prev.bankMoney - fromBank,
        jailTimeRemainingSeconds: 0,
        currentBailAmount: 0,
        hasUnsavedActions: true,
      };
    });

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'POLICE',
      message: `⚖️ BAIL POSTED: Paid 🌿 ${bailCost.toLocaleString()} GREEN bond (${player.lastCrimeReason || 'Criminal Sentence'}). Released from Municipal Jail!`,
    });
    return { success: true, message: `Bail posted (🌿 ${bailCost.toLocaleString()} GREEN)! You are free.` };
  };

  const exportBackupJson = () => JSON.stringify(player, null, 2);

  const importBackupJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.id || !parsed.battleStats) return { success: false, message: 'Invalid backup format.' };
      setPlayer(parsed);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      addLog({ type: 'SAVE', message: '✓ Backup restored successfully!' });
      return { success: true, message: 'Game restored successfully from backup!' };
    } catch {
      return { success: false, message: 'Corrupted backup data.' };
    }
  };

  const toggleSound = () => {
    setPlayer((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
      hasUnsavedActions: true,
    }));
  };

  const spinDailyWheel = () => {
    if (player.dailyWheelSpinsAvailable <= 0) {
      return { rewardText: 'No daily spins remaining today. Resets daily!' };
    }

    const prizes = [
      { text: '+🌿 500 GREEN Coins', cash: 500 },
      { text: '+50 Energy Overdrive', energy: 50 },
      { text: '18k Gold Signet Ring (Epic)', item: 'loot_gold_ring' },
      { text: '+🌿 250 GREEN Coins', cash: 250 },
      { text: '+25 Happy Morale Boost', happy: 25 },
      { text: 'Titanium Tension Lockpick', item: 'item_lockpick' },
      { text: '+🌿 1,000 GREEN Bounty', cash: 1000 },
      { text: 'Military Adrenaline Auto-Injector', item: 'baz_item_stim' },
      { text: '+🌿 100 Street GREEN', cash: 100 },
      { text: '+100 Energy Tactical Surge', energy: 100 },
      { text: 'GRAND JACKPOT: +🌿 5,000 GREEN COINS!', cash: 5000, jackpot: true },
      { text: 'Tactical Wagyu Ribeye Steak', item: 'item_steak' },
    ];

    const won = prizes[Math.floor(Math.random() * prizes.length)];

    setPlayer((prev) => {
      let money = prev.money;
      let energy = prev.energy;
      let happy = prev.happy;
      let inv = prev.inventory;

      if (won.cash) money += won.cash;
      if (won.energy) energy = Math.min(prev.maxEnergy + 150, energy + won.energy);
      if (won.happy) happy = Math.min(prev.maxHappy + 200, happy + won.happy);

      if (won.item) {
        const existing = inv.find((i) => i.id === won.item);
        if (existing) {
          inv = inv.map((i) => (i.id === won.item ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
          inv = [
            ...inv,
            {
              id: won.item + '_' + Date.now().toString(36),
              name: won.text.split('(')[0].trim(),
              description: 'Won from the Metropolis Daily Wheel of Fortune!',
              category: 'LUXURY',
              rarity: 'EPIC',
              price: 2500,
              marketValue: 2500,
              shopliftDifficulty: 50,
              icon: '🎁',
              quantity: 1,
            },
          ];
        }
      }

      return {
        ...prev,
        money,
        energy,
        happy,
        inventory: inv,
        dailyWheelSpinsAvailable: prev.dailyWheelSpinsAvailable - 1,
        lastWheelSpinTimestamp: Date.now(),
        hasUnsavedActions: true,
      };
    });

    if (won.jackpot) {
      SoundEngine.playVictory(player.soundEnabled);
    } else {
      SoundEngine.playLoot(player.soundEnabled);
    }

    addLog({ type: 'CIVILIAN', message: `🎡 WHEEL OF FORTUNE: Won ${won.text}!` });
    return { rewardText: won.text, rewardCash: won.cash, rewardItem: won.item };
  };

  const claimDailyStreak = () => {
    const day = (player.dailyStreak || 1);
    const rewards = [
      { day: 1, title: '$10,000 Cash + 25 Energy', cash: 10000, energy: 25, nerve: 0, green: 0 },
      { day: 2, title: '50 Sparks + 10 Nerve', cash: 0, energy: 0, nerve: 10, sparks: 50, green: 0 },
      { day: 3, title: 'Titanium Tension Lockpick + $25,000 Cash', cash: 25000, energy: 0, nerve: 0, green: 0, item: 'Titanium Tension Lockpick' },
      { day: 4, title: '🌿 50 GREEN Coins + 50 Energy Surge', cash: 0, energy: 50, nerve: 0, green: 50 },
      { day: 5, title: 'Tactical Wagyu Ribeye + 15 Nerve', cash: 0, energy: 0, nerve: 15, green: 0, item: 'Tactical Wagyu Ribeye' },
      { day: 6, title: '18k Gold Signet Ring + 100 Sparks', cash: 0, energy: 0, nerve: 0, sparks: 100, green: 0, item: '18k Gold Signet Ring' },
      { day: 7, title: '👑 Syndicate Grand Crate: 🌿 150 GREEN Coins + $100,000 Cash!', cash: 100000, energy: 100, nerve: 20, green: 150 },
    ];

    const currentReward = rewards[(day - 1) % 7];

    setPlayer((prev) => {
      let inv = prev.inventory;
      if (currentReward.item) {
        const existing = inv.find((i) => i.name === currentReward.item);
        if (existing) {
          inv = inv.map((i) => (i.name === currentReward.item ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
          inv = [...inv, {
            id: 'streak_loot_' + Date.now().toString(36),
            name: currentReward.item,
            description: 'Claimed from Daily Login Streak Calendar.',
            category: 'LUXURY',
            rarity: 'EPIC',
            price: 2500,
            marketValue: 2500,
            shopliftDifficulty: 80,
            icon: '🎁',
            quantity: 1,
          }];
        }
      }

      return {
        ...prev,
        money: prev.money + (currentReward.cash || 0),
        energy: Math.min(prev.maxEnergy, prev.energy + (currentReward.energy || 0)),
        nerve: Math.min(prev.maxNerve, prev.nerve + (currentReward.nerve || 0)),
        dreamPoints: (prev.dreamPoints || 0) + (currentReward.sparks || 0),
        greenTokens: (prev.greenTokens || 0) + (currentReward.green || 0),
        dailyStreak: (day % 7) + 1,
        lastStreakClaimTimestamp: Date.now(),
        canClaimDailyStreak: false,
        inventory: inv,
        hasUnsavedActions: true,
      };
    });

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'CIVILIAN',
      message: `📅 DAILY CLIPPER: Claimed Day ${day} Streak: ${currentReward.title}!`,
    });

    return {
      success: true,
      day,
      reward: currentReward.title,
      message: `Day ${day} Reward Claimed: ${currentReward.title}!`,
    };
  };

  const upgradeItemInForge = (itemId: string, useSparks = false) => {
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found in inventory.' };

    const currentLevel = item.upgradeLevel || 0;
    if (currentLevel >= 10) return { success: false, message: 'Item is already at MAX Level (+10)!' };

    const cashCost = (currentLevel + 1) * 250;
    const sparkCost = (currentLevel + 1) * 40;

    if (useSparks) {
      if ((player.dreamPoints || 0) < sparkCost) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: sparkCost,
          currentBalance: player.dreamPoints || 0,
          itemName: `Forge Infusion: ${item.name} (+${currentLevel + 1})`,
        });
        return { success: false, message: `Need ⚡ ${sparkCost} Dream Sparks for this forge upgrade.` };
      }
    } else {
      if (player.money < cashCost) {
        triggerInsufficientFunds({
          currency: 'GREEN',
          requiredAmount: cashCost,
          currentBalance: player.money,
          itemName: `Forge Upgrade: ${item.name} (+${currentLevel + 1})`,
        });
        return { success: false, message: `Need 🌿 ${cashCost.toLocaleString()} GREEN to forge this upgrade tier.` };
      }
    }

    const successRate = currentLevel < 3 ? 100 : currentLevel < 6 ? 85 : 70;
    const roll = Math.random() * 100;
    const success = roll <= successRate;

    if (!success) {
      setPlayer((prev) => ({
        ...prev,
        money: useSparks ? prev.money : prev.money - cashCost,
        dreamPoints: useSparks ? Math.max(0, (prev.dreamPoints || 0) - sparkCost) : prev.dreamPoints,
        hasUnsavedActions: true,
      }));
      SoundEngine.playHit(player.soundEnabled);
      addLog({
        type: 'SHOP',
        message: `Forge: Upgrade failed for ${item.name} (${Math.round(roll)}% roll vs ${successRate}% req).`,
      });
      return { success: false, message: `Forge attempt failed! (${successRate}% chance). Try again!` };
    }

    const nextLevel = currentLevel + 1;
    const cleanBaseName = item.name.replace(/\s\(\+\d+\)$/, '');
    const newName = `${cleanBaseName} (+${nextLevel})`;

    const bonusDamage = item.damage ? Math.round(item.damage * 1.15 * 10) / 10 : undefined;
    const bonusAccuracy = item.accuracy ? Math.min(99, Math.round(item.accuracy * 1.05 * 10) / 10) : undefined;
    const bonusDefense = item.defense ? Math.round(item.defense * 1.20 * 10) / 10 : undefined;
    const bonusValue = Math.round(item.marketValue * 1.35);

    setPlayer((prev) => ({
      ...prev,
      money: useSparks ? prev.money : prev.money - cashCost,
      dreamPoints: useSparks ? Math.max(0, (prev.dreamPoints || 0) - sparkCost) : prev.dreamPoints,
      inventory: prev.inventory.map((i) =>
        i.id === itemId
          ? {
              ...i,
              name: newName,
              upgradeLevel: nextLevel,
              damage: bonusDamage,
              accuracy: bonusAccuracy,
              defense: bonusDefense,
              marketValue: bonusValue,
              rarity: nextLevel >= 7 ? 'LEGENDARY' : nextLevel >= 4 ? 'EPIC' : nextLevel >= 2 ? 'RARE' : i.rarity,
            }
          : i
      ),
      hasUnsavedActions: true,
    }));

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'SHOP',
      message: `FORGE SUCCESS: Upgraded ${item.name} to ${newName}! (Stats & Value boosted).`,
    });

    return {
      success: true,
      newLevel: nextLevel,
      message: `Forged ${newName}! Stats & Market Value increased!`,
    };
  };

  const syncCloudItems = async () => {
    try {
      const res = await fetch('/api/cloud-items');
      const data = await res.json();
      if (!data.success || !data.items || data.items.length === 0) {
        return { success: false, newCount: 0, message: 'Cloud manifest is up to date.' };
      }

      const cloudItems: InventoryItem[] = data.items;
      let addedToBazaar = 0;

      setBazaarListings((prev) => {
        const existingNames = new Set(prev.map((l) => l.item.name));
        const newListings: BazaarListing[] = [];

        cloudItems.forEach((cItem) => {
          if (!existingNames.has(cItem.name)) {
            newListings.push({
              id: 'cloud_baz_' + cItem.id + '_' + Date.now().toString(36),
              sellerId: 'cloud_drop_admin',
              sellerName: '🌿 Cloud_Orbital_Drop',
              price: cItem.price,
              quantity: 5,
              status: 'ACTIVE',
              quorumNodes: 8,
              signature: `cloud_sig_${cItem.cloudVersion || '2.4.0'}`,
              receiptId: `cloud_rcpt_${cItem.id}`,
              timestamp: Date.now(),
              item: cItem,
            });
            addedToBazaar += 1;
          }
        });

        return [...newListings, ...prev];
      });

      SoundEngine.playLoot(player.soundEnabled);
      addLog({
        type: 'SHOP',
        message: `Cloud Sync: Downloaded ${cloudItems.length} special items from static cloud manifest! Added ${addedToBazaar} new drops to Bazaar.`,
      });

      return {
        success: true,
        newCount: addedToBazaar,
        message: `Synced ${cloudItems.length} items from Cloud! (+${addedToBazaar} new drops in Bazaar)`,
      };
    } catch (e: any) {
      return { success: false, newCount: 0, message: 'Failed to connect to cloud manifest.' };
    }
  };

  // Auto-sync whenever user comes online or loads app
  useEffect(() => {
    if (!mounted) return;
    const timeout = setTimeout(() => {
      syncCloudItems();
    }, 1200);

    const handleOnline = () => {
      syncCloudItems();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
    };
  }, [mounted]);

  const [comboCount, setComboCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const tapDreamEnergy = () => {
    const stamina = player.tapStamina ?? 500;
    if (stamina <= 0) {
      return {
        sparksEarned: 0,
        comboStreak: 0,
        totalSparks: player.dreamPoints || 0,
      };
    }

    const now = Date.now();
    const isCombo = now - lastTapTime < 2200;
    const newCombo = isCombo ? Math.min(30, comboCount + 1) : 1;
    setLastTapTime(now);
    setComboCount(newCombo);

    // Tree & Plant Evolution Stage Multipliers
    const plantMultipliers: Record<string, number> = {
      tree_sprout: 1.0,
      tree_mint: 2.0,
      tree_bonsai: 4.0,
      tree_bamboo: 8.0,
      tree_oak: 16.0,
      tree_cyberpalm: 32.0,
      tree_redwood: 75.0,
      tree_yggdrasil: 200.0,
      // Legacy fallback
      skin_cyan_neon: 1.0,
      skin_molten_gold: 1.25,
      skin_toxic_cyber: 1.5,
      skin_void_dark: 2.0,
    };
    const plantBonus = plantMultipliers[player.activeTapperSkinId || 'tree_sprout'] || 1.0;

    const comboMultiplier = 1 + Math.floor(newCombo / 5);
    const sparksEarned = Math.round(1 * comboMultiplier * plantBonus);
    const bonusEnergy = newCombo % 10 === 0 ? 1 : 0;

    setPlayer((prev) => ({
      ...prev,
      dreamPoints: (prev.dreamPoints || 0) + sparksEarned,
      totalTaps: (prev.totalTaps || 0) + 1,
      tapStamina: Math.max(0, (prev.tapStamina ?? 500) - 1),
      energy: Math.min(prev.maxEnergy, prev.energy + bonusEnergy),
      hasUnsavedActions: true,
    }));

    SoundEngine.playTick(player.soundEnabled);

    return {
      sparksEarned,
      comboStreak: newCombo,
      totalSparks: (player.dreamPoints || 0) + sparksEarned,
    };
  };

  const upgradeDreamCard = (cardId: string) => {
    const cards = player.dreamCards || {};
    const currentLvl = cards[cardId] || 0;
    const baseCosts: Record<string, number> = {
      card_photosynthesis: 25,
      card_mycelium: 80,
      card_spore_chamber: 250,
      card_greenhouse: 750,
      card_hydroponic_array: 2200,
      card_bioluminescent_algae: 6000,
      card_sacred_grove: 15000,
      card_genetic_synthesizer: 40000,
      card_yggdrasil_uplink: 100000,
      card_quantum_chloroplast: 250000,
    };
    const base = baseCosts[cardId] || 50;
    const cost = Math.round(base * Math.pow(1.35, currentLvl));

    if ((player.dreamPoints || 0) < cost) {
      const cardNames: Record<string, string> = {
        card_photosynthesis: 'Photosynthesis Core (Spore)',
        card_mycelium: 'Mycelium Network (Spore)',
        card_spore_chamber: 'Spore Chamber (Spore)',
        card_greenhouse: 'Greenhouse Flora Dome',
        card_hydroponic_array: 'Hydroponic Flora Array',
        card_bioluminescent_algae: 'Bioluminescent Algae',
        card_sacred_grove: 'Sacred Banyan Grove',
        card_genetic_synthesizer: 'Genetic Botanical Synthesizer',
        card_yggdrasil_uplink: 'Yggdrasil World Tree Uplink',
        card_quantum_chloroplast: 'Quantum Chloroplast Core',
      };
      triggerInsufficientFunds({
        currency: 'SPARKS',
        requiredAmount: cost,
        currentBalance: player.dreamPoints || 0,
        itemName: `Botanical Upgrade: ${cardNames[cardId] || cardId.replace('card_', '').replace('_', ' ').toUpperCase()}`,
      });
      return { success: false, message: `Need ${cost} Dream Sparks to upgrade this card.` };
    }

    const nextLvl = currentLvl + 1;
    setPlayer((prev) => ({
      ...prev,
      dreamPoints: prev.dreamPoints - cost,
      dreamCards: {
        ...(prev.dreamCards || {}),
        [cardId]: nextLvl,
      },
      hasUnsavedActions: true,
    }));

    SoundEngine.playLoot(player.soundEnabled);
    addLog({
      type: 'CIVILIAN',
      message: `Botanical Cards: Upgraded ${cardId.replace('card_', '').toUpperCase()} to Level ${nextLvl}!`,
    });

    return {
      success: true,
      newLevel: nextLvl,
      message: `Card Upgraded to Level ${nextLvl}! Passive auto-sparks production increased.`,
    };
  };

  const unlockTapperSkin = (skinId: string) => {
    const unlocked = player.unlockedTapperSkins || ['tree_sprout', 'skin_cyan_neon'];
    if (unlocked.includes(skinId)) return { success: false, message: 'Plant stage already evolved.' };

    const plantCosts: Record<string, { sparks?: number; green?: number }> = {
      tree_mint: { sparks: 150 },
      tree_bonsai: { sparks: 400 },
      tree_bamboo: { sparks: 1000 },
      tree_oak: { sparks: 2500 },
      tree_cyberpalm: { sparks: 6000 },
      tree_redwood: { sparks: 15000 },
      tree_yggdrasil: { sparks: 40000, green: 50 },
      // Legacy support
      skin_molten_gold: { sparks: 250 },
      skin_toxic_cyber: { sparks: 600 },
      skin_void_dark: { green: 25 },
    };

    const req = plantCosts[skinId];
    if (!req) return { success: false, message: 'Plant species not found.' };

    if (req.sparks && (player.dreamPoints || 0) < req.sparks) {
      return { success: false, message: `Need ${req.sparks} Dream Sparks to evolve this plant stage.` };
    }
    if (req.green && (player.money || 0) < req.green) {
      return { success: false, message: `Need 🌿 ${req.green} GREEN Coins to evolve this tree.` };
    }

    setPlayer((prev) => ({
      ...prev,
      dreamPoints: req.sparks ? prev.dreamPoints - req.sparks : prev.dreamPoints,
      money: req.green ? prev.money - req.green : prev.money,
      unlockedTapperSkins: [...(prev.unlockedTapperSkins || ['tree_sprout']), skinId],
      activeTapperSkinId: skinId,
      hasUnsavedActions: true,
    }));

    SoundEngine.playVictory(player.soundEnabled);
    addLog({ type: 'SHOP', message: `Plant Evolution: Evolved and equipped plant species [${skinId}]!` });
    return { success: true, message: `Plant species evolved and equipped!` };
  };

  const equipTapperSkin = (skinId: string) => {
    const unlocked = player.unlockedTapperSkins || ['tree_sprout', 'skin_cyan_neon'];
    if (!unlocked.includes(skinId)) return { success: false, message: 'Plant stage not unlocked yet.' };

    setPlayer((prev) => ({
      ...prev,
      activeTapperSkinId: skinId,
      hasUnsavedActions: true,
    }));
    return { success: true, message: `Equipped ${skinId} plant species!` };
  };

  const installBodyAugmentation = (augId: string) => {
    const augs = player.bodyAugmentations || [];
    if (augs.includes(augId)) return { success: false, message: 'Botanical augmentation already installed.' };

    const augDefs: Record<string, { title: string; sparks: number; green: number; statBonus: Partial<PlayerState> }> = {
      aug_bark_armor: {
        title: 'Ironwood Bark Armor',
        sparks: 200,
        green: 20,
        statBonus: {
          battleStats: {
            ...player.battleStats,
            defense: player.battleStats.defense + 30,
          },
        },
      },
      aug_chlorophyll_lungs: {
        title: 'Chlorophyll Bio-Lungs',
        sparks: 350,
        green: 25,
        statBonus: {
          maxEnergy: player.maxEnergy + 20,
        },
      },
      aug_neural_vine: {
        title: 'Neural Bio-Vine Synapses',
        sparks: 400,
        green: 30,
        statBonus: {
          maxNerve: player.maxNerve + 5,
        },
      },
      aug_ironwood_muscles: {
        title: 'Ironwood Lignin Muscle Weave',
        sparks: 250,
        green: 20,
        statBonus: {
          battleStats: {
            ...player.battleStats,
            strength: player.battleStats.strength + 30,
          },
        },
      },
      aug_tap_chloroplast: {
        title: 'Enduring Tap Stamina Chloroplast',
        sparks: 500,
        green: 35,
        statBonus: {
          maxTapStamina: (player.maxTapStamina || 500) + 250,
          tapStamina: (player.tapStamina || 500) + 250,
        },
      },
      // Legacy support
      aug_subdermal_armor: {
        title: 'Subdermal Titanium Armor Plating',
        sparks: 150,
        green: 15,
        statBonus: {
          battleStats: {
            ...player.battleStats,
            defense: player.battleStats.defense + 25,
          },
        },
      },
      aug_bio_pump: {
        title: 'Adrenaline Bio-Pump Implant',
        sparks: 250,
        green: 20,
        statBonus: {
          maxEnergy: player.maxEnergy + 30,
        },
      },
      aug_neuro_coprocessor: {
        title: 'Neural Co-Processor Cyber-Spine',
        sparks: 300,
        green: 25,
        statBonus: {
          maxNerve: player.maxNerve + 10,
        },
      },
      aug_muscle_weave: {
        title: 'Synthetic Nano-Fiber Muscle Weave',
        sparks: 200,
        green: 20,
        statBonus: {
          battleStats: {
            ...player.battleStats,
            strength: player.battleStats.strength + 25,
          },
        },
      },
    };

    const def = augDefs[augId];
    if (!def) return { success: false, message: 'Unknown botanical augmentation.' };

    if ((player.dreamPoints || 0) < def.sparks) {
      return { success: false, message: `Need ${def.sparks} Dream Sparks for this bio-augmentation.` };
    }
    if ((player.money || 0) < def.green) {
      return { success: false, message: `Need 🌿 ${def.green} GREEN Coins for this bio-augmentation.` };
    }

    setPlayer((prev) => ({
      ...prev,
      dreamPoints: prev.dreamPoints - def.sparks,
      money: prev.money - def.green,
      bodyAugmentations: [...(prev.bodyAugmentations || []), augId],
      ...def.statBonus,
      hasUnsavedActions: true,
    }));

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'CIVILIAN',
      message: `BIO-AUGMENT: Cultivated and grafted ${def.title}! Permanent body stats augmented!`,
    });

    return {
      success: true,
      message: `Installed ${def.title}! Permanent stat enhancements active!`,
    };
  };

  const exchangeDreamSparks = (exchangeId: string) => {
    const sparks = player.dreamPoints || 0;

    if (exchangeId === 'ENERGY_STEM' || exchangeId === 'ENERGY_15') {
      const cost = exchangeId === 'ENERGY_15' ? 15 : 25;
      const energyAmount = exchangeId === 'ENERGY_15' ? 15 : 10;
      if (sparks < cost) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: cost,
          currentBalance: sparks,
          itemName: 'Botanical Energy Stem',
        });
        return { success: false, message: `Need ${cost} Dream Sparks.` };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - cost,
        energy: Math.min(prev.maxEnergy, prev.energy + energyAmount),
        hasUnsavedActions: true,
      }));
      SoundEngine.playLoot(player.soundEnabled);
      addLog({ type: 'CIVILIAN', message: `Botanical Exchange: Energy Stem restored +${energyAmount} Energy!` });
      return { success: true, message: `+${energyAmount} Energy Restored!` };
    }

    if (exchangeId === 'NERVE_NECTAR' || exchangeId === 'NERVE_8') {
      const cost = 30;
      const nerveAmount = exchangeId === 'NERVE_8' ? 8 : 5;
      if (sparks < cost) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: cost,
          currentBalance: sparks,
          itemName: 'Nerve Nectar Extract',
        });
        return { success: false, message: `Need ${cost} Dream Sparks.` };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - cost,
        nerve: Math.min(prev.maxNerve, prev.nerve + nerveAmount),
        hasUnsavedActions: true,
      }));
      SoundEngine.playLoot(player.soundEnabled);
      addLog({ type: 'CIVILIAN', message: `Botanical Exchange: Nerve Nectar restored +${nerveAmount} Nerve!` });
      return { success: true, message: `+${nerveAmount} Nerve Restored!` };
    }

    if (exchangeId === 'HAPPY_FLORA') {
      if (sparks < 20) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 20,
          currentBalance: sparks,
          itemName: 'Happy Botanical Spores',
        });
        return { success: false, message: 'Need 20 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 20,
        happy: Math.min(prev.maxHappy, prev.happy + 25),
        hasUnsavedActions: true,
      }));
      SoundEngine.playLoot(player.soundEnabled);
      return { success: true, message: '+25 Happy Restored!' };
    }

    if (exchangeId === 'LIFE_SAP') {
      if (sparks < 35) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 35,
          currentBalance: sparks,
          itemName: 'World Tree Life Sap',
        });
        return { success: false, message: 'Need 35 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 35,
        life: Math.min(prev.maxLife, prev.life + 50),
        hasUnsavedActions: true,
      }));
      SoundEngine.playLoot(player.soundEnabled);
      return { success: true, message: '+50 Life Restored!' };
    }

    if (exchangeId === 'FOOD_SOURDOUGH' || exchangeId === 'DREAM_FEAST') {
      const cost = exchangeId === 'DREAM_FEAST' ? 25 : 40;
      if (sparks < cost) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: cost,
          currentBalance: sparks,
          itemName: 'Botanical Sprout Feast',
        });
        return { success: false, message: `Need ${cost} Dream Sparks.` };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - cost,
        food: Math.min(prev.maxFood || 100, (prev.food || 70) + 35),
        happy: Math.min(prev.maxHappy, prev.happy + 15),
        hasUnsavedActions: true,
      }));
      SoundEngine.playEat(player.soundEnabled);
      addLog({ type: 'FOOD', message: 'Dream Market: Organic Sprout Bread filled +35 Satiety!' });
      return { success: true, message: '+35 Satiety & +15 Happy Restored!' };
    }

    if (exchangeId === 'FOOD_SUPERFOOD') {
      if (sparks < 75) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 75,
          currentBalance: sparks,
          itemName: 'Chlorophyll Superfood Rations',
        });
        return { success: false, message: 'Need 75 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 75,
        food: Math.min(prev.maxFood || 100, (prev.food || 70) + 60),
        life: Math.min(prev.maxLife, prev.life + 20),
        happy: Math.min(prev.maxHappy, prev.happy + 25),
        hasUnsavedActions: true,
      }));
      SoundEngine.playEat(player.soundEnabled);
      return { success: true, message: '+60 Satiety, +20 Life & +25 Happy Restored!' };
    }

    if (exchangeId === 'FOOD_AMBROSIA') {
      if (sparks < 150) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 150,
          currentBalance: sparks,
          itemName: 'Ambrosia Nectar Bowl',
        });
        return { success: false, message: 'Need 150 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 150,
        food: prev.maxFood || 100,
        energy: Math.min(prev.maxEnergy, prev.energy + 15),
        happy: prev.maxHappy,
        life: Math.min(prev.maxLife, prev.life + 40),
        hasUnsavedActions: true,
      }));
      SoundEngine.playEat(player.soundEnabled);
      return { success: true, message: 'Full Satiety, +15 Energy & 100% Happy Restored!' };
    }

    if (exchangeId === 'GREEN_50') {
      if (sparks < 500) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 500,
          currentBalance: sparks,
          itemName: 'Mint 🌿 50 GREEN Coins',
        });
        return { success: false, message: 'Need 500 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 500,
        money: prev.money + 50,
        hasUnsavedActions: true,
      }));
      SoundEngine.playVictory(player.soundEnabled);
      addLog({ type: 'CIVILIAN', message: 'Dream Exchange: Minted 🌿 50 GREEN Coins from 500 Sparks!' });
      return { success: true, message: 'Minted 🌿 50 GREEN Coins!' };
    }

    if (exchangeId === 'GREEN_250') {
      if (sparks < 2200) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 2200,
          currentBalance: sparks,
          itemName: 'Mint 🌿 250 GREEN Coins',
        });
        return { success: false, message: 'Need 2,200 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 2200,
        money: prev.money + 250,
        hasUnsavedActions: true,
      }));
      SoundEngine.playVictory(player.soundEnabled);
      addLog({ type: 'CIVILIAN', message: 'Dream Exchange: Minted 🌿 250 GREEN Coins from 2,200 Sparks!' });
      return { success: true, message: 'Minted 🌿 250 GREEN Coins!' };
    }

    if (exchangeId === 'GREEN_1000') {
      if (sparks < 8000) {
        triggerInsufficientFunds({
          currency: 'SPARKS',
          requiredAmount: 8000,
          currentBalance: sparks,
          itemName: 'Mint 🌿 1,000 GREEN Coins',
        });
        return { success: false, message: 'Need 8,000 Dream Sparks.' };
      }
      setPlayer((prev) => ({
        ...prev,
        dreamPoints: prev.dreamPoints - 8000,
        money: prev.money + 1000,
        hasUnsavedActions: true,
      }));
      SoundEngine.playVictory(player.soundEnabled);
      addLog({ type: 'CIVILIAN', message: 'Dream Exchange: Minted 🌿 1,000 GREEN Coins from 8,000 Sparks!' });
      return { success: true, message: 'Minted 🌿 1,000 GREEN Coins!' };
    }

    return { success: false, message: 'Unknown botanical exchange item.' };
  };

  const syncP2PMesh = () => {
    // 1. Reload latest mesh from shared storage
    const currentMesh = loadP2PBazaarMesh(INITIAL_BAZAAR_LISTINGS);
    setBazaarListings(currentMesh);

    // 2. Reconcile purchase receipts: check if any items listed by player were bought!
    const allReceipts = loadP2PReceipts();
    let newlySettled = 0;
    const settledSet = new Set(player.settledReceiptIds || []);

    const updatedReceipts = allReceipts.map((r) => {
      if (r.sellerId === player.id && !settledSet.has(r.receiptId)) {
        newlySettled += r.price;
        settledSet.add(r.receiptId);
        return { ...r, collected: true };
      }
      return r;
    });

    if (newlySettled > 0) {
      saveP2PReceipts(updatedReceipts);
      setPlayer((prev) => ({
        ...prev,
        bazaarTillCash: (prev.bazaarTillCash || 0) + newlySettled,
        settledReceiptIds: Array.from(settledSet),
        hasUnsavedActions: true,
      }));
      SoundEngine.playCash(player.soundEnabled);
      addLog({
        type: 'SHOP',
        message: `P2P Mesh Sync: Synced with decentralized peer mesh. Credited 🌿 ${newlySettled.toLocaleString()} GREEN from peer bazaar sales into your Till!`,
      });
    }

    return {
      syncedPeers: 8,
      updatedListings: currentMesh.length,
      newlySettledTill: newlySettled,
    };
  };

  const buyBazaarListing = (listingId: string) => {
    const listing = bazaarListings.find((l) => l.id === listingId);
    if (!listing || listing.quantity <= 0 || listing.status === 'FINALIZED') {
      return { success: false, message: 'Item listing sold out or closed.' };
    }
    if (listing.sellerId === player.id) {
      return { success: false, message: 'You cannot buy your own item! Manage it under My Bazaar.' };
    }
    if (player.money < listing.price) {
      triggerInsufficientFunds({
        currency: 'GREEN',
        requiredAmount: listing.price,
        currentBalance: player.money,
        itemName: `P2P Bazaar: ${listing.item.name} (${listing.sellerName})`,
      });
      return { success: false, message: `Need 🌿 ${listing.price.toLocaleString()} GREEN to purchase.` };
    }

    const receiptId = `rcpt_p2p_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const cryptographicSig = `p2p_mesh_quorum_signed_8of8_${Math.random().toString(36).substring(2, 10)}`;

    // 1. Deliver item to buyer and deduct funds
    setPlayer((prev) => {
      const existing = prev.inventory.find((i) => i.name === listing.item.name);
      const newInv = existing
        ? prev.inventory.map((i) => (i.name === listing.item.name ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.inventory, { ...listing.item, quantity: 1 }];

      return {
        ...prev,
        money: prev.money - listing.price,
        inventory: newInv,
        hasUnsavedActions: true,
      };
    });

    // 2. Create signed purchase receipt for peer reconciliation
    const receipt: P2PPurchaseReceipt = {
      receiptId,
      listingId,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      buyerId: player.id,
      buyerName: player.name,
      itemName: listing.item.name,
      price: listing.price,
      quantity: 1,
      timestamp: Date.now(),
      signature: cryptographicSig,
      collected: false,
    };
    const receipts = loadP2PReceipts();
    saveP2PReceipts([receipt, ...receipts]);

    // 3. Decrement quantity in decentralized mesh
    const updatedMesh = bazaarListings.map((l) =>
      l.id === listingId
        ? {
            ...l,
            quantity: l.quantity - 1,
            status: (l.quantity - 1 <= 0 ? 'FINALIZED' : 'ACTIVE') as 'ACTIVE' | 'FINALIZED',
            quorumNodes: 8,
            signature: cryptographicSig,
            receiptId,
          }
        : l
    );
    setBazaarListings(updatedMesh);
    saveP2PBazaarMesh(updatedMesh);

    // 4. Broadcast across live Gossip Bus so all peer nodes update instantly
    broadcastP2PBazaarEvent({
      type: 'BAZAAR_ITEM_BOUGHT',
      receipt,
      listingId,
    });

    SoundEngine.playCash(player.soundEnabled);
    addLog({
      type: 'SHOP',
      message: `P2P Bazaar: Bought ${listing.item.name} for 🌿 ${listing.price.toLocaleString()} GREEN from ${listing.sellerName} [Consensus: 8/8 Peer Nodes Confirmed].`,
    });
    return {
      success: true,
      message: `Purchased ${listing.item.name} from ${listing.sellerName} for 🌿 ${listing.price.toLocaleString()} GREEN! (P2P Mesh Verified)`,
    };
  };

  const createBazaarListing = (itemId: string, price: number, quantity: number) => {
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || item.quantity < quantity || quantity <= 0) return { success: false, message: 'Invalid item quantity.' };
    if (price <= 0) return { success: false, message: 'Set a valid asking price.' };

    const receiptId = `rcpt_p2p_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const newListing: BazaarListing = {
      id: 'pl_baz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      sellerId: player.id,
      sellerName: player.name,
      item: { ...item, quantity },
      price,
      quantity,
      isPlayerListing: false,
      status: 'ACTIVE',
      quorumNodes: 8,
      signature: `p2p_sig_${player.xid || player.id}_${Date.now()}`,
      receiptId,
      timestamp: Date.now(),
    };

    setPlayer((prev) => ({
      ...prev,
      inventory: prev.inventory
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i))
        .filter((i) => i.quantity > 0),
      hasUnsavedActions: true,
    }));

    setBazaarListings((prev) => {
      const updated = [newListing, ...prev];
      saveP2PBazaarMesh(updated);
      return updated;
    });

    broadcastP2PBazaarEvent({
      type: 'BAZAAR_LISTING_CREATED',
      listing: newListing,
    });

    SoundEngine.playCash(player.soundEnabled);
    addLog({
      type: 'SHOP',
      message: `Bazaar: Listed ${quantity}x ${item.name} in your personal bazaar at 🌿 ${price.toLocaleString()} GREEN each [P2P Signed & Replicated to Mesh].`,
    });
    return { success: true, message: `Listed ${item.name} on the P2P Mesh Bazaar!` };
  };

  const removeBazaarListing = (listingId: string) => {
    const listing = bazaarListings.find((l) => l.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };
    if (listing.sellerId !== player.id) return { success: false, message: 'You can only remove your own listings.' };

    setPlayer((prev) => {
      const existing = prev.inventory.find((i) => i.name === listing.item.name);
      const newInv = existing
        ? prev.inventory.map((i) => (i.name === listing.item.name ? { ...i, quantity: i.quantity + listing.quantity } : i))
        : [...prev.inventory, { ...listing.item, quantity: listing.quantity }];

      return { ...prev, inventory: newInv, hasUnsavedActions: true };
    });

    setBazaarListings((prev) => {
      const updated = prev.filter((l) => l.id !== listingId);
      saveP2PBazaarMesh(updated);
      return updated;
    });

    broadcastP2PBazaarEvent({
      type: 'BAZAAR_LISTING_REMOVED',
      listingId,
      sellerId: player.id,
    });

    return { success: true, message: `Removed ${listing.item.name} from your bazaar and returned to backpack.` };
  };

  const collectBazaarTill = () => {
    if (player.bazaarTillCash <= 0) return { success: false, message: 'No customer cash in till.', amount: 0 };
    const amt = player.bazaarTillCash;
    setPlayer((prev) => ({
      ...prev,
      money: prev.money + amt,
      bazaarTillCash: 0,
      hasUnsavedActions: true,
    }));
    SoundEngine.playCash(player.soundEnabled);
    addLog({ type: 'SHOP', message: `Collected +🌿 ${amt.toLocaleString()} GREEN from your Personal Bazaar till!` });
    return { success: true, message: `Collected +🌿 ${amt.toLocaleString()} GREEN from bazaar sales!`, amount: amt };
  };

  const executeAttackRound = (
    targetId: string,
    playerWeapon: 'FISTS' | 'KNIFE' | 'PISTOL' | 'SMG'
  ) => {
    if (player.isSleeping) return { playerHit: false, playerDmg: 0, targetHit: false, targetDmg: 0, targetDefeated: false, playerDefeated: false, isCrit: false, message: 'You are sleeping!' };
    if (player.energy < 5) return { playerHit: false, playerDmg: 0, targetHit: false, targetDmg: 0, targetDefeated: false, playerDefeated: false, isCrit: false, message: 'Need 5 Energy to fight!' };

    const target = combatTargets.find((t) => t.id === targetId);
    if (!target) return { playerHit: false, playerDmg: 0, targetHit: false, targetDmg: 0, targetDefeated: false, playerDefeated: false, isCrit: false, message: 'Target not found.' };

    const weaponDamages = {
      FISTS: 22,
      KNIFE: 42,
      PISTOL: 64,
      SMG: 82,
    };

    const baseDmg = weaponDamages[playerWeapon] || 30;
    const isCrit = Math.random() < 0.22;
    const critMult = isCrit ? 2.2 : 1.0;
    const playerDmg = Math.round((baseDmg + player.battleStats.strength * 0.45 - target.battleStats.defense * 0.2) * critMult);
    const finalPlayerDmg = Math.max(10, playerDmg);

    const targetBaseDmg = 20 + target.battleStats.strength * 0.35 - player.battleStats.defense * 0.25;
    const finalTargetDmg = Math.max(6, Math.round(targetBaseDmg));

    const newTargetLife = Math.max(0, target.life - finalPlayerDmg);
    const newPlayerLife = Math.max(0, player.life - finalTargetDmg);

    if (isCrit) {
      SoundEngine.playCrit(player.soundEnabled);
    } else {
      SoundEngine.playHit(player.soundEnabled);
    }

    setCombatTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, life: newTargetLife } : t))
    );

    setPlayer((prev) => ({
      ...prev,
      energy: prev.energy - 5,
      life: newPlayerLife,
      hasUnsavedActions: true,
    }));

    const targetDefeated = newTargetLife <= 0;
    const playerDefeated = newPlayerLife <= 0;

    let msg = `You hit ${target.name} for ${finalPlayerDmg} damage${isCrit ? ' [CRITICAL HIT!]' : ''}! ${target.name} hit back for ${finalTargetDmg} damage.`;
    if (targetDefeated) {
      SoundEngine.playVictory(player.soundEnabled);
      msg = `💥 TARGET DOWN! You defeated ${target.name}! Choose your victory action: Mug, Hospitalize, or Leave.`;
    } else if (playerDefeated) {
      msg = `💀 OVERWHELMED: ${target.name} critically injured you! Transported to Apex Medical Center.`;
      setPlayer((prev) => ({ ...prev, hospitalTimeRemainingSeconds: 180 }));
    }

    return {
      playerHit: true,
      playerDmg: finalPlayerDmg,
      targetHit: true,
      targetDmg: finalTargetDmg,
      targetDefeated,
      playerDefeated,
      isCrit,
      message: msg,
    };
  };

  const finishCombatAction = (
    targetId: string,
    action: 'MUG' | 'HOSPITALIZE' | 'LEAVE'
  ) => {
    const target = combatTargets.find((t) => t.id === targetId);
    if (!target) return { success: false, message: 'Target not found.' };

    if (action === 'MUG') {
      const stolen = Math.round(target.pocketCash * 0.75);
      setPlayer((prev) => ({
        ...prev,
        money: prev.money + stolen,
        xp: prev.xp + 45,
        chain: prev.chain + 1,
        hasUnsavedActions: true,
      }));
      SoundEngine.playCash(player.soundEnabled);
      addLog({ type: 'MUG', message: `MUGGED: Snatched 🌿 ${stolen.toLocaleString()} GREEN from ${target.name}!` });
      setCombatTargets((prev) => prev.map((t) => (t.id === targetId ? { ...t, life: t.maxLife } : t)));
      return { success: true, message: `Mugged +🌿 ${stolen.toLocaleString()} GREEN!`, cashStolen: stolen };
    } else if (action === 'HOSPITALIZE') {
      setPlayer((prev) => ({
        ...prev,
        xp: prev.xp + 65,
        chain: prev.chain + 2,
        faction: { ...prev.faction, respect: prev.faction.respect + 25 },
        hasUnsavedActions: true,
      }));
      SoundEngine.playVictory(player.soundEnabled);
      addLog({ type: 'MUG', message: `HOSPITALIZED: Put ${target.name} in Trauma Ward for 3 hours! +25 Faction Respect.` });
      setCombatTargets((prev) => prev.map((t) => (t.id === targetId ? { ...t, life: t.maxLife } : t)));
      return { success: true, message: `Hospitalized ${target.name}! +25 Respect, +65 XP.` };
    } else {
      setPlayer((prev) => ({
        ...prev,
        xp: prev.xp + 100,
        chain: prev.chain + 1,
        hasUnsavedActions: true,
      }));
      addLog({ type: 'MUG', message: `Left ${target.name} unconscious on the pavement. +100 Max XP awarded!` });
      setCombatTargets((prev) => prev.map((t) => (t.id === targetId ? { ...t, life: t.maxLife } : t)));
      return { success: true, message: `Left victim on street. +100 XP gained!`, xpGained: 100 };
    }
  };

  // VIRAL REFERRALS & SYNDICATE COMMISSIONS
  const claimReferralMilestone = (recruitsRequired: number) => {
    const refs = player.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;
    if (refs.totalRecruits < recruitsRequired) {
      return { success: false, message: `Need ${recruitsRequired} recruits to claim this milestone reward.` };
    }
    if ((refs.claimedMilestones || []).includes(recruitsRequired)) {
      return { success: false, message: 'Milestone already claimed.' };
    }

    const milestoneTable: Record<number, { green: number; sparks: number; statBonus?: Partial<PlayerState> }> = {
      1: { green: 100, sparks: 50 },
      3: { green: 350, sparks: 200 },
      5: { green: 750, sparks: 500, statBonus: { unallocatedStatPoints: player.unallocatedStatPoints + 1 } },
      10: { green: 2000, sparks: 1500, statBonus: { maxEnergy: player.maxEnergy + 5 } },
      25: { green: 6000, sparks: 5000, statBonus: { maxNerve: player.maxNerve + 5 } },
      50: { green: 15000, sparks: 15000, statBonus: { maxHappy: player.maxHappy + 50 } },
      100: {
        green: 35000,
        sparks: 30000,
        statBonus: {
          maxEnergy: player.maxEnergy + 10,
          maxNerve: player.maxNerve + 10,
          maxHappy: player.maxHappy + 100,
          unallocatedStatPoints: player.unallocatedStatPoints + 3,
        },
      },
    };

    const reward = milestoneTable[recruitsRequired];
    if (!reward) return { success: false, message: 'Invalid milestone.' };

    setPlayer((prev) => {
      const currentRefs = prev.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;
      return {
        ...prev,
        money: prev.money + reward.green,
        dreamPoints: (prev.dreamPoints || 0) + reward.sparks,
        referrals: {
          ...currentRefs,
          claimedMilestones: [...(currentRefs.claimedMilestones || []), recruitsRequired],
        },
        ...(reward.statBonus || {}),
        hasUnsavedActions: true,
      };
    });

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'CIVILIAN',
      message: `REFERRAL MILESTONE: Claimed ${recruitsRequired}-Recruit reward! +🌿 ${reward.green.toLocaleString()} GREEN & +${reward.sparks} Sparks!`,
    });

    return {
      success: true,
      message: `Claimed +🌿 ${reward.green.toLocaleString()} GREEN and +${reward.sparks} Dream Sparks!`,
    };
  };

  const collectReferralCommission = () => {
    const refs = player.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;
    const amount = refs.unclaimedCommissionGreen || 0;
    if (amount <= 0) {
      return { success: false, message: 'No uncollected referral commissions in till.', amount: 0 };
    }

    setPlayer((prev) => {
      const currentRefs = prev.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;
      return {
        ...prev,
        money: prev.money + amount,
        referrals: {
          ...currentRefs,
          unclaimedCommissionGreen: 0,
        },
        hasUnsavedActions: true,
      };
    });

    SoundEngine.playCash(player.soundEnabled);
    addLog({
      type: 'SHOP',
      message: `Collected +🌿 ${amount.toLocaleString()} GREEN from Syndicate Referral Till!`,
    });

    return {
      success: true,
      message: `Collected +🌿 ${amount.toLocaleString()} GREEN royalty!`,
      amount,
    };
  };

  const redeemInviteCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const refs = player.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;

    if (!trimmed) return { success: false, message: 'Please enter an invite code.' };
    if (trimmed === refs.referralCode) return { success: false, message: 'You cannot redeem your own referral code.' };
    if (refs.hasClaimedWelcomeBonus) return { success: false, message: 'You have already claimed a starter invite bonus.' };

    // Starter Welcome Gift: +50 GREEN, +10 Energy, +1 Deli Bread
    const welcomeBread: InventoryItem = {
      id: 'inv_sub_referral_' + Date.now().toString(36),
      name: 'Syndicate Welcome Baguette',
      description: 'Handcrafted welcome meal: +30 Food, +10 Energy, +10 Happy.',
      category: 'FOOD',
      rarity: 'COMMON',
      price: 25,
      marketValue: 25,
      shopliftDifficulty: 10,
      foodRestore: 30,
      energyRestore: 10,
      happyRestore: 10,
      icon: '🥪',
      quantity: 1,
    };

    setPlayer((prev) => {
      const currentRefs = prev.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;
      return {
        ...prev,
        money: prev.money + 50,
        energy: Math.min(prev.maxEnergy, prev.energy + 10),
        inventory: [...prev.inventory, welcomeBread],
        referrals: {
          ...currentRefs,
          referredBy: trimmed,
          hasClaimedWelcomeBonus: true,
        },
        hasUnsavedActions: true,
      };
    });

    SoundEngine.playVictory(player.soundEnabled);
    addLog({
      type: 'CIVILIAN',
      message: `REDEEM CODE: Activated invite [${trimmed}]! Received +🌿 50 GREEN & Welcome Meal!`,
    });

    return {
      success: true,
      message: `Starter pack unlocked! +🌿 50 GREEN, +10 Energy & Fresh Baguette added to inventory.`,
    };
  };

  const simulateNewRecruit = () => {
    const mockNames = [
      'CipherBlade_99',
      'NeonPhantom_X',
      'Valkyrie_Rose',
      'GhostRunner_404',
      'QuantumMonk',
      'ApexDrifter_07',
      'ShadowProtocol',
      'EmeraldRonin',
      'ZeroDay_Merc',
      'Solaris_Titan',
    ];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + '_' + Math.floor(Math.random() * 90 + 10);
    const commissionBonus = Math.floor(Math.random() * 25) + 15; // 15 - 40 GREEN

    const newRecruit: ReferredUser = {
      id: 'rec_' + Date.now().toString(36),
      name: randomName,
      joinedAt: Date.now(),
      level: Math.floor(Math.random() * 4) + 1,
      totalGeneratedGreen: commissionBonus,
      lastActive: 'Just now (Tapping Lucid Dream)',
    };

    setPlayer((prev) => {
      const currentRefs = prev.referrals || DEFAULT_METROPOLIS_PLAYER.referrals;
      return {
        ...prev,
        referrals: {
          ...currentRefs,
          totalRecruits: currentRefs.totalRecruits + 1,
          unclaimedCommissionGreen: currentRefs.unclaimedCommissionGreen + commissionBonus,
          lifetimeCommissionGreen: currentRefs.lifetimeCommissionGreen + commissionBonus,
          recruits: [newRecruit, ...currentRefs.recruits],
        },
        hasUnsavedActions: true,
      };
    });

    SoundEngine.playCash(player.soundEnabled);
    addLog({
      type: 'CIVILIAN',
      message: `NEW RECRUIT: Citizen "${randomName}" joined your syndicate! +🌿 ${commissionBonus} GREEN commission deposited into till!`,
    });

    return {
      success: true,
      recruitName: randomName,
      message: `New syndicate recruit joined: ${randomName}! Generated +🌿 ${commissionBonus} GREEN royalty.`,
    };
  };

  return (
    <GameContext.Provider
      value={{
        player,
        isSaving,
        saveSuccess,
        logs,
        cashCompliance,
        saveGame,
        toggleSound,
        spinDailyWheel,
        claimDailyStreak,
        upgradeItemInForge,
        syncCloudItems,
        tapDreamEnergy,
        upgradeDreamCard,
        equipTapperSkin,
        unlockTapperSkin,
        installBodyAugmentation,
        exchangeDreamSparks,
        syncP2PMesh,
        bazaarListings,
        buyBazaarListing,
        createBazaarListing,
        removeBazaarListing,
        collectBazaarTill,
        combatTargets,
        executeAttackRound,
        finishCombatAction,
        togglePropertyLock,
        sleepAtHome,
        depositToBank,
        withdrawFromBank,
        createFixedDeposit,
        takeLoan,
        repayLoan,
        buyProperty,
        buyItem,
        shopliftItem,
        consumeItem,
        consumeFoodAt,
        startSleep,
        wakeUp,
        executeSearchCrime,
        executeBootlegCopy,
        executeBootlegSell,
        executeGraffiti,
        executeShopliftTarget,
        executePickpocketTarget,
        executeSkimInstall,
        executeSkimSell,
        executeBurglaryScout,
        executeHustling,
        executeDisposal,
        executeForgeryStep,
        executeScamPhishing,
        executeArson,
        commitCrime,
        trainStat,
        startEducation,
        submitExam,
        upgradeVital,
        registerBusiness,
        upgradeBusinessLicenseTier,
        toggleBusinessService,
        collectBusinessRevenue,
        spendMissionCredits,
        playCasinoGame,
        healInHospital,
        bailFromJail,
        exportBackupJson,
        importBackupJson,
        claimReferralMilestone,
        collectReferralCommission,
        redeemInviteCode,
        simulateNewRecruit,
        updatePlayerName,
        insufficientFundsModal,
        triggerInsufficientFunds,
        closeInsufficientFunds,
        addLog,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
