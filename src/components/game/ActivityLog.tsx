'use client';

import React from 'react';
import { useGame } from './GameContext';
import { ScrollText } from 'lucide-react';

export default function ActivityLog() {
  const { logs } = useGame();

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">City Dispatch & Audit Log</h3>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Live Stream</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {logs.map((log) => {
          const isSave = log.type === 'SAVE';
          const isCrime = log.type === 'CRIME';
          const isPolice = log.type === 'POLICE';
          const isMug = log.type === 'MUG';

          return (
            <div
              key={log.id}
              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                isSave
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : isCrime
                  ? 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                  : isPolice
                  ? 'bg-blue-950/20 border-blue-500/20 text-blue-200'
                  : isMug
                  ? 'bg-rose-950/20 border-rose-500/20 text-rose-200'
                  : 'bg-neutral-950 border-neutral-800/80 text-neutral-300'
              }`}
            >
              <span className="shrink-0 mt-0.5 text-sm">
                {isSave ? '💾' : isCrime ? '🥷' : isPolice ? '👮' : isMug ? '💥' : '📝'}
              </span>
              <div className="flex-1">
                <p className="leading-snug">{log.message}</p>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
