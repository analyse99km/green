'use client';

import React from 'react';
import { useGame } from '../GameContext';
import { Heart, Activity, Stethoscope, AlertCircle } from 'lucide-react';

export default function TornHospitalView() {
  const { player, healInHospital } = useGame();

  return (
    <div className="space-y-6">
      {/* Hospital Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <h2 className="text-xl font-bold text-white">Apex Metropolitan Hospital & Emergency Trauma</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Neon Metropolis's centralized trauma center. If you are beaten in street combat or suffer an overdose, you will be hospitalized. Pay emergency ward fees or study Medicine at the Academy to revive patients!
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 font-mono text-xs">
            <span className="text-neutral-500 block text-[10px]">Your Current Life</span>
            <span className="text-emerald-400 font-bold text-base">{player.life} / {player.maxLife} HP</span>
          </div>
        </div>
      </div>

      {/* Emergency Treatment */}
      <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
          <Activity className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h3 className="font-bold text-white text-base">Emergency Triage Ward</h3>
          <p className="text-xs text-neutral-400 mt-1">Pay city doctors $250 to immediately restore full 175 Life.</p>
        </div>

        <button
          onClick={healInHospital}
          disabled={player.life >= player.maxLife}
          className={`w-full py-3 rounded-xl font-bold text-xs shadow transition-all cursor-pointer ${
            player.life < player.maxLife
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {player.life < player.maxLife ? 'Pay $250 for Full Hospital Recovery' : 'Already at 100% Life (175/175)'}
        </button>
      </div>
    </div>
  );
}
