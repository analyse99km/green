'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import {
  ShoppingBag,
  Store,
  DollarSign,
  Search,
  Sparkles,
  Tag,
  PlusCircle,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Shield,
  RefreshCw,
  Lock,
  X,
  Swords,
  Heart,
  Zap,
  Utensils,
  Crosshair,
} from 'lucide-react';
import DynamicIcon from '../DynamicIcon';
import { loadCatalogData, syncCatalogFromServer, DynamicCatalogData, DynamicItemDef } from '../gameCatalog';
import { formatCompactNumber, CURRENCY_ICONS } from '../formatters';
import { BazaarListing, InventoryItem } from '../types';

export default function BazaarView() {
  const {
    player,
    bazaarListings,
    buyBazaarListing,
    createBazaarListing,
    removeBazaarListing,
    collectBazaarTill,
    syncP2PMesh,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_BAZAAR'>('MARKET');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic catalog state synced with admin console
  const [catalog, setCatalog] = useState<DynamicCatalogData>({
    categories: [],
    cards: [],
    customItems: [],
  });

  useEffect(() => {
    const data = loadCatalogData();
    setCatalog(data);
    syncCatalogFromServer()
      .then((remoteData) => {
        if (remoteData?.customItems?.length) {
          setCatalog(remoteData);
        }
      })
      .catch(() => {});
  }, []);

  // New listing form state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [listingPrice, setListingPrice] = useState<string>('500');
  const [listingQty, setListingQty] = useState<string>('1');

  const categories = ['ALL', 'WEAPON', 'ARMOR', 'FOOD', 'MEDICAL', 'CONTRABAND', 'TOOL', 'LUXURY'];
  const alignments = ['ALL', 'CRIME', 'GOOD', 'NEUTRAL'];

  // Convert catalog custom items into market listings
  const catalogListings: BazaarListing[] = (catalog.customItems || []).map((item) => ({
    id: `cat_item_${item.id}`,
    sellerId: item.alignment === 'CRIME' ? 'black_market_broker' : item.alignment === 'GOOD' ? 'police_bureau' : 'syndicate_bazaar',
    sellerName: item.alignment === 'CRIME' ? '🕶️ Underworld Black Market' : item.alignment === 'GOOD' ? '⚖️ Municipal Police Bureau' : '🛒 Syndicate Global Bazaar',
    price: item.price,
    quantity: 99,
    status: 'ACTIVE',
    quorumNodes: 8,
    signature: `verified_catalog_${item.id}`,
    item: {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      alignment: item.alignment,
      price: item.price,
      marketValue: item.marketValue || item.price,
      shopliftDifficulty: item.shopliftDifficulty || 50,
      damage: item.damage,
      accuracy: item.accuracy,
      defense: item.defense,
      energyRestore: item.energyRestore,
      happyRestore: item.happyRestore,
      lifeRestore: item.lifeRestore,
      foodRestore: item.foodRestore,
      synergy: item.synergy,
      ammo: item.ammo,
      concealment: item.concealment,
      durability: item.durability,
      forgePrice: item.forgePrice,
      forgeSparksPrice: item.forgeSparksPrice,
      forgeDamageBonus: item.forgeDamageBonus,
      forgeAccuracyBonus: item.forgeAccuracyBonus,
      forgeDefenseBonus: item.forgeDefenseBonus,
      icon: item.icon,
      quantity: 1,
      isCloudItem: true,
    },
  }));

  // Combine official catalog items with player peer listings (avoiding duplicates)
  const allMarketListings: BazaarListing[] = [
    ...catalogListings,
    ...bazaarListings.filter(
      (l) => !catalogListings.some((c) => c.item.name.toLowerCase() === l.item.name.toLowerCase())
    ),
  ];

  const isMyListing = (l: BazaarListing) => l.sellerId === player.id;

  const filteredListings = allMarketListings.filter((l) => {
    if (l.status === 'FINALIZED' || l.quantity <= 0) return false;
    const matchesSearch =
      l.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.item.synergy && l.item.synergy.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || l.item.category === selectedCategory;
    const itemAlign = l.item.alignment || 'NEUTRAL';
    const matchesAlign = selectedAlignment === 'ALL' || itemAlign === selectedAlignment;
    return matchesSearch && matchesCat && matchesAlign;
  });

  const playerBazaarItems = bazaarListings.filter((l) => isMyListing(l));

  const handleBuy = (listingId: string) => {
    const res = buyBazaarListing(listingId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSync = () => {
    setIsSyncing(true);
    syncCatalogFromServer()
      .then((remoteData) => {
        if (remoteData?.customItems) setCatalog(remoteData);
      })
      .catch(() => {});

    setTimeout(() => {
      const res = syncP2PMesh();
      setIsSyncing(false);
      setFeedback(
        `Mesh Sync Complete: Synced across ${res.syncedPeers} nodes. ${
          res.newlySettledTill > 0
            ? `Claimed ${CURRENCY_ICONS.GREEN} ${formatCompactNumber(res.newlySettledTill)} GREEN newly settled proceeds!`
            : 'All items and peer listings up to date.'
        }`
      );
      setTimeout(() => setFeedback(null), 4000);
    }, 600);
  };

  const handleCreateListing = () => {
    if (!selectedItemId) {
      setFeedback('Select an item from your inventory to list.');
      return;
    }
    const price = parseInt(listingPrice, 10);
    const qty = parseInt(listingQty, 10);
    const res = createBazaarListing(selectedItemId, price, qty);
    setFeedback(res.message);
    setSelectedItemId('');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemove = (listingId: string) => {
    const res = removeBazaarListing(listingId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCollectTill = () => {
    const res = collectBazaarTill();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <h2 className="text-xl font-bold text-white">Item Market & Player Bazaars</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              The free-market trading exchange of Neon Metropolis. Browse rare weapons, tactical armor, gourmet nutrition,
              and contraband managed directly from the Admin Controller. Open your own <strong>Personal Bazaar</strong> to sell crime loot!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 text-xs font-bold font-mono">
            <button
              onClick={() => setActiveTab('MARKET')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'MARKET' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Global Market ({allMarketListings.length})
            </button>
            <button
              onClick={() => setActiveTab('MY_BAZAAR')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'MY_BAZAAR' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>My Bazaar ({playerBazaarItems.length})</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-amber-500/40 text-amber-300 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* TAB 1: Global Item Market */}
      {activeTab === 'MARKET' && (
        <div className="space-y-4">
          {/* Header Controls Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-neutral-900 border border-neutral-800 p-3 px-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-300 font-bold">
                Live Exchange Mesh: <span className="text-emerald-400">{allMarketListings.length} Verified Goods</span>
              </span>
              <span className="text-neutral-500 text-[11px] hidden sm:inline">• Real-time Admin Controller Sync</span>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 hover:border-cyan-500 text-cyan-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isSyncing ? 'Syncing Catalog...' : 'Refresh Market'}</span>
            </button>
          </div>

          {/* Search & Alignment / Category Filter Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items by name, description, or synergy..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* Alignment Filter Pills */}
              <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono font-bold shrink-0">
                <button
                  onClick={() => setSelectedAlignment('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedAlignment === 'ALL'
                      ? 'bg-neutral-800 text-white font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All Factions
                </button>
                <button
                  onClick={() => setSelectedAlignment('CRIME')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    selectedAlignment === 'CRIME'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50 shadow font-black'
                      : 'text-rose-400/70 hover:text-rose-300'
                  }`}
                >
                  <span>🔴</span> Crime
                </button>
                <button
                  onClick={() => setSelectedAlignment('GOOD')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    selectedAlignment === 'GOOD'
                      ? 'bg-blue-950 text-blue-300 border border-blue-500/50 shadow font-black'
                      : 'text-blue-400/70 hover:text-blue-300'
                  }`}
                >
                  <span>🔵</span> Good/Legal
                </button>
              </div>
            </div>

            {/* Category Filter Horizontal Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid (Compact, Space-Efficient 2-in-a-row on mobile, 3-in-a-row on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredListings.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-neutral-900 rounded-2xl border border-neutral-800 text-xs text-neutral-400 font-mono">
                No items match your search filter. Adjust category or alignment!
              </div>
            ) : (
              filteredListings.map((listing) => {
                const canAfford = player.money >= listing.price;
                const isCrime = listing.item.alignment === 'CRIME';
                const isGood = listing.item.alignment === 'GOOD';

                return (
                  <div
                    key={listing.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative overflow-hidden bg-neutral-900/90 ${
                      isCrime
                        ? 'border-rose-900/40 hover:border-rose-600/70'
                        : isGood
                        ? 'border-blue-900/40 hover:border-blue-600/70'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      {/* Top Header: Icon + Name + Alignment Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-12 h-12 p-1 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                            <DynamicIcon
                              icon={listing.item.icon}
                              alt={listing.item.name}
                              imgClassName="w-8 h-8 object-contain rounded"
                              className="text-2xl"
                              fallback="📦"
                            />
                          </span>
                          <div>
                            <h4 className="font-bold text-white text-sm leading-tight">{listing.item.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 uppercase">
                                {listing.item.category}
                              </span>
                              {isCrime && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-600/50">
                                  🔴 CRIME
                                </span>
                              )}
                              {isGood && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/50">
                                  🔵 GOOD / LEGAL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-emerald-400 text-xs bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 shrink-0">
                          x{listing.quantity}
                        </span>
                      </div>

                      {/* Flavor Description */}
                      <p className="text-xs text-neutral-300 my-2.5 leading-relaxed font-sans line-clamp-2">
                        {listing.item.description}
                      </p>

                      {/* Combat / Defensive / Nutritional Spec Badges */}
                      <div className="flex flex-wrap gap-1.5 my-2 text-[10px] font-mono">
                        {listing.item.damage !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 font-bold flex items-center gap-1">
                            <Swords className="w-3 h-3" /> DMG: {listing.item.damage}
                          </span>
                        )}
                        {listing.item.accuracy !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-bold flex items-center gap-1">
                            <Crosshair className="w-3 h-3" /> ACC: {listing.item.accuracy}%
                          </span>
                        )}
                        {listing.item.defense !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3" /> DEF: +{listing.item.defense}
                          </span>
                        )}
                        {listing.item.foodRestore !== undefined && listing.item.foodRestore > 0 && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-bold flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> Food: +{listing.item.foodRestore}
                          </span>
                        )}
                        {listing.item.energyRestore !== undefined && listing.item.energyRestore > 0 && (
                          <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Energy: +{listing.item.energyRestore}
                          </span>
                        )}
                        {listing.item.lifeRestore !== undefined && listing.item.lifeRestore > 0 && (
                          <span className="px-2 py-0.5 rounded bg-pink-950/60 border border-pink-800/40 text-pink-300 font-bold flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Heal: +{listing.item.lifeRestore} HP
                          </span>
                        )}
                        {listing.item.ammo && (
                          <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                            Ammo: {listing.item.ammo}
                          </span>
                        )}
                        {listing.item.concealment && (
                          <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                            Conceal: {listing.item.concealment}
                          </span>
                        )}
                      </div>

                      {/* Synergy Highlight Box */}
                      {listing.item.synergy && (
                        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/95 leading-snug my-2">
                          <span className="font-bold text-amber-400 block mb-0.5">⚡ Synergy Perk</span>
                          {listing.item.synergy}
                        </div>
                      )}

                      {/* Seller Tag & Price */}
                      <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-800">
                        <span className="text-[10px] text-neutral-400 truncate max-w-[160px]">
                          {listing.sellerName}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-emerald-400 text-sm">
                          <span>{CURRENCY_ICONS.GREEN}</span>
                          <span>{formatCompactNumber(listing.price)}</span>
                          <span className="text-[10px] font-normal text-emerald-500">GREEN</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {listing.sellerId === player.id ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('MY_BAZAAR')}
                        className="w-full mt-3 py-2 rounded-xl text-xs font-bold font-mono bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 cursor-pointer shadow transition-all"
                      >
                        Your Listing (Manage in My Stall)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(listing.id)}
                        className={`w-full mt-3 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <span>{canAfford ? 'Buy Now' : 'Need Funds'}</span>
                        <span className="font-normal opacity-90">
                          ({CURRENCY_ICONS.GREEN} {formatCompactNumber(listing.price)})
                        </span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Player's Personal Bazaar */}
      {activeTab === 'MY_BAZAAR' && (
        <div className="space-y-6">
          {/* Bazaar Till Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Your Bazaar Cash Register Till</h3>
                <p className="text-xs text-neutral-400">
                  Revenue accumulated from other citizens purchasing items from your market stall.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-emerald-400 flex items-center gap-1">
                <span>{CURRENCY_ICONS.GREEN}</span>
                <span>{formatCompactNumber(player.bazaarTillCash || 0)} GREEN</span>
              </span>
              <button
                onClick={handleCollectTill}
                disabled={(player.bazaarTillCash || 0) <= 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  (player.bazaarTillCash || 0) > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                Collect Cash Till
              </button>
            </div>
          </div>

          {/* List an Item Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>List Item in Your Personal Bazaar</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Select Inventory Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                >
                  <option value="">-- Choose item to sell --</option>
                  {(player.inventory || [])
                    .filter((i) => i.quantity > 0)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (x{item.quantity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Asking Price (GREEN)</label>
                <input
                  type="number"
                  min="1"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={listingQty}
                  onChange={(e) => setListingQty(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCreateListing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow"
            >
              Post Listing to Global Exchange
            </button>
          </div>

          {/* Active Listings Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Your Active Stall Listings ({playerBazaarItems.length})</h3>

            {playerBazaarItems.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-4 text-center">
                You do not have any active items listed in your bazaar.
              </p>
            ) : (
              <div className="space-y-2">
                {playerBazaarItems.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{listing.item.icon || '📦'}</span>
                      <div>
                        <div className="font-bold text-white">{listing.item.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Asking: {CURRENCY_ICONS.GREEN} {formatCompactNumber(listing.price)} GREEN • Qty: {listing.quantity}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800/50 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
