import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json');
const MASTER_STORAGE_REPO = 'pocomon9/green-status';
const MASTER_PAT = process.env.GH_PAT || process.env.MASTER_PAT || '';

function getReferralRewardsConfig() {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const cat = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8'));
      if (cat.referralRewards) return cat.referralRewards;
    }
  } catch {}
  return {
    recruiterInstantBounty: 100,
    recruitWelcomeBonus: 100,
    dailyRecruitStipend: 50
  };
}

function loadUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load users for referral:', err);
  }
  return {};
}

function saveUsers(users: Record<string, any>) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users from referral:', err);
  }
}

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
      message: 'referral network update [skip ci]',
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
    console.warn('Asynchronous master push error in referral:', err);
  }
}

function findRecruiterEmail(users: Record<string, any>, rawRef: string): string | null {
  if (!rawRef) return null;
  const clean = String(rawRef).trim().toUpperCase();
  const stripped = clean.replace(/^(REF[_-]|NEON[_-]|TG[_-])+/, '');
  const tgCandidate = stripped.replace(/[^0-9]/g, '');

  for (const [em, u] of Object.entries(users)) {
    const userRef = (u.userReferralCode || '').toUpperCase();
    const stateRef = (u.playerState?.referrals?.referralCode || '').toUpperCase();
    const tgId = String(u.telegramId || '').toUpperCase();
    const userId = (u.userId || '').toUpperCase();

    if (
      userRef === clean ||
      stateRef === clean ||
      (stripped.length > 3 && userRef.includes(stripped)) ||
      (stripped.length > 3 && stateRef.includes(stripped)) ||
      (tgId && (tgId === clean || tgId === stripped || (tgCandidate && tgId === tgCandidate))) ||
      (userId && userId === clean) ||
      em.toUpperCase() === clean
    ) {
      return em;
    }
  }
  return null;
}

// POST /api/referral - Redeem code & affiliate recruit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, referralCode, recruitEmail, recruitName, recruitUserId } = body;

    const cleanCode = String(referralCode || '').trim().toUpperCase();
    const cleanRecruitEmail = String(recruitEmail || '').trim().toLowerCase();

    if (!cleanCode) {
      return NextResponse.json({ success: false, message: 'Referral code is required.' }, { status: 400 });
    }

    let users = loadUsers();

    // Check remote storage if not found locally
    if (Object.keys(users).length === 0) {
      try {
        const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
        if (remoteRes.ok) {
          users = await remoteRes.json();
          saveUsers(users);
        }
      } catch {}
    }

    // Find recruiter with universal matcher
    let recruiterEmail = findRecruiterEmail(users, cleanCode);

    if (!recruiterEmail) {
      try {
        const remoteRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`);
        if (remoteRes.ok) {
          const remoteUsers = await remoteRes.json();
          for (const [em, rUser] of Object.entries(remoteUsers as Record<string, any>)) {
            if (!users[em]) users[em] = rUser;
          }
          recruiterEmail = findRecruiterEmail(users, cleanCode);
        }
      } catch {}
    }

    if (!recruiterEmail || !users[recruiterEmail]) {
      return NextResponse.json({ success: false, message: `Operative code "${cleanCode}" not found in City records.` }, { status: 404 });
    }

    if (cleanRecruitEmail && recruiterEmail.toLowerCase() === cleanRecruitEmail) {
      return NextResponse.json({ success: false, message: 'You cannot redeem your own referral code.' }, { status: 400 });
    }

    const recruiter = users[recruiterEmail];
    if (!recruiter.playerState) recruiter.playerState = {};
    if (!recruiter.playerState.referrals) {
      recruiter.playerState.referrals = {
        referralCode: recruiter.userReferralCode || cleanCode,
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

    const effectiveName = recruitName || (cleanRecruitEmail ? cleanRecruitEmail.split('@')[0] : 'New Operative');
    const effectiveId = recruitUserId || (cleanRecruitEmail ? `usr_${cleanRecruitEmail.slice(0, 8)}` : `usr_${Date.now()}`);

    // Check if recruit already recorded
    const existingIndex = recruiter.playerState.referrals.recruits.findIndex(
      (r: any) =>
        r.id === effectiveId ||
        (cleanRecruitEmail && r.email && r.email.toLowerCase() === cleanRecruitEmail) ||
        r.name === effectiveName
    );

    const rewardsCfg = getReferralRewardsConfig();
    const bounty = Number(rewardsCfg.recruiterInstantBounty) || 100;

    if (existingIndex === -1) {
      recruiter.playerState.referrals.recruits.unshift({
        id: effectiveId,
        name: effectiveName,
        email: cleanRecruitEmail || `${effectiveId}@neon.city`,
        joinedAt: Date.now(),
        level: 1,
        tier: 1,
        dailyGameplayEarned: 150,
        totalGeneratedGreen: 50,
        lastActive: 'Active today (Code Redeem)'
      });
      recruiter.playerState.referrals.totalRecruits = recruiter.playerState.referrals.recruits.length;
      recruiter.playerState.referrals.networkTotalCitizens = recruiter.playerState.referrals.recruits.length;
      recruiter.playerState.referrals.unclaimedCommissionGreen = (recruiter.playerState.referrals.unclaimedCommissionGreen || 0) + bounty;
      recruiter.playerState.referrals.lifetimeCommissionGreen = (recruiter.playerState.referrals.lifetimeCommissionGreen || 0) + bounty;
    }

    // Ensure recruit's record is permanently registered with referredBy
    const userKey = cleanRecruitEmail || `${effectiveId}@neon.city`;
    if (!users[userKey]) {
      users[userKey] = {
        userId: effectiveId,
        email: userKey,
        name: effectiveName,
        userReferralCode: `NEON-${Date.now().toString(36).toUpperCase()}`,
        referredBy: cleanCode,
        createdAt: Date.now(),
        playerState: {
          referrals: {
            referredBy: cleanCode,
            hasClaimedWelcomeBonus: true,
          }
        }
      };
    } else {
      users[userKey].referredBy = cleanCode;
      if (!users[userKey].playerState) users[userKey].playerState = {};
      if (!users[userKey].playerState.referrals) users[userKey].playerState.referrals = {};
      users[userKey].playerState.referrals.referredBy = cleanCode;
      users[userKey].playerState.referrals.hasClaimedWelcomeBonus = true;
    }

    users[recruiterEmail] = recruiter;
    saveUsers(users);
    pushToMaster(users).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Syndicate affiliation confirmed! You are now part of ${recruiter.name || 'Operative'}'s network.`,
      recruiterName: recruiter.name || 'Operative',
      recruiterEmail,
      referralCode: cleanCode,
      bonusGreen: Number(rewardsCfg.recruitWelcomeBonus) || 100,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// GET /api/referral?email=...
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    }

    const users = loadUsers();
    const user = users[email];

    if (!user) {
      return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
    }

    const refs = user.playerState?.referrals || {
      referralCode: user.userReferralCode || '',
      recruits: [],
      totalRecruits: 0,
      unclaimedCommissionGreen: 0,
      lifetimeCommissionGreen: 0,
    };

    return NextResponse.json({
      success: true,
      referrals: refs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
