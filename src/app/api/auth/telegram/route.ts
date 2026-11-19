import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const MASTER_STORAGE_REPO = 'pocomon9/green-status';
const MASTER_PAT = process.env.GH_PAT || process.env.MASTER_PAT || '';

function loadUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load users:', err);
  }
  return {};
}

function saveUsers(users: Record<string, any>) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

// Push updated users to master storage asynchronously
async function pushUsersToMaster(users: Record<string, any>) {
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
      message: 'telegram sso user sync [skip ci]',
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
    console.warn('Async master push error from telegram auth:', err);
  }
}

function buildAuthResponse(user: any, message: string) {
  const tokenPayload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userReferralCode: user.userReferralCode,
    referredBy: user.referredBy || null,
    telegramId: user.telegramId || null,
    timestamp: Date.now(),
  };

  const secret = process.env.SESSION_SECRET || 'metropolis_decentralized_gossip_key_2026';
  const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(tokenPayload)).digest('hex');
  const sessionToken = Buffer.from(JSON.stringify({ ...tokenPayload, sig: signature })).toString('base64');

  const response = NextResponse.json({
    success: true,
    message,
    userId: user.userId,
    username: user.name,
    email: user.email,
    telegramId: user.telegramId || null,
    userReferralCode: user.userReferralCode,
    referredBy: user.referredBy || null,
    sessionToken,
    playerState: user.playerState || null,
  });

  response.cookies.set('metropolis_session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { user, referralCode } = await req.json();

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'Valid Telegram user data is required.' },
        { status: 400 }
      );
    }

    const tgId = String(user.id);
    const tgEmail = `tg_${tgId}@telegram.neon`;
    const users = loadUsers();

    // Find if user already exists by telegramId or email
    let targetUser = Object.values(users).find(
      (u: any) => String(u.telegramId) === tgId || u.email === tgEmail
    );

    // If not found in local runner disk, fetch master storage users.json
    if (!targetUser) {
      try {
        const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
        if (remoteRes.ok) {
          const remoteUsers = await remoteRes.json();
          for (const [rEm, rUser] of Object.entries(remoteUsers as Record<string, any>)) {
            if (!users[rEm]) users[rEm] = rUser;
            if (String(rUser.telegramId) === tgId || rEm === tgEmail) {
              targetUser = rUser;
            }
          }
        }
      } catch {}
    }

    if (targetUser) {
      // Existing player returning!
      targetUser.lastLoginAt = Date.now();
      if (user.first_name && !targetUser.name) {
        targetUser.name = [user.first_name, user.last_name].filter(Boolean).join(' ');
      }
      users[targetUser.email] = targetUser;
      saveUsers(users);
      return buildAuthResponse(targetUser, 'Welcome back, Operative!');
    }

    // Brand new Telegram Operative - auto-provision account
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || `Operative #${tgId}`;
    const userReferralCode = `NEON-TG-${tgId}`;

    const newUser: any = {
      userId: `usr_tg_${tgId}`,
      email: tgEmail,
      telegramId: user.id,
      name: displayName,
      username: user.username || null,
      userReferralCode,
      referredBy: referralCode ? String(referralCode).trim().toUpperCase() : null,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      playerState: null,
    };

    // Attribute recruiter if referral code provided
    if (newUser.referredBy) {
      const targetRefCode = newUser.referredBy;
      let recruiterEmail = Object.keys(users).find(
        em => (users[em].userReferralCode && users[em].userReferralCode.toUpperCase() === targetRefCode) ||
              (users[em].playerState?.referrals?.referralCode && users[em].playerState.referrals.referralCode.toUpperCase() === targetRefCode)
      );

      if (!recruiterEmail) {
        try {
          const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
          if (remoteRes.ok) {
            const remoteUsers = await remoteRes.json();
            for (const [rEm, rUser] of Object.entries(remoteUsers as Record<string, any>)) {
              if (!users[rEm]) users[rEm] = rUser;
              if ((rUser.userReferralCode && rUser.userReferralCode.toUpperCase() === targetRefCode) ||
                  (rUser.playerState?.referrals?.referralCode && rUser.playerState.referrals.referralCode.toUpperCase() === targetRefCode)) {
                recruiterEmail = rEm;
              }
            }
          }
        } catch {}
      }

      if (recruiterEmail && users[recruiterEmail]) {
        const recruiter = users[recruiterEmail];
        if (!recruiter.playerState) recruiter.playerState = {};
        if (!recruiter.playerState.referrals) {
          recruiter.playerState.referrals = {
            referralCode: recruiter.userReferralCode || targetRefCode,
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

        const alreadyAdded = recruiter.playerState.referrals.recruits.some(
          (r: any) => r.id === newUser.userId || r.name === newUser.name || (r.email && r.email.toLowerCase() === newUser.email.toLowerCase())
        );

        if (!alreadyAdded) {
          recruiter.playerState.referrals.recruits.unshift({
            id: newUser.userId,
            name: newUser.name,
            email: newUser.email,
            joinedAt: Date.now(),
            level: 1,
            tier: 1,
            dailyGameplayEarned: 100,
            totalGeneratedGreen: 10,
            lastActive: 'Active today (Telegram SSO)'
          });
          recruiter.playerState.referrals.totalRecruits = recruiter.playerState.referrals.recruits.length;
          recruiter.playerState.referrals.networkTotalCitizens = recruiter.playerState.referrals.recruits.length;
          recruiter.playerState.referrals.unclaimedCommissionGreen = (recruiter.playerState.referrals.unclaimedCommissionGreen || 0) + 10;
          recruiter.playerState.referrals.lifetimeCommissionGreen = (recruiter.playerState.referrals.lifetimeCommissionGreen || 0) + 10;
        }
      }
    }

    users[tgEmail] = newUser;
    saveUsers(users);
    pushUsersToMaster(users).catch(() => {});

    return buildAuthResponse(newUser, 'Telegram Operative activated successfully!');
  } catch (error) {
    console.error('Telegram Auth Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal authentication server error.' },
      { status: 500 }
    );
  }
}
