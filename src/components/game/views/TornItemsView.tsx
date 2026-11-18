'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { STORE_ITEMS } from '../gameData';
import {
  Package,
  ShoppingBag,
  EyeOff,
  Shield,
  ShieldCheck,
  Sparkles,
  Check,
  Utensils,
  HeartPulse,
  Zap,
  Smile,
  Hammer,
  CloudDownload,
  Flame,
  ArrowUpCircle,
  X,
  Target,
  Swords,
} from 'lucide-react';
import { InventoryItem } from '../types';
import DynamicIcon from '../DynamicIcon';
import { loadCatalogData, syncCatalogFromServer, DynamicCatalogData } from '../gameCatalog';

export default function TornItemsView() {
  const { player, buyItem, shopliftItem, consumeItem, upgradeItemInForge, syncCloudItems } = useGame();
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'SHOP' | 'FORGE'>('INVENTORY');
  const [selectedForgeItemId, setSelectedForgeItemId] = useState<string>('');
  const [useSparksForForge, setUseSparksForForge] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastItemAction, setLastItemAction] = useState<{
    itemId: string;
    message: string;
    success: boolean;
  } | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [catalog, setCatalog] = useState<DynamicCatalogData>(() => loadCatalogData());

  useEffect(() => {
    syncCatalogFromServer((updated) => setCatalog(updated));
    const interval = setInterval(() => {
      syncCatalogFromServer((updated) => setCatalog(updated));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = (item: InventoryItem) => {
    const res = buyItem(item);
    setFeedback(res.message);
    setLastItemAction({ itemId: item.id, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleShoplift = (item: InventoryItem) => {
    const res = shopliftItem(item);
    setFeedback(res.message);
    setLastItemAction({ itemId: item.id, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConsume = (item: InventoryItem) => {
    const res = consumeItem(item.id);
    setFeedback(res.message);
    setLastItemAction({ itemId: item.id, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleForge = () => {
    if (!selectedForgeItemId) {
      setFeedback('Select a weapon or armor piece to upgrade.');
      return;
    }
    const res = upgradeItemInForge(selectedForgeItemId, useSparksForForge);
    setFeedback(res.message);
    setLastItemAction({ itemId: selectedForgeItemId, message: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSyncCloud = async () => {
    setIsSyncingCloud(true);
    await syncCatalogFromServer((updated) => setCatalog(updated));
    const res = await syncCloudItems();
    setIsSyncingCloud(false);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  const rawShopList = (catalog.customItems && catalog.customItems.length > 0)
    ? catalog.customItems
    : STORE_ITEMS;

  const shopItems: InventoryItem[] = rawShopList.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    marketValue: item.marketValue ?? item.price,
    shopliftDifficulty: item.shopliftDifficulty ?? 40,
    icon: item.icon,
    quantity: 1,
    damage: item.damage,
    accuracy: item.accuracy,
    defense: item.defense,
    foodRestore: item.foodRestore,
    energyRestore: item.energyRestore,
    happyRestore: item.happyRestore,
    lifeRestore: item.lifeRestore,
    usableIn: item.usableIn,
    statBonus: (item as any).statBonus,
    perkDescription: item.perkDescription,
    forgePrice: item.forgePrice,
    forgeSparksPrice: item.forgeSparksPrice,
    forgeDamageBonus: item.forgeDamageBonus,
    forgeAccuracyBonus: item.forgeAccuracyBonus,
    forgeDefenseBonus: item.forgeDefenseBonus,
    requiredCardId: item.requiredCardId,
    requiredCardLevel: item.requiredCardLevel,
  }));

  const selectedForgeItem = player.inventory.find((i) => i.id === selectedForgeItemId);
  const forgeableItems = player.inventory.filter((i) => i.category === 'WEAPON' || i.category === 'ARMOR' || i.category === 'TOOL');

  return (
    <div className="space-y-6">
      {/* Items & Store Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎒</span>
              <h2 className="text-xl font-bold text-white">Tactical Inventory & Municipal Outfitter</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Equip combat weapons, armor, and enhancer gear. Consume chef-crafted nutrition to restore Energy &
              Happy, or buy emergency medical sutures. Buy legally or attempt a <strong>shoplift exploit</strong>!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('INVENTORY')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'INVENTORY' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Backpack ({player.inventory.reduce((sum, i) => sum + i.quantity, 0)})
            </button>
            <button
              onClick={() => setActiveTab('SHOP')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'SHOP' ? 'bg-amber-600 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Municipal Store
            </button>
            <button
              onClick={() => setActiveTab('FORGE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'FORGE' ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-orange-400" />
              <span>Cyber Forge (+10)</span>
            </button>
            <button
              onClick={handleSyncCloud}
              disabled={isSyncingCloud}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-cyan-500 text-cyan-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Sync static cloud catalog drops"
            >
              <CloudDownload className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-bounce text-cyan-300' : ''}`} />
              <span className="hidden sm:inline">Sync Cloud</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-emerald-500/40 text-emerald-400 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Tab 1: Your Tactical Inventory */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {player.inventory.map((item) => {
              const isConsumable = item.category === 'FOOD' || item.category === 'MEDICAL';

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-neutral-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-12 h-12 p-1 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                          <DynamicIcon icon={item.icon} alt={item.name} imgClassName="w-8 h-8 object-contain rounded" className="text-3xl" fallback="📦" />
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.name}</h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-xs bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                        x{item.quantity}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 my-3 leading-relaxed">{item.description}</p>

                    {/* Stats & Restoration Bonuses */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono mb-3">
                      {item.damage && <span className="text-rose-400 font-bold">Dmg: {item.damage}</span>}
                      {item.accuracy && <span className="text-blue-400">Acc: {item.accuracy}</span>}
                      {item.defense && <span className="text-emerald-400 font-bold">Def: {item.defense}</span>}
                      {item.foodRestore && (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Utensils className="w-3 h-3" /> +{item.foodRestore} Food
                        </span>
                      )}
                      {item.energyRestore && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> +{item.energyRestore} Energy
                        </span>
                      )}
                      {item.happyRestore && (
                        <span className="text-blue-400 font-bold flex items-center gap-0.5">
                          <Smile className="w-3 h-3" /> +{item.happyRestore} Happy
                        </span>
                      )}
                      {item.lifeRestore && (
                        <span className="text-rose-400 font-bold flex items-center gap-0.5">
                          <HeartPulse className="w-3 h-3" /> +{item.lifeRestore} HP
                        </span>
                      )}
                      {item.perkDescription && <span className="text-amber-400">{item.perkDescription}</span>}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-neutral-800">
                    {/* Interactive Eat / Consume Button */}
                    {isConsumable && (
                      <button
                        onClick={() => handleConsume(item)}
                        className="w-full py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Eat / Consume ({item.name.split(' ')[0]})</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Market: 🌿 {item.marketValue.toLocaleString()} GREEN</span>
                      {item.equipped && <span className="text-emerald-400 font-bold">✓ Equipped</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Municipal Outfitter (Starter Stock) */}
      {activeTab === 'SHOP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopItems.map((item) => {
            const canAfford = player.money >= item.price;
            const shopliftOdds = Math.max(
              15,
              Math.min(
                90,
                Math.round(player.criminalSkills.shoplifting * 8 - (item.shopliftDifficulty || 35) * 0.4 + 40)
              )
            );
            const reqCard = item.requiredCardId ? catalog.cards.find((c) => c.id === item.requiredCardId) : null;
            const playerCardLevel = item.requiredCardId && (player as any).dreamCards?.[item.requiredCardId]?.level;
            const meetsCardReq = !item.requiredCardId || (playerCardLevel && playerCardLevel >= (item.requiredCardLevel || 1));

            return (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-12 h-12 p-1 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                        <DynamicIcon icon={item.icon} alt={item.name} imgClassName="w-8 h-8 object-contain rounded" className="text-3xl" fallback="📦" />
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      🌿 {item.price.toLocaleString()} GREEN
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 my-3 leading-relaxed">{item.description}</p>

                  {/* Rich Stat Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-mono mb-3">
                    {item.damage && (
                      <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 font-bold flex items-center gap-1">
                        <Swords className="w-3 h-3 text-rose-400" /> Dmg: {item.damage}
                      </span>
                    )}
                    {item.accuracy && (
                      <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40 flex items-center gap-1">
                        <Target className="w-3 h-3 text-blue-400" /> Aim: {item.accuracy}%
                      </span>
                    )}
                    {item.defense && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-bold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-400" /> Def: {item.defense}
                      </span>
                    )}
                    {item.foodRestore && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-bold flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-amber-400" /> +{item.foodRestore} Food
                      </span>
                    )}
                    {item.energyRestore && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" /> +{item.energyRestore} Energy
                      </span>
                    )}
                    {item.happyRestore && (
                      <span className="px-2 py-0.5 rounded bg-pink-950/40 text-pink-300 border border-pink-800/40 font-bold flex items-center gap-1">
                        <Smile className="w-3 h-3 text-pink-400" /> +{item.happyRestore} Happy
                      </span>
                    )}
                    {item.lifeRestore && (
                      <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/40 font-bold flex items-center gap-1">
                        ❤️ +{item.lifeRestore} HP
                      </span>
                    )}
                    {item.perkDescription && (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                        ✨ {item.perkDescription}
                      </span>
                    )}
                    {(item.forgePrice || item.forgeDamageBonus || item.forgeDefenseBonus) && (
                      <span className="px-2 py-0.5 rounded bg-orange-950/40 text-orange-300 border border-orange-800/40 text-[10px]">
                        🔨 Forge: 🌿{item.forgePrice ?? 250}{item.forgeDamageBonus ? ` (+${item.forgeDamageBonus} Dmg)` : ''}{item.forgeDefenseBonus ? ` (+${item.forgeDefenseBonus} Def)` : ''}
                      </span>
                    )}
                  </div>

                  {item.requiredCardId && (
                    <div className="mb-2">
                      {meetsCardReq ? (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          ✓ Card Requirement Met: {reqCard?.title || item.requiredCardId} Lvl {item.requiredCardLevel || 1}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          🔒 Requires {reqCard?.title || item.requiredCardId} Lvl {item.requiredCardLevel || 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || !meetsCardReq}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canAfford && meetsCardReq
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {!meetsCardReq
                      ? `Locked (Requires Card Lvl ${item.requiredCardLevel || 1})`
                      : `Buy Legitimately (🌿 ${item.price.toLocaleString()} GREEN)`}
                  </button>

                  <button
                    onClick={() => handleShoplift(item)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-neutral-950 hover:bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-all flex items-center justify-between px-3 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Try to Cheat / Shoplift</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">{shopliftOdds}% (10 Energy)</span>
                  </button>

                  {lastItemAction?.itemId === item.id && (
                    <div
                      className={`p-2 rounded-xl text-[11px] font-mono animate-fadeIn flex items-center gap-1.5 shadow ${
                        lastItemAction.success
                          ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/90 border border-rose-500/50 text-rose-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                      <span>{lastItemAction.message}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Cybernetic Weapon & Armor Forge */}
      {activeTab === 'FORGE' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-950/40 via-neutral-900 to-rose-950/40 border border-orange-500/40 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <Hammer className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Underworld Cybernetic Forge</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                Level up your weapons and armor from <strong>+1 to +10</strong>. Increases combat lethal damage (+15%/lvl),
                defense (+20%/lvl), and market resale value (+35%/lvl).
              </p>
            </div>

            <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 text-xs">
              <span className="text-[10px] text-neutral-500 block">Your Reserves</span>
              <span className="text-emerald-400 font-bold">🌿 {player.money.toLocaleString()} GREEN</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
            {/* Forge Control Panel */}
            <div className="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-orange-400" /> Select Item to Upgrade
              </h4>

              <select
                value={selectedForgeItemId}
                onChange={(e) => setSelectedForgeItemId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
              >
                <option value="">-- Choose Weapon / Armor from Backpack --</option>
                {forgeableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} [{item.category}] • Level +{item.upgradeLevel || 0}
                  </option>
                ))}
              </select>

              {selectedForgeItem ? (
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 p-1 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                        <DynamicIcon icon={selectedForgeItem.icon} alt={selectedForgeItem.name} imgClassName="w-8 h-8 object-contain rounded" className="text-3xl" fallback="📦" />
                      </span>
                      <div>
                        <h5 className="font-bold text-white text-sm">{selectedForgeItem.name}</h5>
                        <span className="text-[10px] text-orange-400 font-bold">
                          Current Tier: Level +{selectedForgeItem.upgradeLevel || 0} / 10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-800">
                    {selectedForgeItem.damage && (
                      <div className="bg-neutral-900 p-2 rounded-lg">
                        <span className="text-neutral-500 block text-[10px]">Damage</span>
                        <span className="text-rose-400 font-bold">
                          {selectedForgeItem.damage} → +{selectedForgeItem.forgeDamageBonus !== undefined ? Math.round((selectedForgeItem.damage + selectedForgeItem.forgeDamageBonus) * 10) / 10 : Math.round(selectedForgeItem.damage * 1.15 * 10) / 10}
                        </span>
                      </div>
                    )}
                    {selectedForgeItem.accuracy && (
                      <div className="bg-neutral-900 p-2 rounded-lg">
                        <span className="text-neutral-500 block text-[10px]">Aim / Accuracy</span>
                        <span className="text-blue-400 font-bold">
                          {selectedForgeItem.accuracy}% → {Math.min(99, selectedForgeItem.forgeAccuracyBonus !== undefined ? Math.round((selectedForgeItem.accuracy + selectedForgeItem.forgeAccuracyBonus) * 10) / 10 : Math.round(selectedForgeItem.accuracy * 1.05 * 10) / 10)}%
                        </span>
                      </div>
                    )}
                    {selectedForgeItem.defense && (
                      <div className="bg-neutral-900 p-2 rounded-lg">
                        <span className="text-neutral-500 block text-[10px]">Defense</span>
                        <span className="text-emerald-400 font-bold">
                          {selectedForgeItem.defense} → +{selectedForgeItem.forgeDefenseBonus !== undefined ? Math.round((selectedForgeItem.defense + selectedForgeItem.forgeDefenseBonus) * 10) / 10 : Math.round(selectedForgeItem.defense * 1.20 * 10) / 10}
                        </span>
                      </div>
                    )}
                    <div className="bg-neutral-900 p-2 rounded-lg col-span-2">
                      <span className="text-neutral-500 block text-[10px]">Market Value</span>
                      <span className="text-amber-400 font-bold">
                        🌿 {selectedForgeItem.marketValue.toLocaleString()} → +🌿 {Math.round(selectedForgeItem.marketValue * 1.35).toLocaleString()} GREEN
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Toggle: Liquid GREEN Cash vs Dream Sparks */}
                  <div className="pt-2">
                    <span className="text-[10px] text-neutral-400 block mb-1 font-mono uppercase tracking-wider">
                      SELECT UPGRADE PAYMENT METHOD:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Currency Option 1: Liquid GREEN Cash */}
                      <button
                        type="button"
                        onClick={() => setUseSparksForForge(false)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                          !useSparksForForge
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500 font-bold ring-2 ring-emerald-500/40 shadow-lg'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">Liquid Cash</span>
                        <span className="text-emerald-400 font-bold font-mono text-sm">
                          🌿 {((selectedForgeItem.upgradeLevel || 0) + 1) * (selectedForgeItem.forgePrice ?? 250)} GREEN
                        </span>
                      </button>

                      {/* Currency Option 2: Dream Sparks Infusion */}
                      <button
                        type="button"
                        onClick={() => setUseSparksForForge(true)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                          useSparksForForge
                            ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400 font-bold ring-2 ring-cyan-500/40 shadow-lg'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-[10px] text-cyan-400/80 font-mono tracking-wider uppercase">Dream Sparks</span>
                        <span className="text-cyan-300 font-bold font-mono text-sm">
                          ⚡ {((selectedForgeItem.upgradeLevel || 0) + 1) * (selectedForgeItem.forgeSparksPrice ?? 40)} Sparks
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleForge}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span>Forge Upgrade to Level +{(selectedForgeItem.upgradeLevel || 0) + 1}</span>
                  </button>

                  {lastItemAction?.itemId === selectedForgeItemId && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl text-xs font-mono animate-fadeIn flex items-center gap-2 shadow ${
                        lastItemAction.success
                          ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/90 border border-rose-500/50 text-rose-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{lastItemAction.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-500">
                  Select a weapon or armor item above to preview upgrade stats.
                </div>
              )}
            </div>

            {/* List of Current Forged Weapons in Backpack */}
            <div className="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Upgraded Arsenal in Backpack
              </h4>

              {forgeableItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No weapons or armor found in your backpack. Shoplift or buy from store!
                </div>
              ) : (
                <div className="space-y-2">
                  {forgeableItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedForgeItemId(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedForgeItemId === item.id
                          ? 'bg-neutral-950 border-orange-500 text-white'
                          : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 p-0.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                          <DynamicIcon icon={item.icon} alt={item.name} imgClassName="w-6 h-6 object-contain rounded" className="text-2xl" fallback="📦" />
                        </span>
                        <div>
                          <h5 className="font-bold text-xs">{item.name}</h5>
                          <span className="text-[10px] text-neutral-400">
                            {item.damage ? `Dmg: ${item.damage}` : ''} {item.defense ? `Def: ${item.defense}` : ''}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950/40 border border-orange-500/30">
                        +{item.upgradeLevel || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
