'use client';

import React, { useState, useEffect } from 'react';
import {
  loadCatalogData,
  saveCatalogData,
  DynamicCatalogData,
  BotanicalCardDef,
  BotanicalCategoryDef,
  DynamicItemDef,
} from '../gameCatalog';
import { SoundEngine } from '../gameAudio';
import { useGame } from '../GameContext';

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
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'CARDS' | 'ITEMS'>('PLAYERS');
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Catalog State
  const [catalog, setCatalog] = useState<DynamicCatalogData>({
    categories: [],
    cards: [],
    customItems: [],
  });

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
                  <span className="text-base">{cat.icon}</span>
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
                            <span className="text-xl bg-zinc-800 p-1.5 rounded border border-zinc-700">{c.icon}</span>
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
                              <span className="text-xl bg-zinc-800 p-1.5 rounded border border-zinc-700">
                                {item.icon}
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
