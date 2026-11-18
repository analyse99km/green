import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json');

function loadUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load users for admin:', err);
  }
  return {};
}

function saveUsers(users: Record<string, any>) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users from admin:', err);
  }
}

function loadCatalog(): Record<string, any> {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      return JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load catalog:', err);
  }
  return {};
}

function saveCatalog(data: Record<string, any>) {
  try {
    const dir = path.dirname(CATALOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save catalog:', err);
  }
}

export async function GET() {
  try {
    const users = loadUsers();
    const catalog = loadCatalog();

    // Map referral counts
    const referralMap: Record<string, { email: string; name: string }[]> = {};
    for (const [email, u] of Object.entries(users)) {
      if (u.referredBy) {
        if (!referralMap[u.referredBy]) {
          referralMap[u.referredBy] = [];
        }
        referralMap[u.referredBy].push({
          email,
          name: u.name || 'Operative',
        });
      }
    }

    const playerList = Object.entries(users).map(([email, u]) => {
      const code = u.userReferralCode || '';
      const recruits = code ? referralMap[code] || [] : [];
      const state = u.playerState || {};
      return {
        email,
        name: u.name || state.name || 'Operative',
        userId: u.userId || state.id,
        userReferralCode: u.userReferralCode || state.referrals?.referralCode,
        referredBy: u.referredBy || state.referrals?.referredBy || 'None (Direct)',
        recruitsCount: recruits.length,
        recruits,
        createdAt: u.createdAt || new Date().toISOString(),
        lastLoginAt: u.lastLoginAt || u.createdAt,
        passwordHash: u.passwordHash ? `${u.passwordHash.substring(0, 16)}...` : 'N/A',
        salt: u.salt ? `${u.salt.substring(0, 10)}...` : 'N/A',
        playerState: u.playerState || null,
        money: state.money !== undefined ? state.money : (u.money !== undefined ? u.money : 0),
        sparks: state.dreamPoints !== undefined ? state.dreamPoints : (u.sparks !== undefined ? u.sparks : 0),
        level: state.level || u.level || 1,
        rank: state.rank || u.rank || 'Operative',
      };
    });

    return NextResponse.json({
      success: true,
      totalPlayers: playerList.length,
      players: playerList,
      catalog,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin data.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'save_catalog') {
      const { catalog } = body;
      if (!catalog) {
        return NextResponse.json({ success: false, message: 'Missing catalog data.' }, { status: 400 });
      }
      saveCatalog(catalog);
      return NextResponse.json({ success: true, message: 'Catalog saved to cluster.' });
    }

    if (action === 'update_player') {
      const { email, updates } = body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const users = loadUsers();
      if (!users[cleanEmail]) {
        return NextResponse.json({ success: false, message: 'Player not found.' }, { status: 404 });
      }

      const existing = users[cleanEmail];
      const mergedPlayerState = {
        ...(existing.playerState || {}),
        ...(updates.playerState || {}),
      };

      if (updates.name) {
        existing.name = updates.name;
        mergedPlayerState.name = updates.name;
      }
      if (updates.money !== undefined) {
        existing.money = Number(updates.money);
        mergedPlayerState.money = Number(updates.money);
      }
      if (updates.sparks !== undefined) {
        existing.sparks = Number(updates.sparks);
        mergedPlayerState.dreamPoints = Number(updates.sparks);
      }
      if (updates.level !== undefined) {
        existing.level = Number(updates.level);
        mergedPlayerState.level = Number(updates.level);
      }

      existing.playerState = mergedPlayerState;
      existing.lastLoginAt = Date.now();
      users[cleanEmail] = existing;

      saveUsers(users);
      return NextResponse.json({ success: true, message: 'Player updated successfully.', player: existing });
    }

    if (action === 'delete_player') {
      const { email } = body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const users = loadUsers();
      if (users[cleanEmail]) {
        delete users[cleanEmail];
        saveUsers(users);
        return NextResponse.json({ success: true, message: 'Player deleted.' });
      }
      return NextResponse.json({ success: false, message: 'Player not found.' }, { status: 404 });
    }

    if (action === 'delete_notification') {
      const { id } = body;
      const notifsPath = path.join(process.cwd(), 'data', 'notifications.json');
      if (fs.existsSync(notifsPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(notifsPath, 'utf-8'));
          const filtered = list.filter((n: any) => n.id !== id);
          fs.writeFileSync(notifsPath, JSON.stringify(filtered, null, 2), 'utf-8');
        } catch {}
      }
      return NextResponse.json({ success: true, message: 'Notification deleted.' });
    }

    return NextResponse.json({ success: false, message: 'Unknown admin action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Admin request failed.' },
      { status: 500 }
    );
  }
}
