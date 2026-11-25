import { NextRequest, NextResponse } from 'next/server';
import {
  fetchMasterUsersFresh,
  loadLocalUsers,
  saveLocalUsers,
  mergeUsersDictionaries,
  mergeUserRecords,
  reconcileAllReferrals,
  mutateMasterUsers,
} from '@/lib/masterDb';

function findUserEntry(
  users: Record<string, any>,
  { email, userId, tgId, code }: { email: string; userId: string; tgId: string; code: string }
): { key: string; user: any } | null {
  if (email && users[email]) {
    return { key: email, user: users[email] };
  }
  for (const [k, u] of Object.entries(users)) {
    if (
      (email && k.toLowerCase() === email) ||
      (email && u.email && u.email.toLowerCase() === email) ||
      (userId && (u.userId === userId || u.playerState?.id === userId)) ||
      (tgId && String(u.telegramId) === String(tgId)) ||
      (code &&
        ((u.userReferralCode || '').toUpperCase() === code ||
          (u.playerState?.referrals?.referralCode || '').toUpperCase() === code))
    ) {
      return { key: k, user: u };
    }
  }
  return null;
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
      return NextResponse.json(
        { success: false, message: 'Identifier required (email, userId, telegramId, or code)' },
        { status: 400 }
      );
    }

    const localUsers = loadLocalUsers();
    const { users: remoteUsers } = await fetchMasterUsersFresh();
    const users = mergeUsersDictionaries(localUsers, remoteUsers);

    const match = findUserEntry(users, { email, userId, tgId, code });
    if (!match) {
      return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
    }

    const { key: userKey, user } = match;

    // Synchronize referredBy between user and playerState
    const finalReferredBy = user.referredBy || user.playerState?.referrals?.referredBy || null;
    if (finalReferredBy) {
      user.referredBy = finalReferredBy;
      if (!user.playerState) user.playerState = {};
      if (!user.playerState.referrals) user.playerState.referrals = {};
      user.playerState.referrals.referredBy = finalReferredBy;
      user.playerState.referrals.hasClaimedWelcomeBonus = true;
    }

    // Reconcile downline network across all cluster users using monotonic merged state
    const modified = reconcileAllReferrals(users);
    if (modified || Object.keys(remoteUsers).length > 0) {
      saveLocalUsers(users);
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
    const currentRecruitsList = Array.isArray(user.playerState.referrals.recruits)
      ? user.playerState.referrals.recruits
      : [];
    user.playerState.referrals.recruits = currentRecruitsList;
    user.playerState.referrals.totalRecruits = Math.max(
      Number(user.playerState.referrals.totalRecruits || 0),
      currentRecruitsList.filter((r: any) => (r.tier || 1) === 1).length
    );
    user.playerState.referrals.networkTotalCitizens = Math.max(
      Number(user.playerState.referrals.networkTotalCitizens || 0),
      currentRecruitsList.length
    );

    return NextResponse.json({
      success: true,
      email: user.email || userKey,
      name: user.name,
      userId: user.userId,
      userReferralCode: user.userReferralCode || user.playerState?.referrals?.referralCode,
      referredBy: finalReferredBy,
      referrals: user.playerState?.referrals || null,
      playerState: user.playerState || null,
      lastSaveAt: user.lastSaveAt || null,
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

    const now = Date.now();
    const users = await mutateMasterUsers('cloud player state sync [skip ci]', (dict) => {
      const existingUser = dict[cleanEmail];
      const incomingUser = {
        userId: playerState.id || existingUser?.userId || `usr_${now}`,
        email: cleanEmail,
        name: playerState.name || existingUser?.name || cleanEmail.split('@')[0],
        userReferralCode:
          existingUser?.userReferralCode ||
          playerState.referrals?.referralCode ||
          `NEON-${now.toString(36).toUpperCase()}`,
        referredBy: playerState.referrals?.referredBy || existingUser?.referredBy || null,
        createdAt: existingUser?.createdAt || now,
        lastSaveAt: now,
        lastLoginAt: now,
        money: playerState.money !== undefined ? Number(playerState.money) : existingUser?.money,
        sparks: playerState.dreamPoints !== undefined ? Number(playerState.dreamPoints) : existingUser?.sparks,
        level: playerState.level !== undefined ? Number(playerState.level) : existingUser?.level,
        rank: playerState.rank !== undefined ? playerState.rank : existingUser?.rank,
        playerState: {
          ...playerState,
          lastSaveTimestamp: Math.max(Number(playerState.lastSaveTimestamp || 0), now),
        },
      };

      dict[cleanEmail] = existingUser
        ? mergeUserRecords(existingUser, incomingUser, true)
        : incomingUser;
    });

    const savedUser = users[cleanEmail];
    return NextResponse.json({
      success: true,
      message: 'Operative game state successfully backed up to cluster!',
      referrals: savedUser?.playerState?.referrals || null,
      claimedMissionIds: savedUser?.playerState?.claimedMissionIds || [],
      referredBy: savedUser?.referredBy || savedUser?.playerState?.referrals?.referredBy || null,
      lastSaveAt: savedUser?.lastSaveAt || now,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
