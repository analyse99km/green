import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const NOTIFS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

function loadNotifications(): AdminNotification[] {
  try {
    if (fs.existsSync(NOTIFS_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIFS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load notifications:', err);
  }
  return [
    {
      id: 'notif_welcome',
      title: '🌱 Welcome to Neon Metropolis!',
      message: 'The Botanical Chlorophyll Network is online. Mint sparks and unlock city districts.',
      timestamp: Date.now() - 3600000,
    },
  ];
}

function saveNotifications(notifs: AdminNotification[]) {
  try {
    const dir = path.dirname(NOTIFS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Keep max 20 notifications for memory conservation
    const capped = notifs.slice(-20);
    fs.writeFileSync(NOTIFS_FILE, JSON.stringify(capped, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export async function GET() {
  const notifs = loadNotifications();
  return NextResponse.json({
    success: true,
    notifications: notifs,
    latestTimestamp: notifs.length > 0 ? notifs[notifs.length - 1].timestamp : 0,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message } = body;
    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required.' }, { status: 400 });
    }

    const notifs = loadNotifications();
    const newNotif: AdminNotification = {
      id: `notif_${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      timestamp: Date.now(),
    };

    notifs.push(newNotif);
    saveNotifications(notifs);

    return NextResponse.json({
      success: true,
      message: 'Notification broadcasted to all player smartphones!',
      notification: newNotif,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Broadcast failed.' }, { status: 500 });
  }
}
