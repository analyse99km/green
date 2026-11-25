import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import {
  CATALOG_FILE,
  cleanReferralInput,
  findRecruiterEmail,
  fetchMasterUsersFresh,
  loadLocalUsers,
  mergeUsersDictionaries,
  reconcileAllReferrals,
  mutateMasterUsers,
} from '@/lib/masterDb';

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
    dailyRecruitStipend: 50,
  };
}

// POST /api/referral - Redeem code & affiliate recruit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, recruitEmail, recruitName, recruitUserId, recruitTelegramId } = body;

    const cleanCode = cleanReferralInput(referralCode || '');
    const cleanRecruitEmail = String(recruitEmail || '').trim().toLowerCase();

    if (!cleanCode) {
      return NextResponse.json({ success: false, message: 'Referral code is required.' }, { status: 400 });
    }

    const rewardsCfg = getReferralRewardsConfig();
    const bounty = Number(rewardsCfg.recruiterInstantBounty) || 100;

    let errStatus: number | null = null;
    let errMessage = '';
    let resultMeta = {
      recruiterName: 'Operative',
      recruiterEmail: '',
      canonicalCode: cleanCode,
    };

    const isRelay = req.headers.get('x-cluster-relay') === '1';
    await mutateMasterUsers(
      'referral network update [skip ci]',
      (users) => {
      const recruiterEmail = findRecruiterEmail(users, cleanCode);

      if (!recruiterEmail || !users[recruiterEmail]) {
        errStatus = 404;
        errMessage = `Referral code "${cleanCode}" was not found. Verify your sponsor's invite code and try again.`;
        return;
      }

      const recruiter = users[recruiterEmail];
      if (
        (cleanRecruitEmail && recruiterEmail.toLowerCase() === cleanRecruitEmail) ||
        (recruitUserId && recruiter.userId && recruiter.userId === recruitUserId) ||
        (recruitTelegramId && recruiter.telegramId && String(recruiter.telegramId) === String(recruitTelegramId))
      ) {
        errStatus = 400;
        errMessage = 'You cannot redeem your own referral code.';
        return;
      }

      const canonicalCode = (
        recruiter.userReferralCode ||
        recruiter.playerState?.referrals?.referralCode ||
        cleanCode
      ).toUpperCase();

      resultMeta = {
        recruiterName: recruiter.name || recruiter.playerState?.name || 'Operative',
        recruiterEmail,
        canonicalCode,
      };

      const effectiveName = recruitName || (cleanRecruitEmail ? cleanRecruitEmail.split('@')[0] : 'New Operative');
      const effectiveId =
        recruitUserId || (cleanRecruitEmail ? `usr_${cleanRecruitEmail.slice(0, 8)}` : `usr_${Date.now()}`);

      // Locate existing recruit record accurately
      let targetRecruitKey = cleanRecruitEmail && users[cleanRecruitEmail] ? cleanRecruitEmail : '';
      if (!targetRecruitKey) {
        for (const [em, u] of Object.entries(users)) {
          if (
            (cleanRecruitEmail && (em.toLowerCase() === cleanRecruitEmail || u.email?.toLowerCase() === cleanRecruitEmail)) ||
            (recruitUserId && (u.userId === recruitUserId || u.playerState?.id === recruitUserId)) ||
            (recruitTelegramId && String(u.telegramId) === String(recruitTelegramId))
          ) {
            targetRecruitKey = em;
            break;
          }
        }
      }
      if (!targetRecruitKey) {
        targetRecruitKey = cleanRecruitEmail || `${effectiveId}@neon.city`;
      }

      const existingRecruit = users[targetRecruitKey];
      const existingSponsor = existingRecruit?.referredBy || existingRecruit?.playerState?.referrals?.referredBy;
      if (existingSponsor) {
        errStatus = 409;
        errMessage = `You are already sponsored under "${existingSponsor}".`;
        return;
      }

      if (!existingRecruit) {
        users[targetRecruitKey] = {
          userId: effectiveId,
          email: targetRecruitKey,
          name: effectiveName,
          telegramId: recruitTelegramId || undefined,
          userReferralCode: `NEON-${Date.now().toString(36).toUpperCase()}`,
          referredBy: canonicalCode,
          createdAt: Date.now(),
          lastSaveAt: Date.now(),
          playerState: {
            id: effectiveId,
            name: effectiveName,
            referrals: {
              referredBy: canonicalCode,
              hasClaimedWelcomeBonus: true,
              recruits: [],
              totalRecruits: 0,
              networkTotalCitizens: 0,
              unclaimedCommissionGreen: 0,
              lifetimeCommissionGreen: 0,
              claimedMilestones: [],
            },
          },
        };
      } else {
        existingRecruit.referredBy = canonicalCode;
        if (!existingRecruit.playerState) existingRecruit.playerState = {};
        if (!existingRecruit.playerState.referrals) existingRecruit.playerState.referrals = {};
        existingRecruit.playerState.referrals.referredBy = canonicalCode;
        existingRecruit.playerState.referrals.hasClaimedWelcomeBonus = true;
        existingRecruit.lastSaveAt = Date.now();
      }

      reconcileAllReferrals(users, bounty);
    },
    { endpoint: '/api/referral', payload: body, isRelay }
  );

    if (errStatus) {
      return NextResponse.json({ success: false, message: errMessage }, { status: errStatus });
    }

    return NextResponse.json({
      success: true,
      message: `Syndicate affiliation confirmed! You are now part of ${resultMeta.recruiterName}'s network.`,
      recruiterName: resultMeta.recruiterName,
      recruiterEmail: resultMeta.recruiterEmail,
      referralCode: resultMeta.canonicalCode,
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

    const localUsers = loadLocalUsers();
    const { users: remoteUsers } = await fetchMasterUsersFresh();
    const users = mergeUsersDictionaries(localUsers, remoteUsers);
    reconcileAllReferrals(users);

    const user = users[email];
    if (!user) {
      return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
    }

    const refs = user.playerState?.referrals || {
      referralCode: user.userReferralCode || '',
      recruits: [],
      totalRecruits: 0,
      networkTotalCitizens: 0,
      unclaimedCommissionGreen: 0,
      lifetimeCommissionGreen: 0,
    };

    const currentRecruits = Array.isArray(refs.recruits) ? refs.recruits : [];
    refs.recruits = currentRecruits;
    refs.totalRecruits = Math.max(Number(refs.totalRecruits || 0), currentRecruits.filter((r: any) => (r.tier || 1) === 1).length);
    refs.networkTotalCitizens = Math.max(Number(refs.networkTotalCitizens || 0), currentRecruits.length);

    return NextResponse.json({
      success: true,
      referrals: refs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
