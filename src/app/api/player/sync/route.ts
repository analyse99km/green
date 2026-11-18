import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const MASTER_STORAGE_REPO = 'pocomon9/green-status';
const MASTER_PAT = process.env.GH_PAT || process.env.MASTER_PAT || '';

function loadUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load users for sync:', err);
  }
  return {};
}

function saveUsers(users: Record<string, any>) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users from sync:', err);
  }
}

// Push updated users to master storage asynchronously (non-blocking)
async function pushToMaster(users: Record<string, any>) {
  try {
    const content = Buffer.from(JSON.stringify(users, null, 2), 'utf-8').toString('base64');
    let sha = '';
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${MASTER_STORAGE_REPO}/contents/users.json`, {
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
      message: 'cloud player state sync [skip ci]',
      content
    };
    if (sha) bodyData.sha = sha;

    await fetch(`https://api.github.com/repos/${MASTER_STORAGE_REPO}/contents/users.json`, {
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
    console.warn('Asynchronous master push error:', err);
  }
}

// GET /api/player/sync?email=user@example.com
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    }

    let users = loadUsers();
    let user = users[email];

    // If not found in local runner disk, fetch from master storage
    if (!user) {
      try {
        const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
        if (remoteRes.ok) {
          const remoteUsers = await remoteRes.json();
          if (remoteUsers[email]) {
            users = { ...users, ...remoteUsers };
            saveUsers(users);
            user = users[email];
          }
        }
      } catch {}
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
    }

    // Real-time aggregate referrals
    const myCode = (user.userReferralCode || user.playerState?.referrals?.referralCode || '').toUpperCase();
    if (myCode) {
      if (!user.playerState) user.playerState = {};
      if (!user.playerState.referrals) {
        user.playerState.referrals = {
          referralCode: myCode,
          recruits: [],
          totalRecruits: 0,
          networkTotalCitizens: 0,
          unclaimedCommissionGreen: 0,
          lifetimeCommissionGreen: 0,
          claimedMilestones: [],
        };
      }
      if (!Array.isArray(user.playerState.referrals.recruits)) {
        user.playerState.referrals.recruits = [];
      }

      let modified = false;
      for (const [em, other] of Object.entries(users)) {
        if (em.toLowerCase() !== email && other.referredBy && other.referredBy.toUpperCase() === myCode) {
          const exists = user.playerState.referrals.recruits.some(
            (r: any) => r.id === other.userId || r.name === other.name || (r.email && r.email.toLowerCase() === em.toLowerCase())
          );
          if (!exists) {
            user.playerState.referrals.recruits.unshift({
              id: other.userId,
              name: other.name || em.split('@')[0],
              email: em,
              joinedAt: other.createdAt || Date.now(),
              level: other.level || other.playerState?.level || 1,
              tier: 1,
              dailyGameplayEarned: 100,
              totalGeneratedGreen: 10,
              lastActive: 'Active Operative'
            });
            modified = true;
          }
        }
      }

      if (modified) {
        user.playerState.referrals.totalRecruits = user.playerState.referrals.recruits.length;
        user.playerState.referrals.networkTotalCitizens = user.playerState.referrals.recruits.length;
        users[email] = user;
        saveUsers(users);
        pushToMaster(users).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      email,
      name: user.name,
      userId: user.userId,
      userReferralCode: user.userReferralCode,
      playerState: user.playerState || null,
      lastSaveAt: user.lastSaveAt || null
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/player/sync
export async function POST(req: NextRequest) {
  try {
    const { email, playerState } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !playerState) {
      return NextResponse.json({ success: false, message: 'Email and playerState required' }, { status: 400 });
    }

    let users = loadUsers();
    let user = users[cleanEmail];

    // If user record not found in local runner memory, check master storage
    if (!user) {
      try {
        const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
        if (remoteRes.ok) {
          const remoteUsers = await remoteRes.json();
          if (remoteUsers[cleanEmail]) {
            users = { ...users, ...remoteUsers };
            user = users[cleanEmail];
          }
        }
      } catch {}
    }

    if (!user) {
      // Create minimal user stub if player is saving valid game state
      user = {
        userId: playerState.id || `usr_${Date.now()}`,
        email: cleanEmail,
        name: playerState.name || cleanEmail.split('@')[0],
        userReferralCode: playerState.referrals?.referralCode || `NEON-${Date.now().toString(36).toUpperCase()}`,
        referredBy: playerState.referrals?.referredBy || null,
        createdAt: Date.now()
      };
    }

    // Preserve and merge existing recruits so a client save never wipes real downlines
    const existingRecruits = (user.playerState?.referrals?.recruits && Array.isArray(user.playerState.referrals.recruits))
      ? user.playerState.referrals.recruits
      : [];

    const incomingRecruits = (playerState.referrals?.recruits && Array.isArray(playerState.referrals.recruits))
      ? playerState.referrals.recruits
      : [];

    const mergedRecruits = [...incomingRecruits];
    for (const er of existingRecruits) {
      if (!mergedRecruits.some((r: any) => r.id === er.id || (r.email && er.email && r.email.toLowerCase() === er.email.toLowerCase()))) {
        mergedRecruits.push(er);
      }
    }

    // Auto-discover any new recruits from the users database who registered using my code
    const myRefCode = (user.userReferralCode || playerState.referrals?.referralCode || '').toUpperCase();
    if (myRefCode) {
      for (const [em, other] of Object.entries(users)) {
        if (em.toLowerCase() !== cleanEmail && other.referredBy && other.referredBy.toUpperCase() === myRefCode) {
          if (!mergedRecruits.some((r: any) => r.id === other.userId || (r.email && r.email.toLowerCase() === em.toLowerCase()))) {
            mergedRecruits.unshift({
              id: other.userId,
              name: other.name || em.split('@')[0],
              email: em,
              joinedAt: other.createdAt || Date.now(),
              level: other.level || 1,
              tier: 1,
              dailyGameplayEarned: 100,
              totalGeneratedGreen: 10,
              lastActive: 'Active Operative'
            });
          }
        }
      }
    }

    if (!playerState.referrals) {
      playerState.referrals = {
        referralCode: myRefCode,
        recruits: mergedRecruits,
        totalRecruits: mergedRecruits.length,
        networkTotalCitizens: mergedRecruits.length,
        unclaimedCommissionGreen: 0,
        lifetimeCommissionGreen: 0,
        claimedMilestones: [],
      };
    } else {
      playerState.referrals.recruits = mergedRecruits;
      playerState.referrals.totalRecruits = mergedRecruits.length;
      playerState.referrals.networkTotalCitizens = mergedRecruits.length;
    }

    // Update with latest player state
    user.playerState = playerState;
    if (playerState.money !== undefined) user.money = Number(playerState.money);
    if (playerState.dreamPoints !== undefined) user.sparks = Number(playerState.dreamPoints);
    if (playerState.level !== undefined) user.level = Number(playerState.level);
    if (playerState.rank !== undefined) user.rank = playerState.rank;
    if (playerState.name) user.name = playerState.name;
    user.lastSaveAt = Date.now();
    user.lastLoginAt = Date.now();
    users[cleanEmail] = user;

    saveUsers(users);

    // Asynchronously push to master cluster storage (non-blocking)
    pushToMaster(users).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Operative game state successfully backed up to cluster!',
      lastSaveAt: user.lastSaveAt
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
