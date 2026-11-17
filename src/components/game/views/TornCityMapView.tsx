'use client';

import React from 'react';
import {
  GraduationCap,
  Dumbbell,
  Dice5,
  Trash2,
  DollarSign,
  Store,
  Building,
  Scroll,
  Heart,
  ShieldAlert,
  Landmark,
  ShoppingBag,
  Pill,
  Sparkles,
  Home,
  Newspaper,
  Target,
} from 'lucide-react';

interface TornCityMapViewProps {
  onNavigate: (viewId: string) => void;
}

export default function TornCityMapView({ onNavigate }: TornCityMapViewProps) {
  const districts = [
    {
      name: 'Commercial & Trade District',
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
      places: [
        { name: 'Item Market & Bazaars', desc: 'Free-market contraband, weapons, electronics & player shops', viewId: 'BAZAAR', icon: Store },
        { name: 'Black Market Armory', desc: 'Weapons, combat vests, tactical gear & ammunition', viewId: 'ITEMS', icon: ShoppingBag },
        { name: 'Metropolis Daily Lucky Wheel', desc: 'Daily fortune spins, $500k jackpots & rare equipment', viewId: 'WHEEL', icon: Sparkles },
      ],
    },
    {
      name: 'Combat & Underworld Sector',
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-400',
      places: [
        { name: 'Street Combat & Bounties', desc: 'Target rival goons, execute street mugs or hospitalize', viewId: 'ATTACK', icon: Target },
        { name: 'Underworld Crime Operations', desc: '13-tier syndicates: bootlegging, skimming, arson & crack', viewId: 'CRIMES', icon: DollarSign },
        { name: 'Syndicate Headquarters', desc: 'Faction wars, armory cache & territory dominance', viewId: 'FACTION', icon: Building },
      ],
    },
    {
      name: 'West Side & Athletic Campus',
      color: 'border-blue-500/30 bg-blue-950/20 text-blue-400',
      places: [
        { name: 'Metropolis Academy', desc: 'Degrees in Law, Medicine, Cybernetics & Business exams', viewId: 'EDUCATION', icon: GraduationCap },
        { name: 'Titan Iron Core Club', desc: 'Heavy battle stats training facility with Happy Jump multiplier', viewId: 'GYM', icon: Dumbbell },
      ],
    },
    {
      name: 'Civic Center & Government',
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
      places: [
        { name: 'The Metropolis Chronicle', desc: 'Daily newspaper headlines, stock ticker & public obituaries', viewId: 'NEWSPAPER', icon: Newspaper },
        { name: 'Metropolis City Hall', desc: 'Corporate charter registration & business deeds', viewId: 'CITY_HALL', icon: Scroll },
        { name: 'Apex Trauma Center', desc: 'Emergency ICU resuscitation & medical treatment', viewId: 'HOSPITAL', icon: Heart },
        { name: 'Metropolis Correctional', desc: 'High-security detention blocks & bail bonds', viewId: 'JAIL', icon: ShieldAlert },
      ],
    },
    {
      name: 'Financial District',
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
      places: [
        { name: 'Metropolis Reserve Bank', desc: 'Secure cash vaults, high-yield fixed deposits & loans', viewId: 'BANK', icon: Landmark },
        { name: 'Agency Contract Desk', desc: 'Underworld hit contracts & agency credit rewards', viewId: 'MISSIONS', icon: Target },
      ],
    },
    {
      name: 'Red-Light District & Entertainment',
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
      places: [
        { name: 'Velvet Lounge Casino', desc: 'High-stakes Blackjack, European Roulette & Craps', viewId: 'CASINO', icon: Dice5 },
      ],
    },
    {
      name: 'Residential Quarter',
      color: 'border-neutral-500/30 bg-neutral-900/40 text-neutral-300',
      places: [
        { name: 'Personal Sanctuary', desc: 'Locked penthouse, bedroom quarters for 1-hour sleep & kitchen', viewId: 'PROPERTIES', icon: Home },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* City Map Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏙️</span>
          <h2 className="text-xl font-bold text-white">Neon Metropolis District Map</h2>
        </div>
        <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
          Navigate the 7 municipal and underground sectors of Neon Metropolis. Engage in live street combat, list contraband in the player Bazaar, spin the Daily Wheel, or train your stats with the Happy Jump technique.
        </p>
      </div>

      {/* Districts Grid */}
      <div className="space-y-5">
        {districts.map((district) => (
          <div key={district.name} className="space-y-2.5">
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg border w-fit ${district.color}`}>
              {district.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {district.places.map((place) => {
                const Icon = place.icon;
                return (
                  <button
                    key={place.name}
                    onClick={() => onNavigate(place.viewId)}
                    className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 transition-all text-left flex items-start gap-3 group cursor-pointer shadow-sm"
                  >
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 group-hover:scale-105 transition-transform text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        {place.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
