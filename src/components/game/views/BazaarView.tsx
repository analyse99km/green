'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // New listing form state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [listingPrice, setListingPrice] = useState<string>('500');
  const [listingQty, setListingQty] = useState<string>('1');

  const categories = ['ALL', 'WEAPON', 'ARMOR', 'FOOD', 'MEDICAL', 'CONTRABAND', 'TOOL', 'LUXURY'];

  const isMyListing = (l: (typeof bazaarListings)[0]) => l.sellerId === player.id;

  const filteredListings = bazaarListings.filter((l) => {
    if (l.status === 'FINALIZED' || l.quantity <= 0) return false;
    const matchesSearch = l.item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || l.item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const playerBazaarItems = bazaarListings.filter((l) => isMyListing(l));

  const handleBuy = (listingId: string) => {
    const res = buyBazaarListing(listingId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = syncP2PMesh();
      setIsSyncing(false);
      setFeedback(`P2P Sync Complete: Synced across ${res.syncedPeers} nodes. ${res.newlySettledTill > 0 ? `Claimed 🌿 ${res.newlySettledTill.toLocaleString()} GREEN newly settled proceeds!` : 'All listings up to date.'}`);
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

  const rarityColors: Record<string, string> = {
    COMMON: 'text-neutral-400 border-neutral-700 bg-neutral-900',
    UNCOMMON: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    RARE: 'text-blue-400 border-blue-500/40 bg-blue-950/20',
    EPIC: 'text-purple-400 border-purple-500/50 bg-purple-950/30',
    LEGENDARY: 'text-amber-400 border-amber-500/60 bg-amber-950/40 ring-1 ring-amber-500/40',
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <h2 className="text-xl font-bold text-white">Item Market & Player Bazaars</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              The free-market trading exchange of Neon Metropolis. Browse rare weapon drops, gourmet nutrition, and
              contraband listed by other syndicate operatives. Open your own <strong>Personal Bazaar</strong> to sell crime loot!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 text-xs font-bold font-mono">
            <button
              onClick={() => setActiveTab('MARKET')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'MARKET' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Global Market ({bazaarListings.length})
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
          {/* P2P Mesh Quorum Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-neutral-900 border border-neutral-800 p-3 px-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-300 font-bold">
                P2P Replicated Ledger: <span className="text-emerald-400">8/8 Mesh Quorum Active</span>
              </span>
              <span className="text-neutral-500 text-[11px] hidden sm:inline">• Offline-first decentralized state</span>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 hover:border-cyan-500 text-cyan-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isSyncing ? 'Syncing Mesh...' : 'Sync Peer Mesh'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search market by item name..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-neutral-100 text-neutral-950 font-bold border-neutral-100 shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-neutral-900 rounded-2xl border border-neutral-800 text-xs text-neutral-400 font-mono">
                No items match your search filter. Check back as traders restock!
              </div>
            ) : (
              filteredListings.map((listing) => {
                const canAfford = player.money >= listing.price;
                const rarity = listing.item.rarity || 'COMMON';
                const rarityStyle = rarityColors[rarity] || rarityColors.COMMON;

                return (
                  <div
                    key={listing.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${rarityStyle}`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                            {listing.item.icon}
                          </span>
                          <div>
                            <h4 className="font-bold text-white text-sm">{listing.item.name}</h4>
                            <span className="text-[10px] uppercase font-mono text-neutral-400">
                              {listing.item.category} • {rarity}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-400 text-sm bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                          x{listing.quantity}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 my-3 leading-relaxed font-sans">
                        {listing.item.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-800/80">
                        <div className="flex items-center gap-1.5">
                          {listing.sellerId === player.id ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-500/30 font-mono font-bold">
                              🔵 Your Listing
                            </span>
                          ) : !listing.sellerId.startsWith('trader_') ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Peer: {listing.sellerName}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                              Merchant: {listing.sellerName}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">
                          🌿 {listing.price.toLocaleString()} GREEN
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/90 pt-1.5">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-cyan-400" />
                          <span>8/8 Quorum Confirmed</span>
                        </span>
                        <span className="text-neutral-500 truncate max-w-[110px]">
                          {listing.signature ? listing.signature.substring(0, 14) + '...' : 'Signed'}
                        </span>
                      </div>
                    </div>

                    {listing.sellerId === player.id ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('MY_BAZAAR')}
                        className="w-full mt-4 py-2 rounded-xl text-xs font-bold font-mono bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 cursor-pointer shadow transition-all"
                      >
                        Your Listing (Manage in My Stall)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(listing.id)}
                        className={`w-full mt-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {canAfford
                          ? `Buy for 🌿 ${listing.price.toLocaleString()} GREEN`
                          : `Need 🌿 ${listing.price.toLocaleString()} GREEN (Inspect)`}
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
              <span className="font-mono text-lg font-bold text-emerald-400">
                🌿 {player.bazaarTillCash.toLocaleString()} GREEN
              </span>
              <button
                onClick={handleCollectTill}
                disabled={player.bazaarTillCash <= 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  player.bazaarTillCash > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                Collect Cash Till
              </button>
            </div>
          </div>

          {/* P2P Replay Protection Info Ribbon */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Shield className="w-3.5 h-3.5" /> Replay Defense Active:
            </span>
            <span>
              {(player.settledReceiptIds?.length || 0)} Settled Receipts Verified (No duplicate money or popups)
            </span>
          </div>

          {/* List an Item for Sale Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-400" /> Put Item Up For Sale
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">SELECT INVENTORY ITEM:</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                >
                  <option value="">-- Choose Item from Backpack --</option>
                  {player.inventory
                    .filter((i) => i.quantity > 0)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (x{item.quantity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">ASKING PRICE (🌿 GREEN EACH):</label>
                <input
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">QUANTITY TO SELL:</label>
                <input
                  type="number"
                  value={listingQty}
                  onChange={(e) => setListingQty(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="1"
                />
              </div>
            </div>

            <button
              onClick={handleCreateListing}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs font-mono shadow transition-all cursor-pointer"
            >
              List Item in Your Bazaar Stall
            </button>
          </div>

          {/* Current Active Player Listings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Your Active Bazaar Listings ({playerBazaarItems.length})
            </h3>

            {playerBazaarItems.length === 0 ? (
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center text-xs text-neutral-500 font-mono">
                You have no items listed in your bazaar. Select an item above to start earning revenue!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {playerBazaarItems.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{listing.item.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-xs">{listing.item.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {listing.quantity}x @ 🌿 {listing.price.toLocaleString()} GREEN each
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-rose-950 border border-neutral-800 hover:border-rose-500/50 text-rose-400 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
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
