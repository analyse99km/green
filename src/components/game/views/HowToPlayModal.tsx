'use client';

import React from 'react';
import { X, Sparkles, Sprout, Layers, Target, Building2, ArrowRight } from 'lucide-react';
import { SoundEngine } from '../gameAudio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterCity?: () => void;
}

export default function HowToPlayModal({ isOpen, onClose, onEnterCity }: HowToPlayModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      step: '1',
      icon: '🌿',
      title: 'Tap The Sacred Mint Leaf',
      desc: 'Tap the glowing central green leaf in Dream Tap to harvest pure Chlorophyll Sparks. Each tap fills your bio-vault.',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    },
    {
      step: '2',
      icon: '🌳',
      title: 'Evolve Plant Organisms',
      desc: 'Open the Plants menu to evolve from Chlorophyll Sprout 🌱 into Ancient Bonsai 🪴, Bamboo 🎋, and the Sacred Banyan Tree 🌳 to multiply tap output up to 200x per tap!',
      color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-300',
    },
    {
      step: '3',
      icon: '🃏',
      title: 'Automate Idle Profits',
      desc: 'Visit Cards Store in Dream Tap. Each card (Spores, Luminescent Moss, Cosmic Engines) generates steady sparks every second automatically while you rest!',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
    },
    {
      step: '4',
      icon: '🎯',
      title: 'Complete Multi-Tier Missions',
      desc: 'Track Daily (24h), Weekly (7d), and Story Missions. Claim massive rewards: liquid GREEN 🌿, Sparks ⚡, Cash 💵, and spendable Mission Credits 🎖️.',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    },
    {
      step: '5',
      icon: '🏙️',
      title: 'Dominate Neon Metropolis',
      desc: 'Click "Enter Metropolis (Home)" to access the full underworld: run crimes, wager at the Torn Casino, work out at the gym, trade in the Bazaar, and build your syndicate downline!',
      color: 'from-purple-500/20 to-emerald-500/10 border-purple-500/30 text-purple-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-emerald-500/40 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
              📖
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Operative Quick Guide
              </h2>
              <p className="text-[11px] text-neutral-400">
                Master the underworld in 5 simple steps.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEngine.playTick(true);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`p-3.5 sm:p-4 rounded-2xl border bg-gradient-to-r flex items-start gap-3.5 transition-all ${s.color}`}
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-950/80 border border-neutral-700/60 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/60 text-neutral-300">
                    STEP {s.step}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed font-sans">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              SoundEngine.playTick(true);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold transition cursor-pointer"
          >
            Got It! Return to Tap
          </button>

          {onEnterCity && (
            <button
              onClick={() => {
                SoundEngine.playTick(true);
                onClose();
                onEnterCity();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-mono font-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Enter Metropolis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
