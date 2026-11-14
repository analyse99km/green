'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  // Global hotkey: Ctrl + Shift + D (or Cmd + Shift + D) to access diagnostics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleSecretClicks = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      
    }
  };

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-8 px-4 text-center text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            onClick={handleSecretClicks}
            className="font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer select-none"
            title="GREEN Decentralized Commerce Node"
          >
            GREEN Marketplace
          </span>
          <span>•</span>
          <span>Open Source & Self-Hosted</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-400">
          <span>Zero platform fees</span>
          <span>•</span>
          <span>Direct P2P seller payments</span>
          <span>•</span>
          
        </div>
      </div>
    </footer>
  );
}
