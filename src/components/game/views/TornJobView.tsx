'use client';

import React from 'react';
import { useGame } from '../GameContext';
import { Briefcase, DollarSign, Award, Clock, Building } from 'lucide-react';

export default function TornJobView() {
  const { player } = useGame();

  return (
    <div className="space-y-6">
      {/* Job Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <h2 className="text-xl font-bold text-white">Your Employment — {player.job.companyName}</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Maintain active employment in player or corporate businesses to earn daily wages, accumulate Job Points, and boost your working stats (Manual Labor, Intelligence, Endurance).
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500 block text-[10px]">Daily Wage</span>
            <span className="text-emerald-400 font-bold text-base">+${player.job.income.toLocaleString()} / day</span>
          </div>
        </div>
      </div>

      {/* Position & Company Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] block mb-1">Company & Industry</span>
          <h3 className="font-bold text-white text-base">{player.job.companyName}</h3>
          <span className="text-amber-400 text-xs">{player.job.companyType} Entertainment</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] block mb-1">Assigned Position</span>
          <h3 className="font-bold text-white text-base">{player.job.position}</h3>
          <span className="text-neutral-400 text-xs">Tier 1 Entry Role</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] block mb-1">Accumulated Job Points</span>
          <h3 className="font-bold text-emerald-400 text-base">{player.job.jobPoints} Points</h3>
          <span className="text-neutral-400 text-xs">Days in Company: {player.job.daysInCompany}</span>
        </div>
      </div>

      {/* Company Perks & Promotions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-xs font-mono">
        <h3 className="font-bold text-white text-sm mb-3">Company Special Perks (Nightclub)</h3>
        <div className="space-y-2">
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-white block">Nightlife Connections (Passive Perk)</span>
              <span className="text-neutral-400 text-[11px]">Boosts Happy maximum capacity and reduces club entry fees.</span>
            </div>
            <span className="text-emerald-400 font-bold text-xs">Active</span>
          </div>
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-white block">Next Promotion: Floor Supervisor</span>
              <span className="text-neutral-400 text-[11px]">Requires: Endurance 10, Intelligence 10. Wage: +$45,000 / day.</span>
            </div>
            <span className="text-neutral-500 text-xs">In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
