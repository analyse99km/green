'use client';

import React, { useState, useEffect } from 'react';
import {
  loadCatalogData,
  saveCatalogData,
  DynamicCatalogData,
  BotanicalCardDef,
  BotanicalCategoryDef,
  DynamicItemDef,
  DEFAULT_REFERRAL_REWARDS,
  ReferralTierConfig,
  ReferralMilestoneConfig,
  ReferralRewardsConfig,
  TreeStageDef,
  INITIAL_TREE_STAGES,
} from '../gameCatalog';
import { Mission } from '../types';
import { SoundEngine } from '../gameAudio';
import { useGame } from '../GameContext';
import DynamicIcon from '../DynamicIcon';

interface AdminPlayer {
  email: string;
  name: string;
  userId: string;
  userReferralCode?: string;
  referredBy?: string;
  recruitsCount: number;
  recruits: { email: string; name: string }[];
  createdAt: string;
  lastLoginAt: string;
  passwordHash: string;
  salt: string;
}

export const AdminDashboardView: React.FC = () => {
  const { player } = useGame();
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'CARDS' | 'ITEMS' | 'REFERRAL' | 'TREE' | 'MISSIONS'>('PLAYERS');
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Catalog State
  const [catalog, setCatalog] = useState<DynamicCatalogData>({
    categories: [],
    cards: [],
    customItems: [],
    treeStages: INITIAL_TREE_STAGES,
    customMissions: [],
  });

  // Missions Management State
  const [customMissions, setCustomMissions] = useState<Mission[]>([]);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionId, setMissionId] = useState('');
  const [missionTitle, setMissionTitle] = useState('');
  const [missionContractor, setMissionContractor] = useState('Neon Syndicate');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionCategory, setMissionCategory] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'STORY' | 'PARTNER'>('DAILY');
  const [missionReqType, setMissionReqType] = useState<Mission['reqType']>('WATCH_VIDEO');
  const [missionTargetCount, setMissionTargetCount] = useState(1);
  const [missionIcon, setMissionIcon] = useState('🎥');
  const [missionRewardGreen, setMissionRewardGreen] = useState(20);
  const [missionRewardSparks, setMissionRewardSparks] = useState(500);
  const [missionRewardCredits, setMissionRewardCredits] = useState(10);
  const [missionRewardCash, setMissionRewardCash] = useState(5000);
  const [missionExternalUrl, setMissionExternalUrl] = useState('');
  const [missionButtonLabel, setMissionButtonLabel] = useState('▶️ Watch Video');
  const [missionTargetCardId, setMissionTargetCardId] = useState('');

  // Tree Evolution Stages State
  const [treeStages, setTreeStages] = useState<TreeStageDef[]>(INITIAL_TREE_STAGES);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [editingTreeStage, setEditingTreeStage] = useState<TreeStageDef | null>(null);
  const [treeId, setTreeId] = useState('');
  const [treeName, setTreeName] = useState('');
  const [treeIcon, setTreeIcon] = useState('🌱');
  const [treeBonus, setTreeBonus] = useState('+1/tap');
  const [treeSparksPerTap, setTreeSparksPerTap] = useState(1);
  const [treeMultiplier, setTreeMultiplier] = useState(1.0);
  const [treeUnlockSparks, setTreeUnlockSparks] = useState(0);
  const [treeUnlockGreen, setTreeUnlockGreen] = useState(0);
  const [treeDescription, setTreeDescription] = useState('');

  // Referral Rewards Configuration State
  const [refRecruiterBounty, setRefRecruiterBounty] = useState<number>(100);
  const [refRecruitWelcome, setRefRecruitWelcome] = useState<number>(100);
  const [refDailyStipend, setRefDailyStipend] = useState<number>(50);
  const [refTiers, setRefTiers] = useState<ReferralTierConfig[]>(DEFAULT_REFERRAL_REWARDS.tiers);
  const [refMilestones, setRefMilestones] = useState<ReferralMilestoneConfig[]>(DEFAULT_REFERRAL_REWARDS.milestones);

  // Modal / Form States
  const [editingPlayer, setEditingPlayer] = useState<AdminPlayer | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerReferral, setEditPlayerReferral] = useState('');

  // New Category Form
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🌱');
  const [newCatBadge, setNewCatBadge] = useState('New Tier');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // New Card Form
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<BotanicalCardDef | null>(null);
  const [cardTitle, setCardTitle] = useState('');
  const [cardFlavor, setCardFlavor] = useState('');
  const [cardCost, setCardCost] = useState(100);
  const [cardSparks, setCardSparks] = useState(5);
  const [cardIcon, setCardIcon] = useState('🌿');
  const [cardCategory, setCardCategory] = useState('');
  const [cardBadge, setCardBadge] = useState('Spore');
  const [cardReqId, setCardReqId] = useState('');
  const [cardReqLevel, setCardReqLevel] = useState(1);

  // New Item Form
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DynamicItemDef | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategory, setItemCategory] = useState<'WEAPON' | 'ARMOR' | 'FOOD' | 'MEDICAL' | 'CONTRABAND' | 'TOOL' | 'LUXURY' | 'ENHANCER'>('TOOL');
  const [itemPrice, setItemPrice] = useState(500);
  const [itemIcon, setItemIcon] = useState('📦');
  const [itemReqCardId, setItemReqCardId] = useState('');
  const [itemReqCardLevel, setItemReqCardLevel] = useState(1);

  // Load Admin Data & Catalog
  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
      }
    } catch (err) {
      console.error('Failed to load admin players:', err);
      setErrorMsg('Cluster sync fallback: Unable to fetch remote players.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const cat = loadCatalogData();
    setCatalog(cat);
    if (cat.categories.length > 0) {
      setCardCategory(cat.categories[0].id);
    }
  }, []);

  const saveCatalogChanges = (updated: DynamicCatalogData) => {
    setCatalog(updated);
    saveCatalogData(updated);
    setSuccessMsg('Catalog successfully updated & synced across all clusters!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  useEffect(() => {
    if (catalog.referralRewards) {
      setRefRecruiterBounty(catalog.referralRewards.recruiterInstantBounty ?? 100);
      setRefRecruitWelcome(catalog.referralRewards.recruitWelcomeBonus ?? 100);
      setRefDailyStipend(catalog.referralRewards.dailyRecruitStipend ?? 50);
      if (catalog.referralRewards.tiers && catalog.referralRewards.tiers.length > 0) {
        setRefTiers(catalog.referralRewards.tiers);
      }
      if (catalog.referralRewards.milestones && catalog.referralRewards.milestones.length > 0) {
        setRefMilestones(catalog.referralRewards.milestones);
      }
    }
    if (catalog.treeStages && catalog.treeStages.length > 0) {
      setTreeStages(catalog.treeStages);
    }
    if (catalog.customMissions) {
      setCustomMissions(catalog.customMissions);
    }
  }, [catalog]);

  const handleOpenAddMission = () => {
    setEditingMission(null);
    setMissionId(`custom_msn_${Date.now()}`);
    setMissionTitle('Watch Syndicate Intel Briefing');
    setMissionContractor('Neon Syndicate');
    setMissionDesc('Watch this intelligence video on YouTube to earn bonus credits & sparks.');
    setMissionCategory('DAILY');
    setMissionReqType('WATCH_VIDEO');
    setMissionTargetCount(1);
    setMissionIcon('🎥');
    setMissionRewardGreen(25);
    setMissionRewardSparks(500);
    setMissionRewardCredits(10);
    setMissionRewardCash(5000);
    setMissionExternalUrl('https://www.youtube.com');
    setMissionButtonLabel('▶️ Watch Video');
    setMissionTargetCardId('');
    setShowMissionModal(true);
  };

  const handleOpenEditMission = (m: Mission) => {
    setEditingMission(m);
    setMissionId(m.id);
    setMissionTitle(m.title);
    setMissionContractor(m.contractor || 'Neon Syndicate');
    setMissionDesc(m.description);
    setMissionCategory(m.category || 'DAILY');
    setMissionReqType(m.reqType || 'WATCH_VIDEO');
    setMissionTargetCount(m.targetCount || 1);
    setMissionIcon(m.icon || '🎯');
    setMissionRewardGreen(m.rewardGreen || 0);
    setMissionRewardSparks(m.rewardSparks || 0);
    setMissionRewardCredits(m.rewardCredits || 0);
    setMissionRewardCash(m.rewardCash || 0);
    setMissionExternalUrl(m.externalUrl || '');
    setMissionButtonLabel(m.buttonLabel || '▶️ Watch Video');
    setMissionTargetCardId(m.targetCardId || '');
    setShowMissionModal(true);
  };

  const handleSaveMission = (e: React.FormEvent) => {
    e.preventDefault();
    const mDef: Mission = {
      id: missionId.trim(),
      title: missionTitle.trim(),
      contractor: missionContractor.trim() || 'Neon Syndicate',
      description: missionDesc.trim(),
      category: missionCategory,
      reqType: missionReqType,
      targetCount: Number(missionTargetCount) || 1,
      currentCount: 0,
      completed: false,
      claimed: false,
      icon: missionIcon.trim() || '🎯',
      rewardGreen: Number(missionRewardGreen) || 0,
      rewardSparks: Number(missionRewardSparks) || 0,
      rewardCredits: Number(missionRewardCredits) || 0,
      rewardCash: Number(missionRewardCash) || 0,
      externalUrl: missionExternalUrl.trim() || undefined,
      buttonLabel: missionButtonLabel.trim() || undefined,
      targetCardId: missionTargetCardId.trim() || undefined,
    };

    let updatedMissions: Mission[];
    if (editingMission) {
      updatedMissions = customMissions.map((m) => (m.id === editingMission.id ? mDef : m));
    } else {
      updatedMissions = [...customMissions, mDef];
    }

    setCustomMissions(updatedMissions);
    saveCatalogChanges({
      ...catalog,
      customMissions: updatedMissions,
    });
    setSuccessMsg(editingMission ? 'Mission updated successfully!' : 'New mission published!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setShowMissionModal(false);
  };

  const handleDeleteMission = (id: string) => {
    if (!confirm('Delete this mission from the game catalog?')) return;
    const updated = customMissions.filter((m) => m.id !== id);
    setCustomMissions(updated);
    saveCatalogChanges({
      ...catalog,
      customMissions: updated,
    });
    setSuccessMsg('Mission removed.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleOpenAddTreeStage = () => {
    const nextIdx = treeStages.length + 1;
    setEditingTreeStage(null);
    setTreeId(`tree_stage_${Date.now()}`);
    setTreeName(`Evolution Stage #${nextIdx}`);
    setTreeIcon('🌿');
    setTreeBonus(`+${nextIdx * 5}/tap`);
    setTreeSparksPerTap(nextIdx * 5);
    setTreeMultiplier(nextIdx * 2);
    setTreeUnlockSparks(nextIdx * 500);
    setTreeUnlockGreen(0);
    setTreeDescription('');
    setShowTreeModal(true);
  };

  const handleOpenEditTreeStage = (stage: TreeStageDef) => {
    setEditingTreeStage(stage);
    setTreeId(stage.id);
    setTreeName(stage.name);
    setTreeIcon(stage.icon);
    setTreeBonus(stage.bonus);
    setTreeSparksPerTap(stage.sparksPerTap);
    setTreeMultiplier(stage.multiplier);
    setTreeUnlockSparks(stage.unlockCostSparks);
    setTreeUnlockGreen(stage.unlockCostGreen || 0);
    setTreeDescription(stage.description || '');
    setShowTreeModal(true);
  };

  const handleSaveTreeStage = (e: React.FormEvent) => {
    e.preventDefault();
    const stageDef: TreeStageDef = {
      id: treeId.trim(),
      name: treeName.trim(),
      icon: treeIcon.trim() || '🌿',
      bonus: treeBonus.trim() || `+${treeSparksPerTap}/tap`,
      sparksPerTap: Number(treeSparksPerTap) || 1,
      multiplier: Number(treeMultiplier) || 1.0,
      unlockCostSparks: Number(treeUnlockSparks) || 0,
      unlockCostGreen: Number(treeUnlockGreen) || 0,
      description: treeDescription.trim(),
    };

    let updatedStages: TreeStageDef[];
    if (editingTreeStage) {
      updatedStages = treeStages.map((s) => (s.id === editingTreeStage.id ? stageDef : s));
    } else {
      updatedStages = [...treeStages, stageDef];
    }

    setTreeStages(updatedStages);
    saveCatalogChanges({
      ...catalog,
      treeStages: updatedStages,
    });
    setShowTreeModal(false);
  };

  const handleDeleteTreeStage = (id: string) => {
    if (treeStages.length <= 1) {
      setErrorMsg('Cannot delete the last remaining tree evolution stage.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    const updatedStages = treeStages.filter((s) => s.id !== id);
    setTreeStages(updatedStages);
    saveCatalogChanges({
      ...catalog,
      treeStages: updatedStages,
    });
  };

  const handleMoveTreeStage = (idx: number, dir: 'UP' | 'DOWN') => {
    const targetIdx = dir === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= treeStages.length) return;
    const reordered = [...treeStages];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    setTreeStages(reordered);
    saveCatalogChanges({
      ...catalog,
      treeStages: reordered,
    });
  };

  const handleResetDefaultTreeStages = () => {
    setTreeStages(INITIAL_TREE_STAGES);
    saveCatalogChanges({
      ...catalog,
      treeStages: INITIAL_TREE_STAGES,
    });
  };

  const handleSaveReferralRewards = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedReferralRewards: ReferralRewardsConfig = {
      recruiterInstantBounty: Number(refRecruiterBounty) || 100,
      recruitWelcomeBonus: Number(refRecruitWelcome) || 100,
      dailyRecruitStipend: Number(refDailyStipend) || 50,
      tiers: refTiers.map((t) => ({
        tier: t.tier,
        jumpLabel: t.jumpLabel,
        percent: Number(t.percent) || 0,
      })),
      milestones: refMilestones.map((m) => ({
        recruits: m.recruits,
        label: m.label,
        rewardGreen: Number(m.rewardGreen) || 0,
      })),
    };

    saveCatalogChanges({
      ...catalog,
      referralRewards: updatedReferralRewards,
    });
    SoundEngine.playVictory(player.soundEnabled);
    setSuccessMsg('Referral & Royalty Jump Rewards updated & synced across cluster!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetReferralDefaults = () => {
    if (!confirm('Reset referral and royalty rewards to system defaults?')) return;
    setRefRecruiterBounty(DEFAULT_REFERRAL_REWARDS.recruiterInstantBounty);
    setRefRecruitWelcome(DEFAULT_REFERRAL_REWARDS.recruitWelcomeBonus);
    setRefDailyStipend(DEFAULT_REFERRAL_REWARDS.dailyRecruitStipend);
    setRefTiers(DEFAULT_REFERRAL_REWARDS.tiers);
    setRefMilestones(DEFAULT_REFERRAL_REWARDS.milestones);
  };

  // Add or Edit Card
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;

    const id = editingCard ? editingCard.id : `card_${cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newCard: BotanicalCardDef = {
      id,
      title: cardTitle.trim(),
      flavor: cardFlavor.trim() || 'A biological chlorophyll spore matrix.',
      baseCost: Number(cardCost) || 50,
      sparksPerSec: Number(cardSparks) || 1,
      icon: cardIcon.trim() || '🌱',
      category: cardCategory || (catalog.categories[0]?.id ?? 'SPORES'),
      badge: cardBadge.trim() || 'Custom',
      requiredCardId: cardReqId ? cardReqId : undefined,
      requiredCardLevel: cardReqId ? Number(cardReqLevel) || 1 : undefined,
    };

    let updatedCards = [...catalog.cards];
    if (editingCard) {
      updatedCards = updatedCards.map((c) => (c.id === editingCard.id ? newCard : c));
    } else {
      updatedCards.push(newCard);
    }

    saveCatalogChanges({ ...catalog, cards: updatedCards });
    setShowCardModal(false);
    setEditingCard(null);
    resetCardForm();
  };

  const resetCardForm = () => {
    setCardTitle('');
    setCardFlavor('');
    setCardCost(100);
    setCardSparks(5);
    setCardIcon('🌿');
    setCardBadge('Spore');
    setCardReqId('');
    setCardReqLevel(1);
    if (catalog.categories.length > 0) setCardCategory(catalog.categories[0].id);
  };

  const handleEditCard = (card: BotanicalCardDef) => {
    setEditingCard(card);
    setCardTitle(card.title);
    setCardFlavor(card.flavor);
    setCardCost(card.baseCost);
    setCardSparks(card.sparksPerSec);
    setCardIcon(card.icon);
    setCardCategory(card.category);
    setCardBadge(card.badge);
    setCardReqId(card.requiredCardId || '');
    setCardReqLevel(card.requiredCardLevel || 1);
    setShowCardModal(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!confirm('Are you sure you want to delete this botanical card?')) return;
    const updatedCards = catalog.cards.filter((c) => c.id !== cardId);
    saveCatalogChanges({ ...catalog, cards: updatedCards });
  };

  // Add New Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const id = newCatId.trim().toUpperCase() || newCatName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const newCat: BotanicalCategoryDef = {
      id,
      name: newCatName.trim(),
      icon: newCatIcon.trim() || '🌿',
      badge: newCatBadge.trim() || 'Custom Tier',
    };

    saveCatalogChanges({
      ...catalog,
      categories: [...catalog.categories, newCat],
    });
    setNewCatId('');
    setNewCatName('');
    setNewCatIcon('🌱');
    setNewCatBadge('New Tier');
    setShowAddCatModal(false);
  };

  // Add or Edit Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const id = editingItem ? editingItem.id : `item_${itemName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newItem: DynamicItemDef = {
      id,
      name: itemName.trim(),
      description: itemDesc.trim() || 'High-grade city operative equipment.',
      category: itemCategory,
      price: Number(itemPrice) || 100,
      marketValue: Number(itemPrice) || 100,
      icon: itemIcon.trim() || '📦',
      requiredCardId: itemReqCardId ? itemReqCardId : undefined,
      requiredCardLevel: itemReqCardId ? Number(itemReqCardLevel) || 1 : undefined,
    };

    let updatedItems = [...catalog.customItems];
    if (editingItem) {
      updatedItems = updatedItems.map((i) => (i.id === editingItem.id ? newItem : i));
    } else {
      updatedItems.push(newItem);
    }

    saveCatalogChanges({ ...catalog, customItems: updatedItems });
    setShowItemModal(false);
    setEditingItem(null);
    resetItemForm();
  };

  const resetItemForm = () => {
    setItemName('');
    setItemDesc('');
    setItemPrice(500);
    setItemIcon('📦');
    setItemCategory('TOOL');
    setItemReqCardId('');
    setItemReqCardLevel(1);
  };

  const handleEditItem = (item: DynamicItemDef) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price);
    setItemIcon(item.icon);
    setItemCategory(item.category);
    setItemReqCardId(item.requiredCardId || '');
    setItemReqCardLevel(item.requiredCardLevel || 1);
    setShowItemModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!confirm('Are you sure you want to delete this custom item?')) return;
    const updated = catalog.customItems.filter((i) => i.id !== itemId);
    saveCatalogChanges({ ...catalog, customItems: updated });
  };

  // Player Update Action
  const handleSavePlayer = async () => {
    if (!editingPlayer) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_player',
          email: editingPlayer.email,
          updates: {
            name: editPlayerName.trim(),
            userReferralCode: editPlayerReferral.trim(),
          },
        }),
      });
      if (res.ok) {
        setSuccessMsg(`Player ${editingPlayer.email} updated.`);
        fetchAdminData();
        setEditingPlayer(null);
      }
    } catch (err) {
      setErrorMsg('Failed to update player.');
    }
  };

  const handleDeletePlayer = async (email: string) => {
    if (!confirm(`Delete player account for ${email}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_player', email }),
      });
      if (res.ok) {
        setSuccessMsg(`Deleted player: ${email}`);
        fetchAdminData();
      }
    } catch (err) {
      setErrorMsg('Failed to delete player.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-black border-2 border-emerald-500/40 rounded-lg p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              <h1 className="text-2xl font-black tracking-wider text-emerald-400 uppercase">
                Metropolis Command & Admin Console
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                Cluster Host Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Local administrative control node: monitor live registered operatives, manage botanical generation cards,
              create custom sections & logos, add Bazaar items, and set card-level prerequisite unlock requirements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                SoundEngine.playTick(player.soundEnabled);
                fetchAdminData();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-2 rounded border border-zinc-600 transition flex items-center gap-1.5"
            >
              <span>🔄</span> Refresh Cluster Data
            </button>
          </div>
        </div>

        {/* Global Summary Metric Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="bg-black/50 border border-zinc-800 p-2.5 rounded">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Operatives Registered</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{players.length}</div>
          </div>
          <div className="bg-black/50 border border-zinc-800 p-2.5 rounded">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Botanical Sections</div>
            <div className="text-xl font-black text-emerald-300 mt-0.5">{catalog.categories.length}</div>
          </div>
          <div className="bg-black/50 border border-zinc-800 p-2.5 rounded">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Total Botanical Cards</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{catalog.cards.length}</div>
          </div>
          <div className="bg-black/50 border border-zinc-800 p-2.5 rounded">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Dynamic Bazaar Items</div>
            <div className="text-xl font-black text-cyan-400 mt-0.5">{catalog.customItems.length}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm p-3 rounded flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-500/50 text-rose-300 text-sm p-3 rounded flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Main Tab Controls */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => {
            SoundEngine.playTick(player.soundEnabled);
            setActiveTab('PLAYERS');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'PLAYERS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>👥</span> Registered Operatives ({players.length})
        </button>
        <button
          onClick={() => {
            SoundEngine.playTick(player.soundEnabled);
            setActiveTab('CARDS');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'CARDS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>🃏</span> Botanical Cards & Sections ({catalog.cards.length})
        </button>
        <button
          onClick={() => {
            SoundEngine.playTick(player.soundEnabled);
            setActiveTab('ITEMS');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'ITEMS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>🛒</span> Bazaar & Items Manager ({catalog.customItems.length})
        </button>
        <button
          onClick={() => {
            SoundEngine.playTick(player.soundEnabled);
            setActiveTab('REFERRAL');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'REFERRAL'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>🎁</span> Edit Referral & Jump Rewards
        </button>
        <button
          onClick={() => {
            SoundEngine.playTick(player.soundEnabled);
            setActiveTab('TREE');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'TREE'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>🌳</span> Tree Evolution Stages ({treeStages.length})
        </button>
        <button
          onClick={() => {
            SoundEngine.playTick(player.soundEnabled);
            setActiveTab('MISSIONS');
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'MISSIONS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>🎯</span> Missions & Ads Manager ({customMissions.length})
        </button>
      </div>

      {/* TAB 1: REGISTERED PLAYERS DIRECTORY */}
      {activeTab === 'PLAYERS' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <span>👥</span> Operative Accounts In Metropolis Cluster ({players.length})
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Cluster Sync: Active (data/users.json)</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading player cluster records...</div>
          ) : players.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No registered player accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-900/60">
                    <th className="p-2.5">Name / Username</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Password Hash / Salt</th>
                    <th className="p-2.5">Referral Code</th>
                    <th className="p-2.5">Recruiter</th>
                    <th className="p-2.5 text-center">Recruits</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {players.map((u) => (
                    <tr key={u.email} className="hover:bg-zinc-900/40 transition">
                      <td className="p-2.5 font-bold text-zinc-200">{u.name}</td>
                      <td className="p-2.5 font-mono text-emerald-400">{u.email}</td>
                      <td className="p-2.5 font-mono text-zinc-500 text-[10px]">
                        <div>Hash: {u.passwordHash}</div>
                        <div>Salt: {u.salt}</div>
                      </td>
                      <td className="p-2.5 font-mono text-amber-400 font-semibold">{u.userReferralCode || 'N/A'}</td>
                      <td className="p-2.5 text-zinc-400">{u.referredBy}</td>
                      <td className="p-2.5 text-center">
                        <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[11px]">
                          {u.recruitsCount}
                        </span>
                      </td>
                      <td className="p-2.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingPlayer(u);
                            setEditPlayerName(u.name);
                            setEditPlayerReferral(u.userReferralCode || '');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[11px] font-semibold transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(u.email)}
                          className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 px-2 py-1 rounded text-[11px] font-semibold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOTANICAL CARDS & SECTIONS */}
      {activeTab === 'CARDS' && (
        <div className="space-y-4">
          {/* Section Management Header */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                  <span>📂</span> Botanical Categories & Sections ({catalog.categories.length})
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Organize cards into customizable botanical categories with custom icons and logos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddCatModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1"
                >
                  <span>➕</span> Add New Section
                </button>
                <button
                  onClick={() => {
                    resetCardForm();
                    setEditingCard(null);
                    setShowCardModal(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1"
                >
                  <span>🌱</span> Create Botanical Card
                </button>
              </div>
            </div>

            {/* Category Badges */}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-zinc-800/80">
              {catalog.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <span className="w-6 h-6 inline-flex items-center justify-center">
                    <DynamicIcon icon={cat.icon} alt={cat.name} imgClassName="w-5 h-5 object-contain rounded" className="text-base" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{cat.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {cat.id} • {cat.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>🃏</span> Registered Botanical Cards ({catalog.cards.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-900/60">
                    <th className="p-2.5">Card</th>
                    <th className="p-2.5">Section</th>
                    <th className="p-2.5">Base Cost (Sparks)</th>
                    <th className="p-2.5">Sparks / Sec</th>
                    <th className="p-2.5">Prerequisite Requirement</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {catalog.cards.map((c) => {
                    const reqCard = catalog.cards.find((rc) => rc.id === c.requiredCardId);
                    return (
                      <tr key={c.id} className="hover:bg-zinc-900/40 transition">
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 p-0.5 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                              <DynamicIcon icon={c.icon} alt={c.title} imgClassName="w-7 h-7 object-contain rounded" className="text-xl" fallback="🌱" />
                            </span>
                            <div>
                              <div className="font-bold text-zinc-200">{c.title}</div>
                              <div className="text-[10px] text-zinc-500 line-clamp-1">{c.flavor}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span className="bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded text-[10px]">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-amber-400 font-bold">
                          ✨ {c.baseCost.toLocaleString()}
                        </td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">
                          +{c.sparksPerSec.toLocaleString()}/s
                        </td>
                        <td className="p-2.5">
                          {c.requiredCardId ? (
                            <span className="bg-amber-950/60 border border-amber-600/40 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max">
                              <span>🔒</span> Requires {reqCard?.title || c.requiredCardId} Lvl {c.requiredCardLevel || 1}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">None (Always Unlocked)</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-2">
                          <button
                            onClick={() => handleEditCard(c)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCard(c.id)}
                            className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 px-2 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BAZAAR & ITEMS MANAGER */}
      {activeTab === 'ITEMS' && (
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                  <span>🛒</span> Custom Items & Bazaar Offerings ({catalog.customItems.length})
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Add new items or configure card-level prerequisites required for purchasing.
                </p>
              </div>
              <button
                onClick={() => {
                  resetItemForm();
                  setEditingItem(null);
                  setShowItemModal(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1"
              >
                <span>➕</span> Add New Item
              </button>
            </div>

            {catalog.customItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No custom dynamic items added yet. Click &quot;Add New Item&quot; to inject new gear into the city.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-900/60">
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Price (GREEN)</th>
                      <th className="p-2.5">Prerequisite Botanical Card</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {catalog.customItems.map((item) => {
                      const reqCard = catalog.cards.find((c) => c.id === item.requiredCardId);
                      return (
                        <tr key={item.id} className="hover:bg-zinc-900/40 transition">
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-9 h-9 p-0.5 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                                <DynamicIcon icon={item.icon} alt={item.name} imgClassName="w-7 h-7 object-contain rounded" className="text-xl" fallback="📦" />
                              </span>
                              <div>
                                <div className="font-bold text-zinc-200">{item.name}</div>
                                <div className="text-[10px] text-zinc-500">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 font-mono text-zinc-400">{item.category}</td>
                          <td className="p-2.5 font-mono text-emerald-400 font-bold">
                            🌿 {item.price.toLocaleString()} GREEN
                          </td>
                          <td className="p-2.5">
                            {item.requiredCardId ? (
                              <span className="bg-amber-950/60 border border-amber-600/40 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max">
                                <span>🔒</span> Requires {reqCard?.title || item.requiredCardId} Lvl{' '}
                                {item.requiredCardLevel || 1}
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-[10px]">None (Open to all)</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right space-x-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[11px] font-semibold transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 px-2 py-1 rounded text-[11px] font-semibold transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REFERRAL & JUMP REWARDS EDITOR */}
      {activeTab === 'REFERRAL' && (
        <form onSubmit={handleSaveReferralRewards} className="space-y-5">
          {/* Header Banner */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                  <span>🎁</span> Syndicate Referral & Generational Jump Royalty Rules
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure instant recruitment kickbacks, welcome bonuses, 24-hour operative allowances, cascading generational jump royalties (5 Tiers), and milestone progression bounties.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetReferralDefaults}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>🔄</span> Reset Defaults
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-1.5 rounded transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  <span>💾</span> Save & Deploy Rules
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Base Incentives & Welcome Allowances */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Base Recruitment Economics & Allowances
            </h3>
            <p className="text-[11px] text-zinc-400">
              Immediate payouts and daily stipends awarded to recruiters and recruits across the entire metropolis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg space-y-1.5">
                <label className="block text-[11px] font-bold text-amber-400 uppercase">
                  Recruiter Instant Bounty (+🌿 GREEN)
                </label>
                <p className="text-[10px] text-zinc-500">
                  Instant till bounty awarded to sponsor the moment a new recruit redeems code or joins via Telegram.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-amber-400 font-mono text-sm">🌿</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={refRecruiterBounty}
                    onChange={(e) => setRefRecruiterBounty(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg space-y-1.5">
                <label className="block text-[11px] font-bold text-cyan-400 uppercase">
                  Recruit Welcome Starter Bonus (+🌿 GREEN)
                </label>
                <p className="text-[10px] text-zinc-500">
                  Welcome bonus credited directly to the new player's wallet upon entering an operative invite code.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-cyan-400 font-mono text-sm">🌿</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={refRecruitWelcome}
                    onChange={(e) => setRefRecruitWelcome(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg space-y-1.5">
                <label className="block text-[11px] font-bold text-emerald-400 uppercase">
                  Daily Recruit Stipend (+🌿 GREEN / 24h)
                </label>
                <p className="text-[10px] text-zinc-500">
                  Daily operative allowance claimable once every 24 hours by any player affiliated with a sponsor.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-emerald-400 font-mono text-sm">🌿</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={refDailyStipend}
                    onChange={(e) => setRefDailyStipend(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 5 Generational Jump Royalty Percentages */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span>🌳</span> 5 Generational Jump Royalty Percentages (% of Active Daily Gameplay)
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">Calculated 1x/Day based on real activity</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Each tier represents a generational distance. Royalty is calculated exclusively from downstream active gameplay (crimes, gyms, taps).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {refTiers.map((t, idx) => (
                <div key={t.tier} className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono">Tier {t.tier}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {idx === 0 ? 'Direct' : `${idx} Jump${idx > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={t.jumpLabel}
                    onChange={(e) => {
                      const updated = [...refTiers];
                      updated[idx].jumpLabel = e.target.value;
                      setRefTiers(updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:border-indigo-500 focus:outline-none"
                    placeholder="Tier Label"
                  />
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Royalty Share (%)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={t.percent}
                        onChange={(e) => {
                          const updated = [...refTiers];
                          updated[idx].percent = Number(e.target.value);
                          setRefTiers(updated);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-mono text-xs font-bold focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="text-zinc-400 text-xs font-mono font-bold">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Direct Recruit Milestone Progression Ladder */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>🏆</span> Direct Recruit Milestone Rewards Ladder
            </h3>
            <p className="text-[11px] text-zinc-400">
              One-time milestone unlock bonuses granted to players as their direct recruit headcount reaches Syndicate milestones.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {refMilestones.map((m, idx) => (
                <div key={m.recruits} className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs font-mono">
                      {m.recruits} Direct Recruits
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-mono">
                      Milestone #{idx + 1}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={m.label}
                    onChange={(e) => {
                      const updated = [...refMilestones];
                      updated[idx].label = e.target.value;
                      setRefMilestones(updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:border-amber-500 focus:outline-none"
                    placeholder="Milestone Title"
                  />
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Bounty Reward (+🌿 GREEN)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono text-xs">🌿</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={m.rewardGreen}
                        onChange={(e) => {
                          const updated = [...refMilestones];
                          updated[idx].rewardGreen = Number(e.target.value);
                          setRefMilestones(updated);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-mono text-xs font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetReferralDefaults}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded text-xs font-bold transition cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-6 py-2.5 rounded transition shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              Save & Deploy Referral Reward Rules Across Cluster
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: TREE EVOLUTION STAGES MANAGER */}
      {activeTab === 'TREE' && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                  <span>🌳</span> Chlorophyll Tree Evolution Stages ({treeStages.length})
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure the primary tapper plant organism evolution ladder. Edit multipliers, sparks per tap, unlock costs (Sparks & GREEN), and icons across all cluster nodes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaultTreeStages}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>🔄</span> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddTreeStage}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-1.5 rounded transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  <span>➕</span> Add Tree Stage
                </button>
              </div>
            </div>
          </div>

          {/* Tree Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treeStages.map((stage, idx) => (
              <div
                key={stage.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl p-4 space-y-3 transition group relative"
              >
                {/* Stage Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center select-none shadow-md">
                      {stage.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          STAGE #{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {stage.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-zinc-100 text-sm mt-0.5">{stage.name}</h3>
                      <div className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                        {stage.bonus} &bull; {stage.multiplier}x Multiplier
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80 text-[11px] font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Sparks / Tap</span>
                    <span className="font-bold text-cyan-400">+{stage.sparksPerTap} Sparks</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Multiplier</span>
                    <span className="font-bold text-amber-400">{stage.multiplier}x</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Unlock (Sparks)</span>
                    <span className="font-bold text-zinc-200">⚡ {stage.unlockCostSparks.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Unlock (GREEN)</span>
                    <span className="font-bold text-emerald-400">🌿 {stage.unlockCostGreen || 0} GREEN</span>
                  </div>
                </div>

                {/* Description */}
                {stage.description && (
                  <p className="text-[11px] text-zinc-400 italic bg-black/30 p-2 rounded border border-zinc-800/40">
                    &ldquo;{stage.description}&rdquo;
                  </p>
                )}

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveTreeStage(idx, 'UP')}
                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer text-xs"
                      title="Move Up"
                    >
                      ⬆️
                    </button>
                    <button
                      type="button"
                      disabled={idx === treeStages.length - 1}
                      onClick={() => handleMoveTreeStage(idx, 'DOWN')}
                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer text-xs"
                      title="Move Down"
                    >
                      ⬇️
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTreeStage(stage)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>✏️</span> Edit
                    </button>
                    <button
                      type="button"
                      disabled={treeStages.length <= 1}
                      onClick={() => handleDeleteTreeStage(stage.id)}
                      className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOM MISSIONS & PARTNER VIDEO/ADS MANAGER */}
      {activeTab === 'MISSIONS' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                <span>🎯</span> Custom Missions, Video Tasks & Partner Ads ({customMissions.length})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Create and manage custom player missions with live rewards. Add Watch Video tasks (YouTube links),
                Telegram channel joins, website partner visits, ads, or specific Botanical Card upgrade assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddMission}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded transition flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
            >
              <span>➕</span> Add New Mission / Video Task
            </button>
          </div>

          {customMissions.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-400 text-xs space-y-3">
              <span className="text-3xl block">🎯</span>
              <p>No custom missions published yet. Add your first YouTube video task, partner link, or card challenge!</p>
              <button
                type="button"
                onClick={handleOpenAddMission}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>➕</span> Create First Mission
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customMissions.map((m) => (
                <div
                  key={m.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-zinc-700 transition relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-black/60 rounded-lg border border-zinc-800">
                          {m.icon || '🎯'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                              {m.category || 'DAILY'}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-bold">
                              {m.reqType}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{m.title}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono block">By {m.contractor}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>

                    {m.externalUrl && (
                      <div className="bg-black/50 p-2 rounded border border-zinc-800 font-mono text-[10px] space-y-1">
                        <div className="text-zinc-500 uppercase">Target Link / Video:</div>
                        <a
                          href={m.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline truncate block"
                        >
                          🔗 {m.externalUrl}
                        </a>
                        {m.buttonLabel && (
                          <div className="text-zinc-400">
                            Button: <strong className="text-white">{m.buttonLabel}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {m.targetCardId && (
                      <div className="bg-black/50 p-1.5 rounded border border-zinc-800 font-mono text-[10px] text-amber-300">
                        Target Card ID: <strong>{m.targetCardId}</strong>
                      </div>
                    )}

                    {/* Rewards Summary */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[10px]">
                      {m.rewardGreen ? (
                        <span className="text-emerald-400 font-bold">🌿 +{m.rewardGreen} GREEN</span>
                      ) : null}
                      {m.rewardSparks ? (
                        <span className="text-cyan-300 font-bold">⚡ +{m.rewardSparks} Sparks</span>
                      ) : null}
                      {m.rewardCredits ? (
                        <span className="text-amber-400 font-bold">🏆 +{m.rewardCredits} Credits</span>
                      ) : null}
                      {m.rewardCash ? (
                        <span className="text-zinc-300 font-bold">+${m.rewardCash.toLocaleString()}</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80 mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMission(m)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>✏️</span> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMission(m.id)}
                      className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT BOTANICAL CARD */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>🌱</span> {editingCard ? 'Edit Botanical Card' : 'Create New Botanical Card'}
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Card Title / Name</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="e.g. Ancient Redwood Sentinel"
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Flavor Description</label>
                <textarea
                  value={cardFlavor}
                  onChange={(e) => setCardFlavor(e.target.value)}
                  placeholder="Biological lore description..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Section / Category</label>
                  <select
                    value={cardCategory}
                    onChange={(e) => setCardCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                  >
                    {catalog.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={cardBadge}
                    onChange={(e) => setCardBadge(e.target.value)}
                    placeholder="e.g. Titan, Spore, Canopy"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Base Cost (Sparks)</label>
                  <input
                    type="number"
                    min="1"
                    value={cardCost}
                    onChange={(e) => setCardCost(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Sparks / Sec</label>
                  <input
                    type="number"
                    min="1"
                    value={cardSparks}
                    onChange={(e) => setCardSparks(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    value={cardIcon}
                    onChange={(e) => setCardIcon(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 text-center text-lg"
                  />
                </div>
              </div>

              {/* Prerequisite Setting */}
              <div className="bg-zinc-900/80 border border-amber-600/30 p-3 rounded-lg space-y-2 mt-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <span>🔒</span> Unlock Prerequisite Rule
                </div>
                <p className="text-[11px] text-zinc-400">
                  Operative must upgrade the selected card to this level before this card can be unlocked.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-zinc-400 mb-1">Required Card</label>
                    <select
                      value={cardReqId}
                      onChange={(e) => setCardReqId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-zinc-100 text-xs"
                    >
                      <option value="">None (Always Unlocked)</option>
                      {catalog.cards
                        .filter((c) => !editingCard || c.id !== editingCard.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Required Level</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={cardReqLevel}
                      onChange={(e) => setCardReqLevel(Number(e.target.value))}
                      disabled={!cardReqId}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-zinc-100 font-mono text-xs disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-bold transition"
                >
                  Save Botanical Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SECTION */}
      {showAddCatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>➕</span> Add New Botanical Section
              </h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Section Display Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Celestial Nebula Flora"
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Section ID</label>
                  <input
                    type="text"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="e.g. NEBULA"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Icon / Logo</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={newCatBadge}
                  onChange={(e) => setNewCatBadge(e.target.value)}
                  placeholder="e.g. Tier 5"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-bold transition"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ITEM WITH PREREQUISITE */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-cyan-500/50 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span>🛒</span> {editingItem ? 'Edit Bazaar Item' : 'Add New Item To Bazaar'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Hyper-Chlorophyll Vaporizer"
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Item specifications and benefits..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                  >
                    <option value="TOOL">TOOL</option>
                    <option value="WEAPON">WEAPON</option>
                    <option value="ARMOR">ARMOR</option>
                    <option value="FOOD">FOOD</option>
                    <option value="MEDICAL">MEDICAL</option>
                    <option value="CONTRABAND">CONTRABAND</option>
                    <option value="LUXURY">LUXURY</option>
                    <option value="ENHANCER">ENHANCER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Price (🌿 GREEN)</label>
                  <input
                    type="number"
                    min="1"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    value={itemIcon}
                    onChange={(e) => setItemIcon(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 text-center text-lg"
                  />
                </div>
              </div>

              {/* Prerequisite Setting */}
              <div className="bg-zinc-900/80 border border-amber-600/30 p-3 rounded-lg space-y-2 mt-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <span>🔒</span> Purchase Prerequisite Rule
                </div>
                <p className="text-[11px] text-zinc-400">
                  Operative must unlock the specified Botanical Card to this level in order to purchase this item!
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-zinc-400 mb-1">Required Botanical Card</label>
                    <select
                      value={itemReqCardId}
                      onChange={(e) => setItemReqCardId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-zinc-100 text-xs"
                    >
                      <option value="">None (Open to all)</option>
                      {catalog.cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Required Level</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={itemReqCardLevel}
                      onChange={(e) => setItemReqCardLevel(Number(e.target.value))}
                      disabled={!itemReqCardId}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-zinc-100 font-mono text-xs disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded font-bold transition"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TREE EVOLUTION STAGE */}
      {showTreeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>🌳</span> {editingTreeStage ? 'Edit Tree Evolution Stage' : 'Create New Evolution Stage'}
              </h3>
              <button
                onClick={() => setShowTreeModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTreeStage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Stage ID (Unique)</label>
                  <input
                    type="text"
                    required
                    value={treeId}
                    onChange={(e) => setTreeId(e.target.value)}
                    placeholder="e.g. tree_sakura"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Stage Icon / Emoji</label>
                  <input
                    type="text"
                    required
                    value={treeIcon}
                    onChange={(e) => setTreeIcon(e.target.value)}
                    placeholder="e.g. 🌸"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Stage Name</label>
                <input
                  type="text"
                  required
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  placeholder="e.g. Luminescent Sakura Canopy"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Bonus Label</label>
                  <input
                    type="text"
                    required
                    value={treeBonus}
                    onChange={(e) => setTreeBonus(e.target.value)}
                    placeholder="e.g. +75/tap"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Base Sparks Per Tap</label>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    required
                    value={treeSparksPerTap}
                    onChange={(e) => setTreeSparksPerTap(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-cyan-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Multiplier (x)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="1000"
                    required
                    value={treeMultiplier}
                    onChange={(e) => setTreeMultiplier(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Unlock Cost (Sparks)</label>
                  <input
                    type="number"
                    min="0"
                    value={treeUnlockSparks}
                    onChange={(e) => setTreeUnlockSparks(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Unlock Cost (GREEN)</label>
                  <input
                    type="number"
                    min="0"
                    value={treeUnlockGreen}
                    onChange={(e) => setTreeUnlockGreen(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Botanical Lore & Description</label>
                <textarea
                  rows={2}
                  value={treeDescription}
                  onChange={(e) => setTreeDescription(e.target.value)}
                  placeholder="Atmospheric botanical description of this evolution tier..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-300 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTreeModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2 rounded font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  {editingTreeStage ? 'Update Stage' : 'Save Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CUSTOM MISSION & VIDEO TASK */}
      {showMissionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span> {editingMission ? 'Edit Mission / Video Task' : 'Publish New Mission / Video Task'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMissionModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Mission Title</label>
                  <input
                    type="text"
                    required
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="e.g. Watch Syndicate Intel Briefing"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Contractor / Sponsor</label>
                  <input
                    type="text"
                    required
                    value={missionContractor}
                    onChange={(e) => setMissionContractor(e.target.value)}
                    placeholder="e.g. YouTube Sponsor, Neon Syndicate"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={missionCategory}
                    onChange={(e) => setMissionCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                  >
                    <option value="DAILY">📅 Daily (24h)</option>
                    <option value="WEEKLY">📆 Weekly (7d)</option>
                    <option value="MONTHLY">🏆 Monthly (30d)</option>
                    <option value="STORY">📜 Story Milestone</option>
                    <option value="PARTNER">📺 Video & Partner Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Requirement Type</label>
                  <select
                    value={missionReqType}
                    onChange={(e) => setMissionReqType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-emerald-400 font-bold"
                  >
                    <option value="WATCH_VIDEO">▶️ Watch Video (YouTube / Link)</option>
                    <option value="EXTERNAL_LINK">🔗 Open Website / Telegram / Ad</option>
                    <option value="CARD_UPGRADE">🃏 Buy / Upgrade Botanical Card</option>
                    <option value="TAP">🌿 Tap Green Mint Coin</option>
                    <option value="TREE_EVOLVE">🌳 Tree Stage Evolution</option>
                    <option value="CRIME">🕵️ Commit Crimes</option>
                    <option value="CASINO">🎰 Casino Wager</option>
                    <option value="REFERRAL">👥 Syndicate Recruits</option>
                    <option value="LEVEL">🎖️ Reach Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Target Count</label>
                  <input
                    type="number"
                    min="1"
                    value={missionTargetCount}
                    onChange={(e) => setMissionTargetCount(Number(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Video / Link URL configuration */}
              {(missionReqType === 'WATCH_VIDEO' || missionReqType === 'EXTERNAL_LINK') && (
                <div className="p-3 bg-zinc-900/80 border border-cyan-500/30 rounded-lg space-y-2">
                  <div className="text-cyan-400 font-bold text-[11px] flex items-center gap-1.5">
                    <span>{missionReqType === 'WATCH_VIDEO' ? '▶️' : '🔗'}</span>
                    <span>Video URL / External Destination Link</span>
                  </div>
                  <div>
                    <input
                      type="url"
                      value={missionExternalUrl}
                      onChange={(e) => setMissionExternalUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://t.me/your_channel"
                      className="w-full bg-black/60 border border-zinc-700 rounded p-2 text-zinc-100 font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-400 text-[10px] mb-0.5">Button Display Text</label>
                      <input
                        type="text"
                        value={missionButtonLabel}
                        onChange={(e) => setMissionButtonLabel(e.target.value)}
                        placeholder="e.g. ▶️ Watch on YouTube"
                        className="w-full bg-black/60 border border-zinc-700 rounded p-1.5 text-zinc-100 text-xs"
                      />
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center">
                      Operatives tap this button to open the link & automatically unlock rewards!
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Card Requirement */}
              {missionReqType === 'CARD_UPGRADE' && (
                <div className="p-3 bg-zinc-900/80 border border-amber-500/30 rounded-lg space-y-1.5">
                  <label className="block text-amber-400 font-bold text-[11px]">
                    Specific Botanical Card Required (Optional)
                  </label>
                  <select
                    value={missionTargetCardId}
                    onChange={(e) => setMissionTargetCardId(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-700 rounded p-2 text-zinc-100 text-xs"
                  >
                    <option value="">Any Botanical Card (Generic Upgrade)</option>
                    {(catalog.cards || []).map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.icon} {card.title} ({card.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1">Description / Assignment Details</label>
                <textarea
                  rows={2}
                  value={missionDesc}
                  onChange={(e) => setMissionDesc(e.target.value)}
                  placeholder="Explain what the operative must do to complete this mission..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 resize-none"
                />
              </div>

              {/* Rewards Grid */}
              <div className="border border-zinc-800 rounded-lg p-3 bg-black/40 space-y-2">
                <span className="text-[11px] font-bold text-zinc-300 block uppercase font-mono">
                  Mission Rewards Granted
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-emerald-400 text-[10px] mb-0.5">🌿 GREEN Tokens</label>
                    <input
                      type="number"
                      min="0"
                      value={missionRewardGreen}
                      onChange={(e) => setMissionRewardGreen(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-emerald-400 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-300 text-[10px] mb-0.5">⚡ Sparks</label>
                    <input
                      type="number"
                      min="0"
                      value={missionRewardSparks}
                      onChange={(e) => setMissionRewardSparks(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-cyan-300 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-400 text-[10px] mb-0.5">🏆 Mission Credits</label>
                    <input
                      type="number"
                      min="0"
                      value={missionRewardCredits}
                      onChange={(e) => setMissionRewardCredits(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-amber-400 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-[10px] mb-0.5">💵 Cash ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={missionRewardCash}
                      onChange={(e) => setMissionRewardCash(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-zinc-100 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <label className="text-zinc-400 text-[11px]">Icon:</label>
                  <input
                    type="text"
                    value={missionIcon}
                    onChange={(e) => setMissionIcon(e.target.value)}
                    className="w-12 bg-zinc-900 border border-zinc-700 rounded p-1 text-center text-base"
                  />
                  <div className="flex gap-1">
                    {['🎥', '📺', '🔗', '🌿', '🃏', '💰', '👑', '✈️'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setMissionIcon(em)}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-xs cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMissionModal(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2 rounded font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    {editingMission ? 'Update Mission' : 'Publish Mission'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAYER */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-emerald-500/50 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                Edit Operative: {editingPlayer.email}
              </h3>
              <button
                onClick={() => setEditingPlayer(null)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Operative Name</label>
                <input
                  type="text"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Referral Code</label>
                <input
                  type="text"
                  value={editPlayerReferral}
                  onChange={(e) => setEditPlayerReferral(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-100 font-mono"
                />
              </div>

              <div className="bg-zinc-900 p-3 rounded space-y-1 font-mono text-[11px] text-zinc-400">
                <div>User ID: {editingPlayer.userId}</div>
                <div>Recruited By: {editingPlayer.referredBy}</div>
                <div>Total Recruits: {editingPlayer.recruitsCount}</div>
                <div>Password Hash: {editingPlayer.passwordHash}</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlayer}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-bold transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
