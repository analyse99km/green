export type PlayerRole = 'CITIZEN' | 'POLICE' | 'DOCTOR' | 'CHEF' | 'BUSINESS_OWNER' | 'GYM_OWNER' | 'GOON';

export interface BattleStats {
  strength: number;
  defense: number;
  speed: number;
  dexterity: number;
}

export interface WorkingStats {
  manualLabor: number;
  intelligence: number;
  endurance: number;
}

export interface CriminalSkills {
  searchForCash: number;
  shoplifting: number;
  graffiti: number;
  bootlegging: number;
  forgery: number;
  burglary: number;
  cardSkimming: number;
  hustling: number;
  cracking: number;
  arson: number;
}

export interface CriminalRecord {
  totalOffenses: number;
  theft: number;
  vandalism: number;
  counterfeiting: number;
  fraud: number;
  cybercrime: number;
  extortion: number;
  organizedCrimes: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'WEAPON' | 'ARMOR' | 'FOOD' | 'MEDICAL' | 'CONTRABAND' | 'TOOL' | 'LUXURY' | 'ENHANCER';
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  price: number;
  marketValue: number;
  shopliftDifficulty: number; // 1-100
  damage?: number;
  accuracy?: number;
  defense?: number;
  energyRestore?: number;
  happyRestore?: number;
  lifeRestore?: number;
  foodRestore?: number;
  usableIn?: ('ALL' | 'HOME' | 'RESTAURANT')[];
  statBonus?: Partial<BattleStats & WorkingStats>;
  perkDescription?: string;
  icon: string;
  quantity: number;
  equipped?: boolean;
  upgradeLevel?: number; // e.g. +1, +2, +3 up to +10!
  isCloudItem?: boolean; // Dynamically synced from cloud catalog
  cloudVersion?: string;
  greenTokenCost?: number; // Price in GREEN coins
}

export interface BazaarListing {
  id: string;
  sellerId: string;
  sellerName: string;
  item: InventoryItem;
  price: number;
  quantity: number;
  isPlayerListing?: boolean;
  status?: 'ACTIVE' | 'LOCKED' | 'FINALIZED';
  quorumNodes?: number;
  signature?: string;
  receiptId?: string;
  timestamp?: number;
}

export interface P2PPurchaseReceipt {
  receiptId: string;
  listingId: string;
  sellerId: string;
  sellerName?: string;
  buyerId: string;
  buyerName: string;
  itemName: string;
  price: number;
  quantity: number;
  timestamp: number;
  signature: string;
  collected?: boolean;
}

export interface CombatTarget {
  id: string;
  name: string;
  level: number;
  role: string;
  avatar: string;
  life: number;
  maxLife: number;
  battleStats: BattleStats;
  pocketCash: number;
  bountyReward: number;
  weapon: string;
  equippedArmor: string;
}

export interface Property {
  id: string;
  name: string;
  tier: 'SLUM' | 'APARTMENT' | 'VILLA' | 'PENTHOUSE' | 'FORTIFIED_COMPOUND';
  cost: number;
  fees: number;
  upkeepPerDay: number;
  maxEnergyBonus: number;
  maxHappyBonus: number;
  vaultCapacity: number;
  vaultCash: number;
  isLocked: boolean;
  securityLevel: number;
  owned: boolean;
}

export interface Job {
  companyName: string;
  companyType: string;
  position: string;
  income: number;
  jobPoints: number;
  daysInCompany: number;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface EducationCourse {
  id: string;
  title: string;
  category: 'LAW' | 'MEDICINE' | 'CULINARY' | 'COMMERCE' | 'COMBAT' | 'FITNESS';
  description: string;
  durationMinutes: number;
  completed: boolean;
  examPassed: boolean;
  unlocksProfession: PlayerRole;
  requiredStats?: Partial<BattleStats & WorkingStats>;
  examQuestions: ExamQuestion[];
}

export type LicenseTier = 'MICRO_50' | 'COMMERCIAL_500' | 'ENTERPRISE_5000' | 'MEGA_10000';

export interface BusinessServiceItem {
  id: string;
  name: string;
  type: 'FOOD' | 'TREATMENT' | 'WORKOUT_PLAN' | 'MERCHANDISE';
  productionCost: number;
  sellingPrice: number;
  effectDescription: string;
  active: boolean;
}

export interface BusinessRegistry {
  id: string;
  name: string;
  type: 'RESTAURANT' | 'HOSPITAL' | 'GYM' | 'RETAIL_STORE' | 'SECURITY_FIRM' | 'NIGHTCLUB';
  licenseTitle: string;
  licenseTier: LicenseTier;
  maxDailyCapacity: number; // 50, 500, 5000, 10000
  requiredExamId: string;
  requiredCapital: number;
  monthlyTax: number;
  dailyRevenue: number;
  dailyUpkeep: number;
  employeesCount: number;
  isRegistered: boolean;
  registeredAt?: number;
  services: BusinessServiceItem[];
}

export interface Mission {
  id: string;
  title: string;
  contractor: string; // e.g. "Fixer Vance", "Chief O'Connor"
  description: string;
  rewardCredits: number;
  rewardCash: number;
  completed: boolean;
  reqType: 'CRIME' | 'TRAIN' | 'STAT' | 'LEVEL' | 'BUY';
  targetCount: number;
  currentCount: number;
}

export interface NewspaperArticle {
  id: string;
  headline: string;
  summary: string;
  author: string;
  date: string;
  category: 'CITY_NEWS' | 'ECONOMY' | 'UNDERWORLD' | 'EVENTS';
}

export interface Faction {
  id: string;
  name: string;
  tag: string;
  respect: number;
  membersCount: number;
  daysInFaction: number;
  territory: string;
  isJoined: boolean;
}

export interface FixedDeposit {
  id: string;
  principal: number;
  interestRate: number;
  durationDays: number;
  startedAt: number;
  maturesAt: number;
  claimed: boolean;
}

export interface BankLoan {
  id: string;
  principal: number;
  amountDue: number;
  interestRate: number;
  dueDate: number;
  isForeclosed: boolean;
}

export interface Crime {
  id: string;
  name: string;
  category: 'SEARCH_CASH' | 'SHOPLIFT' | 'GRAFFITI' | 'BOOTLEG' | 'FORGERY' | 'BURGLARY' | 'SKIMMING' | 'CRACKING' | 'ARSON';
  nerveCost: number;
  skillReq: number;
  cashRewardMin: number;
  cashRewardMax: number;
  successRateBase: number;
  jailTimeMinutes: number;
  icon: string;
  description: string;
}

export interface GameLog {
  id: string;
  timestamp: number;
  type: 'CRIME' | 'POLICE' | 'CIVILIAN' | 'MUG' | 'SAVE' | 'SHOP' | 'TRAIN' | 'FACTION' | 'EDUCATION' | 'BUSINESS' | 'FOOD' | 'LEVEL_UP';
  message: string;
  amount?: number;
}

export interface NetworkTierStats {
  tier: number; // 1 = Direct, 2 = 1 Jump, 3 = 2 Jumps, etc.
  jumpLabel: string;
  royaltyPercent: number;
  activeCitizensCount: number;
  dailyGameplayVolume: number;
  dailyDividendGreen: number;
}

export interface ReferredUser {
  id: string;
  name: string;
  joinedAt: number;
  level: number;
  tier: number; // 1 = Direct (0 jumps), 2 = 1 Jump, 3 = 2 Jumps, etc.
  dailyGameplayEarned: number; // Raw gameplay contribution today (crimes, tapping, etc.)
  totalGeneratedGreen: number;
  lastActive: string;
}

export interface ReferralMilestone {
  recruitsRequired: number;
  greenReward: number;
  sparksReward: number;
  bonusTitle: string;
  claimed: boolean;
}

export interface ReferralState {
  referralCode: string;
  referredBy?: string;
  hasClaimedWelcomeBonus: boolean;
  lastDailyStipendClaimTimestamp?: number; // timestamp of last +50 GREEN/day recruit stipend
  lastDailyRoyaltyClaimTimestamp?: number; // timestamp of last once-a-day royalty payout
  dailyGameplayContribution?: number; // player's own raw gameplay GREEN earned today
  pendingDailyRoyaltyGreen?: number;
  totalRecruits: number; // direct recruits (tier 1)
  networkTotalCitizens: number; // all tiers combined
  unclaimedCommissionGreen: number;
  lifetimeCommissionGreen: number;
  recruits: ReferredUser[];
  claimedMilestones: number[];
}

export interface PlayerState {
  id: string;
  name: string;
  xid: string;
  role: PlayerRole;
  rank: string;
  level: number;
  xp: number;
  xpNeeded: number;
  unallocatedStatPoints: number; // For stat & vitals upgrades!
  ageDays: number;
  maritalStatus: string;
  networth: number;

  // Vitals (Expandable via upgrades & levels!)
  money: number;
  bankMoney: number;
  points: number;
  missionCredits: number;
  
  life: number;
  maxLife: number; // Upgradeable!
  energy: number;
  maxEnergy: number; // Upgradeable!
  nerve: number;
  maxNerve: number; // Upgradeable!
  happy: number;
  maxHappy: number; // Upgradeable!
  food: number; // Satiety / Fullness bar!
  maxFood: number;
  chain: number;
  maxChain: number;
  isAwakened?: boolean; // Whether all 6 vitals have been restored above 0 from Dream Market!

  // Stats
  battleStats: BattleStats;
  workingStats: WorkingStats;
  criminalSkills: CriminalSkills;
  criminalRecord: CriminalRecord;

  // Careers, Business & Education
  job: Job;
  educationCourses: EducationCourse[];
  businessRegistries: BusinessRegistry[];
  missions: Mission[];

  // Property, Market & Bazaar Assets
  properties: Property[];
  currentPropertyId: string;
  inventory: InventoryItem[];
  bazaarListings: BazaarListing[];
  bazaarTillCash: number;
  fixedDeposits: FixedDeposit[];
  loans: BankLoan[];
  faction: Faction;

  // Features & Settings
  dailyWheelSpinsAvailable: number;
  lastWheelSpinTimestamp: number;
  soundEnabled: boolean;

  // Lucid Dream / Neural Tap Energy Refill System
  dreamPoints: number;
  dreamMultiplier: number;
  totalTaps: number;
  tapStamina: number; // Tapping power refilling every hour (max 500)
  maxTapStamina: number;
  dreamCards: { [cardId: string]: number }; // card level per card
  activeTapperSkinId: string;
  unlockedTapperSkins: string[];
  bodyAugmentations: string[]; // Cybernetic body modifications

  // P2P Replicated Ledger & Replay Defense (No duplicate money or popups!)
  settledReceiptIds: string[];

  // GREEN Token Economy & Coin Logic
  greenTokens: number;

  // Daily Streak Clipper (7-Day Retention Calendar)
  dailyStreak: number;
  lastStreakClaimTimestamp: number;
  canClaimDailyStreak: boolean;

  // Viral Referrals & Syndicate Affiliate Rewards
  referrals: ReferralState;

  // Torn Authentic Arson Crime 2.0 System
  arsonStats: {
    breaches: number;
    fails: number;
    alerts: number;
  };
  arsonProgress: { [targetId: string]: number };
  arsonEquippedAccelerant?: string;

  // Timers & Jail Legal
  jailTimeRemainingSeconds: number;
  hospitalTimeRemainingSeconds: number;
  currentBailAmount?: number;
  lastCrimeReason?: string;
  totalFinesPaid?: number;
  isSleeping: boolean;
  sleepRemainingSeconds: number;

  // System
  stateHash: string;
  lastSaveTimestamp: number;
  hasUnsavedActions: boolean;
}
