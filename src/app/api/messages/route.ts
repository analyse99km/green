import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MESSAGES_FILE = path.join(process.cwd(), 'data', 'messages.json');
const MAX_MESSAGES = 50; // Strict memory conservation

export interface LiveChatMessage {
  id: string;
  sender: string;
  role: 'CITIZEN' | 'POLICE' | 'GOON';
  text: string;
  time: string;
  timestamp: number;
}

const DEFAULT_MESSAGES: LiveChatMessage[] = [
  { id: '1', sender: 'Slick_Tony', role: 'GOON', text: 'Anyone selling lockpicks at the subway? Need 2 ASAP.', time: '5m ago', timestamp: Date.now() - 300000 },
  { id: '2', sender: 'Officer_Davis', role: 'POLICE', text: 'Warning to all operatives: Metro patrols increased.', time: '3m ago', timestamp: Date.now() - 180000 },
  { id: '3', sender: 'Elena_V', role: 'CITIZEN', text: 'My penthouse door is locked and safe. Good luck out there!', time: '1m ago', timestamp: Date.now() - 60000 },
];

function loadMessages(): LiveChatMessage[] {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
  return DEFAULT_MESSAGES;
}

function saveMessages(msgs: LiveChatMessage[]) {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Strictly cap at 50 messages for memory conservation
    const capped = msgs.slice(-MAX_MESSAGES);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(capped, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save messages:', err);
  }
}

export async function GET() {
  const msgs = loadMessages();
  return NextResponse.json({
    success: true,
    messages: msgs,
    count: msgs.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sender, role, text } = body;
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, message: 'Message text cannot be empty.' }, { status: 400 });
    }

    const msgs = loadMessages();
    const newMsg: LiveChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: (sender || 'Operative').trim(),
      role: role || 'CITIZEN',
      text: text.trim().substring(0, 240), // Length limit for memory
      time: 'Just now',
      timestamp: Date.now(),
    };

    msgs.push(newMsg);
    saveMessages(msgs);

    return NextResponse.json({
      success: true,
      message: 'Message delivered to live network.',
      chatMessage: newMsg,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Message post failed.' }, { status: 500 });
  }
}
