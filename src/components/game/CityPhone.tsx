'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from './GameContext';
import {
  Smartphone,
  Send,
  PhoneCall,
  ShieldAlert,
  X,
  Radio,
  Bell,
  MessageSquare,
  Users,
} from 'lucide-react';
import { SoundEngine } from './gameAudio';

export interface ChatMsg {
  id: string;
  sender: string;
  role: 'CITIZEN' | 'POLICE' | 'GOON';
  text: string;
  time: string;
  timestamp: number;
}

export interface AdminNotif {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export const NOTIF_STORAGE_KEY = 'METROPOLIS_LAST_READ_NOTIF_TS';
const MAX_MESSAGES = 50;

interface CityPhoneProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function CityPhone({ isOpen: propIsOpen, onClose: propOnClose, onOpen: propOnOpen }: CityPhoneProps = {}) {
  const { player, addLog } = useGame();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? (propIsOpen || internalOpen) : internalOpen;

  const [activeTab, setActiveTab] = useState<'CHAT' | 'NOTIFS'>('CHAT');
  const [inputMsg, setInputMsg] = useState('');
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotif[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '1', sender: 'Slick_Tony', role: 'GOON', text: 'Anyone selling lockpicks at the subway? Need 2 ASAP.', time: '5m ago', timestamp: Date.now() - 300000 },
    { id: '2', sender: 'Officer_Davis', role: 'POLICE', text: 'Warning to all operatives: Metro patrols increased.', time: '3m ago', timestamp: Date.now() - 180000 },
    { id: '3', sender: 'Elena_V', role: 'CITIZEN', text: 'My penthouse door is locked and safe. Good luck out there!', time: '1m ago', timestamp: Date.now() - 60000 },
  ]);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Check Notifications & Setup Real-time Chat
  useEffect(() => {
    // 1. Fetch Admin Notifications
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const notifs: AdminNotif[] = data.notifications || [];
          setNotifications(notifs);

          const lastRead = Number(localStorage.getItem(NOTIF_STORAGE_KEY) || 0);
          const latest = data.latestTimestamp || 0;
          setHasUnreadNotif(latest > lastRead);
        }
      } catch (err) {
        // Fallback silently
      }
    };

    // 2. Fetch Live Player Messages
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.slice(-MAX_MESSAGES));
          }
        }
      } catch (err) {
        // Fallback silently
      }
    };

    checkNotifications();
    fetchMessages();

    // Polling interval for live sync
    const pollInterval = setInterval(() => {
      checkNotifications();
      fetchMessages();
    }, 12000);

    // 3. Setup P2P BroadcastChannel for instantaneous live chat across tabs/peers
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('metropolis_live_chat_p2p');
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_CHAT_MESSAGE') {
          const incoming: ChatMsg = event.data.message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev.slice(-(MAX_MESSAGES - 1)), incoming];
          });
        }
        if (event.data && event.data.type === 'ADMIN_BROADCAST') {
          checkNotifications();
        }
      };
    }

    return () => {
      clearInterval(pollInterval);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // When phone opens, clear unread notification state
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      const latestTs = notifications[notifications.length - 1].timestamp;
      localStorage.setItem(NOTIF_STORAGE_KEY, latestTs.toString());
      window.dispatchEvent(new Event('notif-read-updated'));
    }
  }, [isOpen, notifications]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const text = inputMsg.trim();
    setInputMsg('');

    const newMsg: ChatMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: player.name || 'Operative',
      role: (player.role === 'POLICE' ? 'POLICE' : player.role === 'GOON' ? 'GOON' : 'CITIZEN') as any,
      text,
      time: 'Just now',
      timestamp: Date.now(),
    };

    // Update local state immediately
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), newMsg]);
    SoundEngine.playTap(player.soundEnabled);

    // Broadcast via P2P BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'NEW_CHAT_MESSAGE',
        message: newMsg,
      });
    }

    // Persist to server cluster API
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: player.name || 'Operative',
          role: player.role || 'CITIZEN',
          text,
        }),
      });
    } catch (err) {
      // Offline fallback
    }
  };

  const handleEmergencyCall = () => {
    const alertMsg: ChatMsg = {
      id: `alert_${Date.now()}`,
      sender: `🚨 911 [${player.name}]`,
      role: 'POLICE',
      text: `EMERGENCY ALERT: Operative in distress in Downtown sector! Units respond!`,
      time: 'Just now',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), alertMsg]);
    addLog({
      type: 'POLICE',
      message: '🚨 911 Emergency call placed! Police and allies across the city alerted.',
    });
  };

  const handleClose = () => {
    SoundEngine.playTick(player.soundEnabled);
    setInternalOpen(false);
    if (propOnClose) propOnClose();
  };

  const handleOpen = () => {
    setInternalOpen(true);
    if (propOnOpen) propOnOpen();
    SoundEngine.playTick(player.soundEnabled);
    if (hasUnreadNotif) {
      setHasUnreadNotif(false);
      const latestTs = notifications.length > 0 ? notifications[notifications.length - 1].timestamp : Date.now();
      localStorage.setItem(NOTIF_STORAGE_KEY, latestTs.toString());
      window.dispatchEvent(new Event('notif-read-updated'));
    }
  };

  return (
    <>
      {/* Permanent Floating Smartphone Button (Desktop only; on mobile, Smartphone is cleanly accessible via sticky top header) */}
      {!isOpen && (
        <div className="hidden sm:block fixed sm:bottom-24 sm:right-6 z-30 select-none">
          <button
            onClick={handleOpen}
            className="relative flex items-center justify-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
            title="Open City Smartphone"
          >
            <Smartphone className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-100" />
            <span className="hidden sm:inline font-bold">City Smartphone</span>

            {/* Live Blinking Red Notification Ping Dot if unread admin announcement */}
            {hasUnreadNotif ? (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 border-2 border-neutral-950" />
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      )}

      {/* When open: Centered Realistic Smartphone Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
          {/* Centered Realistic Smartphone Frame */}
          <div className="w-[330px] sm:w-[400px] bg-neutral-950 border-2 border-neutral-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[90vh]">
            {/* Phone Top Notch Bar */}
            <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 text-neutral-300 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>5G • CityNet</span>
              </div>
              {/* Notch */}
              <div className="w-16 h-3 bg-neutral-950 rounded-full" />
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

        {/* Phone Navigation Tabs */}
        <div className="flex bg-neutral-900/90 border-b border-neutral-800 p-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'CHAT' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('NOTIFS')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'NOTIFS' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Announcements</span>
            {notifications.length > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded-full font-mono font-bold">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Phone Body Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {/* 1. LIVE PLAYERS CHAT */}
          {activeTab === 'CHAT' && (
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 text-center font-mono py-1 border-b border-neutral-900">
                ⚡ Live Network • Online Players Chat ({messages.length}/{MAX_MESSAGES})
              </div>
              {messages.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-neutral-200 flex items-center gap-1">
                      {m.role === 'POLICE' ? '👮' : m.role === 'GOON' ? '🥷' : '👔'} {m.sender}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">{m.time}</span>
                  </div>
                  <p className="text-neutral-300 leading-snug">{m.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* 2. ADMIN NOTIFICATIONS / BROADCASTS */}
          {activeTab === 'NOTIFS' && (
            <div className="space-y-2.5">
              <div className="text-[10px] text-amber-400/90 text-center font-mono py-1 border-b border-neutral-900">
                📢 Official Metropolis City Broadcasts
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-xs">No active broadcasts.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-neutral-900 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-xs">{n.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Chat Input (Only on Chat tab) */}
        {activeTab === 'CHAT' && (
          <div className="p-2.5 bg-neutral-900 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="Message online players..."
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
    </div>
      )}
    </>
  );
}
