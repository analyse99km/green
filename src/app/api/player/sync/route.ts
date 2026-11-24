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

function matchesReferral(referredBy: string, user: any, userEmail: string): boolean {
  if (!referredBy || !user) return false;
  let ref = String(referredBy).trim();
  if (ref.includes('start=')) ref = ref.split('start=')[1].split('&')[0];
  else if (ref.includes('/start ')) ref = ref.split('/start ')[1].split(' ')[0];
  ref = ref.trim().toUpperCase();

  const stripped = ref.replace(/^(REF[_-]|NEON[_-]|TG[_-])+/, '');
  const tgCandidate = stripped.replace(/[^0-9]/g, '');

  const myCode = (user.userReferralCode || user.playerState?.referrals?.referralCode || '').toUpperCase();
  const myCodeStripped = myCode.replace(/^(REF[_-]|NEON[_-]|TG[_-])+/, '');
  const myTgId = String(user.telegramId || '').toUpperCase();
  const myUserId = String(user.userId || user.playerState?.id || '').toUpperCase();
  const myEmail = String(userEmail || user.email || '').toUpperCase();
  const myName = String(user.name || user.playerState?.name || '').toUpperCase();
  const myUsername = String(user.username || '').toUpperCase();

  return (
    myCode === ref ||
    myCode === stripped ||
    (myCodeStripped && myCodeStripped === stripped) ||
    (stripped.length >= 3 && myCode.includes(stripped)) ||
    (myTgId && (myTgId === ref || myTgId === stripped || (tgCandidate && myTgId === tgCandidate))) ||
    (myUserId && (myUserId === ref || myUserId === stripped || myUserId.includes(ref))) ||
    myEmail === ref ||
    (myUsername && (myUsername === ref || `@${myUsername}` === ref)) ||
    (myName && myName === ref)
  );
}

function reconcileAllReferrals(users: Record<string, any>): boolean {
  let modified = false;
  for (const [recruiterKey, recruiter] of Object.entries(users)) {
    if (!recruiter.playerState) recruiter.playerState = {};
    if (!recruiter.playerState.referrals) {
      recruiter.playerState.referrals = {
        referralCode: recruiter.userReferralCode || `NEON-${Date.now().toString(36).toUpperCase()}`,
        recruits: [],
        totalRecruits: 0,
        networkTotalCitizens: 0,
        unclaimedCommissionGreen: 0,
        lifetimeCommissionGreen: 0,
        claimedMilestones: [],
      };
    }
    if (!Array.isArray(recruiter.playerState.referrals.recruits)) {
      recruiter.playerState.referrals.recruits = [];
    }

    const recruits = recruiter.playerState.referrals.recruits;
    for (const [candidateKey, candidate] of Object.entries(users)) {
      if (candidateKey.toLowerCase() === recruiterKey.toLowerCase()) continue;
      const ref = candidate.referredBy || candidate.playerState?.referrals?.referredBy;
      if (ref && matchesReferral(ref, recruiter, recruiterKey)) {
        const alreadyIn = recruits.some(
          (r: any) =>
            r.id === candidate.userId ||
            r.id === candidate.playerState?.id ||
            (r.email && candidate.email && r.email.toLowerCase() === candidate.email.toLowerCase()) ||
            (candidate.telegramId && String(r.telegramId) === String(candidate.telegramId))
        );
        if (!alreadyIn) {
          recruits.unshift({
            id: candidate.userId || candidateKey,
            name: candidate.name || candidate.playerState?.name || candidateKey.split('@')[0],
            email: candidate.email || candidateKey,
            joinedAt: candidate.createdAt || Date.now(),
            level: candidate.level || candidate.playerState?.level || 1,
            tier: 1,
            dailyGameplayEarned: 150,
            totalGeneratedGreen: 50,
            lastActive: 'Active Operative'
          });
          recruiter.playerState.referrals.unclaimedCommissionGreen = (recruiter.playerState.referrals.unclaimedCommissionGreen || 0) + 100;
          recruiter.playerState.referrals.lifetimeCommissionGreen = (recruiter.playerState.referrals.lifetimeCommissionGreen || 0) + 100;
          modified = true;
        }
      }
    }
    if (recruiter.playerState.referrals.totalRecruits !== recruits.length || recruiter.playerState.referrals.networkTotalCitizens !== recruits.length) {
      recruiter.playerState.referrals.totalRecruits = recruits.length;
      recruiter.playerState.referrals.networkTotalCitizens = recruits.length;
      modified = true;
    }
  }
  return modified;
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

// GET /api/player/sync?email=user@example.com&userId=...&telegramId=...&code=...
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    const userId = (url.searchParams.get('userId') || '').trim();
    const tgId = (url.searchParams.get('telegramId') || url.searchParams.get('tgId') || '').trim();
    const code = (url.searchParams.get('code') || '').trim().toUpperCase();

    if (!email && !userId && !tgId && !code) {
      return NextResponse.json({ success: false, message: 'Identifier required (email, userId, telegramId, or code)' }, { status: 400 });
    }

    let users = loadUsers();
    let userKey = email;
    let user = email ? users[email] : null;

    if (!user) {
      for (const [k, u] of Object.entries(users)) {
        if (
          (email && k.toLowerCase() === email) ||
          (email && u.email && u.email.toLowerCase() === email) ||
          (userId && (u.userId === userId || u.playerState?.id === userId)) ||
          (tgId && String(u.telegramId) === String(tgId)) ||
          (code && ((u.userReferralCode || '').toUpperCase() === code || (u.playerState?.referrals?.referralCode || '').toUpperCase() === code))
        ) {
          userKey = k;
          user = u;
          break;
        }
      }
    }

    // If not found in local runner disk, fetch from master storage
    if (!user) {
      try {
        const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
        if (remoteRes.ok) {
          const remoteUsers = await remoteRes.json();
          users = { ...users, ...remoteUsers };
          saveUsers(users);
          for (const [k, u] of Object.entries(users)) {
            if (
              (email && k.toLowerCase() === email) ||
              (email && u.email && u.email.toLowerCase() === email) ||
              (userId && (u.userId === userId || u.playerState?.id === userId)) ||
              (tgId && String(u.telegramId) === String(tgId)) ||
              (code && ((u.userReferralCode || '').toUpperCase() === code || (u.playerState?.referrals?.referralCode || '').toUpperCase() === code))
            ) {
              userKey = k;
              user = u;
              break;
            }
          }
        }
      } catch {}
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
    }

    // Synchronize referredBy between user and playerState
    const finalReferredBy = user.referredBy || user.playerState?.referrals?.referredBy || null;
    if (finalReferredBy) {
      user.referredBy = finalReferredBy;
      if (!user.playerState) user.playerState = {};
      if (!user.playerState.referrals) user.playerState.referrals = {};
      user.playerState.referrals.referredBy = finalReferredBy;
      user.playerState.referrals.hasClaimedWelcomeBonus = true;
    }

    // Reconcile and calculate real-time downline network across all cluster users
    if (reconcileAllReferrals(users)) {
      saveUsers(users);
      pushToMaster(users).catch(() => {});
    }

    if (!user.playerState) user.playerState = {};
    if (!user.playerState.referrals) {
      user.playerState.referrals = {
        referralCode: user.userReferralCode || `NEON-${Date.now().toString(36).toUpperCase()}`,
        referredBy: finalReferredBy,
        hasClaimedWelcomeBonus: Boolean(finalReferredBy),
        recruits: [],
        totalRecruits: 0,
        networkTotalCitizens: 0,
        unclaimedCommissionGreen: 0,
        lifetimeCommissionGreen: 0,
        claimedMilestones: [],
      };
    }
    const currentRecruitsList = Array.isArray(user.playerState.referrals.recruits) ? user.playerState.referrals.recruits : [];
    user.playerState.referrals.recruits = currentRecruitsList;
    user.playerState.referrals.totalRecruits = Math.max(Number(user.playerState.referrals.totalRecruits || 0), currentRecruitsList.length);
    user.playerState.referrals.networkTotalCitizens = Math.max(Number(user.playerState.referrals.networkTotalCitizens || 0), currentRecruitsList.length);

    return NextResponse.json({
      success: true,
      email: user.email || userKey,
      name: user.name,
      userId: user.userId,
      userReferralCode: user.userReferralCode || user.playerState?.referrals?.referralCode,
      referredBy: finalReferredBy,
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
    let bonusCommissions = 0;
    for (const [em, other] of Object.entries(users)) {
      if (em.toLowerCase() !== cleanEmail) {
        const otherRef = other.referredBy || other.playerState?.referrals?.referredBy;
        if (otherRef && matchesReferral(otherRef, user, cleanEmail)) {
        if (!mergedRecruits.some((r: any) => r.id === other.userId || (r.email && r.email.toLowerCase() === em.toLowerCase()))) {
          mergedRecruits.unshift({
            id: other.userId,
            name: other.name || em.split('@')[0],
            email: em,
            joinedAt: other.createdAt || Date.now(),
            level: other.level || 1,
            tier: 1,
            dailyGameplayEarned: 100,
            totalGeneratedGreen: 50,
            lastActive: 'Active Operative'
          });
          bonusCommissions += 100;
        }
      }
    }
    }

    const myRefCode = (user.userReferralCode || playerState.referrals?.referralCode || '').toUpperCase();
    const existingClaimed = Array.isArray(user.playerState?.referrals?.claimedMilestones)
      ? user.playerState.referrals.claimedMilestones
      : [];
    const incomingClaimed = Array.isArray(playerState.referrals?.claimedMilestones)
      ? playerState.referrals.claimedMilestones
      : [];
    const mergedClaimed = Array.from(new Set([...existingClaimed, ...incomingClaimed]));

    if (!playerState.referrals) {
      playerState.referrals = {
        referralCode: myRefCode,
        recruits: mergedRecruits,
        totalRecruits: mergedRecruits.length,
        networkTotalCitizens: mergedRecruits.length,
        unclaimedCommissionGreen: bonusCommissions,
        lifetimeCommissionGreen: bonusCommissions,
        claimedMilestones: mergedClaimed,
      };
    } else {
      playerState.referrals.recruits = mergedRecruits;
      playerState.referrals.totalRecruits = mergedRecruits.length;
      playerState.referrals.networkTotalCitizens = mergedRecruits.length;
      playerState.referrals.unclaimedCommissionGreen = (playerState.referrals.unclaimedCommissionGreen || 0) + bonusCommissions;
      playerState.referrals.lifetimeCommissionGreen = (playerState.referrals.lifetimeCommissionGreen || 0) + bonusCommissions;
      playerState.referrals.claimedMilestones = mergedClaimed;
    }

    // Update with latest player state
    user.playerState = playerState;
    if (playerState.money !== undefined) user.money = Number(playerState.money);
    if (playerState.dreamPoints !== undefined) user.sparks = Number(playerState.dreamPoints);
    if (playerState.level !== undefined) user.level = Number(playerState.level);
    if (playerState.rank !== undefined) user.rank = playerState.rank;
    if (playerState.name) user.name = playerState.name;

    // Preserve and synchronize referredBy bidirectionally
    if (playerState.referrals?.referredBy) {
      user.referredBy = playerState.referrals.referredBy;
    } else if (user.referredBy) {
      if (!playerState.referrals) playerState.referrals = {};
      playerState.referrals.referredBy = user.referredBy;
    }

    user.lastSaveAt = Date.now();
    user.lastLoginAt = Date.now();
    users[cleanEmail] = user;

    // Run network-wide reconciliation across all cluster operatives
    reconcileAllReferrals(users);

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
