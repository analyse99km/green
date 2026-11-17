'use client';

import React from 'react';
import { useGame } from '../GameContext';
import { Users, Award, Swords, Shield, Building, MapPin } from 'lucide-react';

export default function TornFactionView() {
  const { player } = useGame();

  return (
    <div className="space-y-6">
      {/* Faction Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <h2 className="text-xl font-bold text-white">Your Faction — [{player.faction.tag}] {player.faction.name}</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              You are an active sworn brother of {player.faction.name}. Participate in ranked territory wars, draw from the faction armory, and chain attacks to expand your syndicate's dominion across Neon Metropolis.
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500 block text-[10px]">Faction Respect</span>
            <span className="text-amber-400 font-bold text-base">★ {player.faction.respect.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Faction Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] block mb-1">Active Members</span>
          <h3 className="font-bold text-white text-base">{player.faction.membersCount} Brothers</h3>
          <span className="text-emerald-400 text-xs">Online & Armed</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] block mb-1">Controlled Territory</span>
          <h3 className="font-bold text-white text-base">{player.faction.territory}</h3>
          <span className="text-indigo-400 text-xs">100% Turf Integrity</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] block mb-1">Days in Faction</span>
          <h3 className="font-bold text-white text-base">{player.faction.daysInFaction} Days</h3>
          <span className="text-neutral-400 text-xs">Full Veteran Standing</span>
        </div>
      </div>

      {/* Territory War Status */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-xs font-mono">
        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          <Swords className="w-4 h-4 text-rose-400" />
          <span>Ranked War Protocol & Chain Multiplier</span>
        </h3>
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
          <div>
            <span className="font-bold text-white block">Current Faction Chain: {player.chain}/10</span>
            <span className="text-neutral-400 text-[11px]">Coordinate with squad members to hit targets within the 5-minute timeout window.</span>
          </div>
          <span className="text-emerald-400 font-bold text-xs bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Chain Status: Ready
          </span>
        </div>
      </div>
    </div>
  );
}
