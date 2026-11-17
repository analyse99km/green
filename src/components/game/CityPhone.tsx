'use client';

import React, { useState } from 'react';
import { useGame } from './GameContext';
import { Smartphone, Send, PhoneCall, ShieldAlert, X, ChevronUp, Bell, Radio } from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: string;
  role: 'CITIZEN' | 'POLICE' | 'GOON';
  text: string;
  time: string;
}

export default function CityPhone() {
  const { player, addLog } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAT' | '911' | 'MISSIONS'>('CHAT');
  const [inputMsg, setInputMsg] = useState('');
  
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '1', sender: 'Slick_Tony', role: 'GOON', text: 'Anyone selling lockpicks at the subway? Need 2 ASAP.', time: '2m ago' },
    { id: '2', sender: 'Officer_Davis', role: 'POLICE', text: 'Warning to all shoplifters: Metro patrols increased.', time: '1m ago' },
    { id: '3', sender: 'Elena_V', role: 'CITIZEN', text: 'My penthouse door is locked and safe. Good luck out there!', time: 'Just now' },
  ]);

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: player.name,
      role: (player.role === 'POLICE' ? 'POLICE' : player.role === 'GOON' ? 'GOON' : 'CITIZEN') as any,
      text: inputMsg,
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleEmergencyCall = () => {
    const alertMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: `🚨 911 DISPATCH [${player.name}]`,
      role: 'POLICE',
      text: `EMERGENCY ALERT: Possible mugger reported in Downtown! All units respond!`,
      time: 'Just now',
    };
    setMessages((prev) => [...prev, alertMsg]);
    addLog({
      type: 'POLICE',
      message: '🚨 911 Emergency call placed! Police officers across the city have been alerted to your coordinates.',
    });
  };

  return (
    <div className="fixed bottom-16 right-4 lg:bottom-4 z-30">
      {/* Floating Collapsed Phone Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/30"
        >
          <Smartphone className="w-4 h-4" />
          <span>City Smartphone</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </button>
      ) : (
        /* Expanded Realistic Smartphone Frame */
        <div className="w-80 sm:w-96 bg-neutral-950 border-2 border-neutral-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
          {/* Phone Top Notch Bar */}
          <div className="bg-neutral-900 px-4 py-2 flex items-center justify-between border-b border-neutral-800 text-neutral-300 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>5G • CityNet</span>
            </div>
            {/* Notch */}
            <div className="w-16 h-3 bg-neutral-950 rounded-full" />
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Phone Navigation Tabs */}
          <div className="flex bg-neutral-900/90 border-b border-neutral-800 p-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'CHAT' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('911')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === '911' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'text-neutral-400'
              }`}
            >
              🚨 911 Call
            </button>
            <button
              onClick={() => setActiveTab('MISSIONS')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'MISSIONS' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400'
              }`}
            >
              Contracts
            </button>
          </div>

          {/* Phone Body Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {activeTab === 'CHAT' && (
              <>
                {messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-neutral-200 flex items-center gap-1">
                        {m.role === 'POLICE' ? '👮' : m.role === 'GOON' ? '🥷' : '👔'} {m.sender}
                      </span>
                      <span className="text-[10px] text-neutral-500">{m.time}</span>
                    </div>
                    <p className="text-neutral-300 leading-snug">{m.text}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === '911' && (
              <div className="text-center p-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Emergency Police Dispatch</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Being stalked or robbed? Press below to broadcast an emergency 911 distress beacon to all active police officers.
                  </p>
                </div>
                <button
                  onClick={handleEmergencyCall}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                  Broadcast 911 Distress Call
                </button>
              </div>
            )}

            {activeTab === 'MISSIONS' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="font-bold text-amber-400 block">Daily Syndicate Delivery</span>
                  <p className="text-neutral-400 mt-0.5">Deliver 1 titanium lockpick to the docks. Reward: 🌿 250 GREEN.</p>
                </div>
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="font-bold text-blue-400 block">Civic Security Watch</span>
                  <p className="text-neutral-400 mt-0.5">Stay at home with door locked for 1 hour. Reward: 🌿 50 GREEN.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Chat Input */}
          {activeTab === 'CHAT' && (
            <div className="p-2.5 bg-neutral-900 border-t border-neutral-800 flex gap-2">
              <input
                type="text"
                placeholder="Message all players..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
