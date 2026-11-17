'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import {
  Scroll,
  Building,
  CheckCircle,
  AlertOctagon,
  DollarSign,
  Users,
  Award,
  Sliders,
  ArrowUpRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { LicenseTier } from '../types';

export default function TornCityHallView() {
  const {
    player,
    registerBusiness,
    upgradeBusinessLicenseTier,
    toggleBusinessService,
    collectBusinessRevenue,
  } = useGame();
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRegister = (bizId: string) => {
    const name = customNames[bizId] || '';
    const res = registerBusiness(bizId, name);
    setFeedback(res.message);
  };

  const handleCollect = (bizId: string) => {
    const res = collectBusinessRevenue(bizId);
    setFeedback(res.message);
  };

  const handleTierUpgrade = (bizId: string, tier: LicenseTier) => {
    const res = upgradeBusinessLicenseTier(bizId, tier);
    setFeedback(res.message);
  };

  const handleToggleService = (bizId: string, serviceId: string) => {
    const res = toggleBusinessService(bizId, serviceId);
    setFeedback(res.message);
  };

  const licenseTiers: { id: LicenseTier; label: string; cap: number }[] = [
    { id: 'MICRO_50', label: 'Micro Cart', cap: 50 },
    { id: 'COMMERCIAL_500', label: 'Commercial Tier', cap: 500 },
    { id: 'ENTERPRISE_5000', label: 'Enterprise Franchise', cap: 5000 },
    { id: 'MEGA_10000', label: 'Mega Conglomerate', cap: 10000 },
  ];

  return (
    <div className="space-y-6">
      {/* City Hall Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-xl font-bold text-white">Metropolis City Hall — Commerce & Enterprise Registry</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Official municipal registrar for commercial deeds. Citizens who pass specialized university examinations
              and verify capital reserves in bank may incorporate restaurants, private trauma clinics, gyms, and nightclubs.
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 text-xs font-mono">
            <span className="text-neutral-500 block text-[10px]">Verified Bank Capital</span>
            <span className="text-emerald-400 font-bold">${player.bankMoney.toLocaleString()}</span>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-amber-500/40 text-amber-300 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Commercial Deeds List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {player.businessRegistries.map((biz) => {
          const requiredCourse = player.educationCourses.find((c) => c.id === biz.requiredExamId);
          const hasExam = requiredCourse?.examPassed;
          const hasCapital = player.bankMoney >= biz.requiredCapital + biz.monthlyTax;
          const canIncorporate = hasExam && hasCapital;
          const netProfit = biz.dailyRevenue - biz.dailyUpkeep;

          return (
            <div
              key={biz.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between shadow-sm transition-all ${
                biz.isRegistered
                  ? 'bg-neutral-900 border-emerald-500/50 shadow-emerald-950/20'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-base">{biz.name}</h3>
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      {biz.licenseTitle}
                    </span>
                  </div>

                  {biz.isRegistered ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Chartered ({biz.maxDailyCapacity}/day)
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-neutral-300">
                      Tax: ${biz.monthlyTax.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Requirements Checklist */}
                {!biz.isRegistered && (
                  <div className="my-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Exam: {requiredCourse?.title}</span>
                      <span className={hasExam ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                        {hasExam ? '✓ Passed' : '✗ Required'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Bank Capital: ${biz.requiredCapital.toLocaleString()}</span>
                      <span className={hasCapital ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                        {hasCapital ? '✓ Verified' : '✗ Insufficient'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
                  <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Daily Revenue</span>
                    <span className="font-bold text-emerald-400">+${biz.dailyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Daily Upkeep</span>
                    <span className="font-bold text-rose-400">-${biz.dailyUpkeep.toLocaleString()}</span>
                  </div>
                  <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Net Profit</span>
                    <span className="font-bold text-white">+${netProfit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Registered Business: Tier Capacity Upgrade & Services Customization */}
                {biz.isRegistered && (
                  <div className="space-y-3 pt-3 border-t border-neutral-800">
                    {/* Capacity Tier Selector */}
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                        MUNICIPAL LICENSE TIER & CAPACITY:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {licenseTiers.map((tier) => {
                          const isCurrent = biz.licenseTier === tier.id;
                          return (
                            <button
                              key={tier.id}
                              onClick={() => handleTierUpgrade(biz.id, tier.id)}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-left ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {tier.label} ({tier.cap}/day)
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Services / Menu items */}
                    {biz.services && biz.services.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-mono text-neutral-400 block">
                          ACTIVE COMMERCIAL SERVICES & PRODUCTS:
                        </label>
                        {biz.services.map((srv) => (
                          <div
                            key={srv.id}
                            className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono"
                          >
                            <div>
                              <span className="text-white font-bold block">{srv.name}</span>
                              <span className="text-[10px] text-neutral-400">{srv.effectDescription}</span>
                            </div>
                            <button
                              onClick={() => handleToggleService(biz.id, srv.id)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                srv.active
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                              }`}
                            >
                              {srv.active ? 'ACTIVE' : 'OFF'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Action Area */}
              <div className="pt-3 border-t border-neutral-800/80 mt-3">
                {biz.isRegistered ? (
                  <button
                    onClick={() => handleCollect(biz.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Collect Daily Dividends (+${netProfit.toLocaleString()})</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={`Custom entity name (e.g. ${biz.name})`}
                      value={customNames[biz.id] || ''}
                      onChange={(e) => setCustomNames({ ...customNames, [biz.id]: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />

                    <button
                      onClick={() => handleRegister(biz.id)}
                      disabled={!canIncorporate}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        canIncorporate
                          ? 'bg-amber-600 hover:bg-amber-500 text-neutral-950 shadow'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      {canIncorporate
                        ? `File Commercial Charter ($${biz.monthlyTax.toLocaleString()} Tax)`
                        : 'Prerequisites Incomplete (Pass Exam & Bank Reserve)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
