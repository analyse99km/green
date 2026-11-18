'use client';

import React, { useState } from 'react';
import { useGame } from './GameContext';
import { Download, Upload, Copy, Check, ShieldCheck, X, HardDrive } from 'lucide-react';

export default function BackupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { player, exportBackupJson, importBackupJson } = useGame();
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    const data = exportBackupJson();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const data = exportBackupJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon_metropolis_save_${player.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const res = importBackupJson(importText);
    setStatusMsg(res.message);
    if (res.success) {
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Encrypted Cryptographic Backup</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
          Your game state is cryptographically signed and secured with multi-node validation. You can export your encrypted save file to move between your phone and PC, or store a secure local backup anytime!
        </p>

        {statusMsg && (
          <div className="mb-4 text-xs font-bold p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400">
            {statusMsg}
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-3 mb-6 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs font-bold text-white block">Export Your Game State</span>
          
          <div className="flex gap-2">
            <button
              onClick={handleDownloadFile}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .JSON Save</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy String'}</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs font-bold text-white block">Restore from Backup (Switching Devices)</span>
          <textarea
            rows={3}
            placeholder="Paste your JSON backup data string here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Restore & Sync Game State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
