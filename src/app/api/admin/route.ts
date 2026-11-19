import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json');
const MASTER_STORAGE_REPO = 'pocomon9/green-status';
const MASTER_PAT = process.env.GH_PAT || process.env.MASTER_PAT || '';

function matchesReferral(referredBy: string, user: any, userEmail: string): boolean {
  if (!referredBy || !user) return false;
  let ref = String(referredBy).trim();
  if (ref.includes('start=')) ref = ref.split('start=')[1].split('&')[0];
  else if (ref.includes('/start ')) ref = ref.split('/start ')[1].split(' ')[0];
  ref = ref.trim().toUpperCase();

  const stripped = ref.replace(/^(REF[_-]|NEON[_-]|TG[_-])+/, '');
  const tgCandidate = stripped.replace(/[^0-9]/g, '');

  const myCode = (user.userReferralCode || user.playerState?.referrals?.referralCode || '').toUpperCase();
  const myTgId = String(user.telegramId || '').toUpperCase();
  const myUserId = (user.userId || '').toUpperCase();
  const myEmail = userEmail.toUpperCase();
  const myName = (user.name || '').toUpperCase();
  const myUsername = (user.username || '').toUpperCase();

  return (
    myCode === ref ||
    myCode === stripped ||
    (stripped.length >= 3 && myCode.includes(stripped)) ||
    (myTgId && (myTgId === ref || myTgId === stripped || (tgCandidate && myTgId === tgCandidate))) ||
    (myUserId && (myUserId === ref || myUserId.includes(ref))) ||
    myEmail === ref ||
    (myUsername && (myUsername === ref || `@${myUsername}` === ref)) ||
    (myName && myName === ref)
  );
}

async function pushCatalogToMaster(catalog: Record<string, any>) {
  try {
    const content = Buffer.from(JSON.stringify(catalog, null, 2), 'utf-8').toString('base64');
    let sha = '';
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${MASTER_STORAGE_REPO}/contents/catalog.json`, {
        headers: {
          'Authorization': `Bearer ${MASTER_PAT}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'Neon-Sync-Worker'
        }
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        sha = checkData.sha || '';
      }
    } catch {}

    const bodyData: any = {
      message: 'update dynamic catalog [skip ci]',
      content
    };
    if (sha) bodyData.sha = sha;

    await fetch(`https://api.github.com/repos/${MASTER_STORAGE_REPO}/contents/catalog.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${MASTER_PAT}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Neon-Sync-Worker'
      },
      body: JSON.stringify(bodyData)
    });
  } catch (err) {
    console.warn('Asynchronous master push error in catalog:', err);
  }
}

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
      const state = u.playerState || {};
      const savedRecruits = Array.isArray(state.referrals?.recruits) ? state.referrals.recruits : [];

      // Find all recruits across database using universal matching
      const downlines: { email: string; name: string }[] = [];
      for (const [otherEmail, otherUser] of Object.entries(users)) {
        if (otherEmail.toLowerCase() !== email.toLowerCase() && otherUser.referredBy) {
          if (matchesReferral(otherUser.referredBy, u, email)) {
            downlines.push({
              email: otherEmail,
              name: otherUser.name || otherEmail.split('@')[0],
            });
          }
        }
      }

      // Merge saved recruits and downlines
      for (const sr of savedRecruits) {
        if (!downlines.some((d) => (sr.email && d.email.toLowerCase() === sr.email.toLowerCase()) || d.name === sr.name)) {
          downlines.push({
            email: sr.email || 'citizen@neon.city',
            name: sr.name || 'Citizen',
          });
        }
      }

      return {
        email,
        name: u.name || state.name || 'Operative',
        userId: u.userId || state.id,
        userReferralCode: u.userReferralCode || state.referrals?.referralCode,
        referredBy: u.referredBy || state.referrals?.referredBy || 'None (Direct)',
        recruitsCount: downlines.length,
        recruits: downlines,
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
      pushCatalogToMaster(catalog).catch(() => {});
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
