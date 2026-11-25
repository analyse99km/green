import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  cleanReferralInput,
  findRecruiterEmail,
  reconcileAllReferrals,
  mutateMasterUsers,
} from '@/lib/masterDb';

function buildAuthResponse(user: any, message: string) {
  const finalReferredBy = user.referredBy || user.playerState?.referrals?.referredBy || null;
  if (finalReferredBy) {
    user.referredBy = finalReferredBy;
    if (!user.playerState) user.playerState = {};
    if (!user.playerState.referrals) user.playerState.referrals = {};
    user.playerState.referrals.referredBy = finalReferredBy;
    user.playerState.referrals.hasClaimedWelcomeBonus = true;
  }

  const tokenPayload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userReferralCode: user.userReferralCode,
    referredBy: finalReferredBy,
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
    referredBy: finalReferredBy,
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
    let resultingUser: any = null;
    let isReturning = false;
    const isRelay = req.headers.get('x-cluster-relay') === '1';

    await mutateMasterUsers(
      'telegram sso user sync [skip ci]',
      (users) => {
      let targetKey = Object.keys(users).find(
        (k) => String(users[k].telegramId) === tgId || k.toLowerCase() === tgEmail || users[k].email === tgEmail
      );
      let targetUser = targetKey ? users[targetKey] : null;

      if (targetUser && targetKey) {
        isReturning = true;
        targetUser.lastLoginAt = Date.now();
        if (user.first_name && !targetUser.name) {
          targetUser.name = [user.first_name, user.last_name].filter(Boolean).join(' ');
        }
        // Attribute sponsor if returning user never had one yet
        const currentSponsor = targetUser.referredBy || targetUser.playerState?.referrals?.referredBy;
        if ((!currentSponsor || currentSponsor === 'null') && referralCode) {
          const cleanRef = cleanReferralInput(String(referralCode));
          const recruiterEmail = findRecruiterEmail(users, cleanRef);
          if (recruiterEmail && users[recruiterEmail] && recruiterEmail.toLowerCase() !== targetUser.email.toLowerCase()) {
            const recruiter = users[recruiterEmail];
            const canonicalCode = (
              recruiter.userReferralCode ||
              recruiter.playerState?.referrals?.referralCode ||
              cleanRef
            ).toUpperCase();
            targetUser.referredBy = canonicalCode;
            if (!targetUser.playerState) targetUser.playerState = {};
            if (!targetUser.playerState.referrals) targetUser.playerState.referrals = {};
            targetUser.playerState.referrals.referredBy = canonicalCode;
            targetUser.playerState.referrals.hasClaimedWelcomeBonus = true;
          }
        }
        reconcileAllReferrals(users);
        users[targetKey] = targetUser;
        resultingUser = targetUser;
        return;
      }

      // Brand new Telegram Operative - auto-provision account
      const displayName =
        [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || `Operative #${tgId}`;
      const userReferralCode = `NEON-TG-${tgId}`;

      const rawRef = referralCode ? cleanReferralInput(String(referralCode)) : '';
      let resolvedReferredBy: string | null = rawRef || null;
      if (rawRef) {
        const recruiterEmail = findRecruiterEmail(users, rawRef);
        if (recruiterEmail && users[recruiterEmail]) {
          const recruiter = users[recruiterEmail];
          resolvedReferredBy = (
            recruiter.userReferralCode ||
            recruiter.playerState?.referrals?.referralCode ||
            rawRef
          ).toUpperCase();
        }
      }

      const newUser: any = {
        userId: `usr_tg_${tgId}`,
        email: tgEmail,
        telegramId: user.id,
        name: displayName,
        username: user.username || null,
        userReferralCode,
        referredBy: resolvedReferredBy,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        lastSaveAt: Date.now(),
        playerState: {
          id: `usr_tg_${tgId}`,
          name: displayName,
          money: resolvedReferredBy ? 100 : 0,
          dreamPoints: resolvedReferredBy ? 500 : 0,
          energy: 100,
          maxEnergy: 100,
          nerve: 15,
          maxNerve: 15,
          happy: 100,
          maxHappy: 100,
          life: 100,
          maxLife: 100,
          food: 100,
          level: 1,
          claimedMissionIds: [],
          referrals: {
            referralCode: userReferralCode,
            referredBy: resolvedReferredBy,
            hasClaimedWelcomeBonus: Boolean(resolvedReferredBy),
            recruits: [],
            totalRecruits: 0,
            networkTotalCitizens: 0,
            unclaimedCommissionGreen: 0,
            lifetimeCommissionGreen: 0,
            claimedMilestones: [],
          },
        },
      };

      users[tgEmail] = newUser;
      reconcileAllReferrals(users);
      resultingUser = users[tgEmail];
    },
    { endpoint: '/api/auth/telegram', payload: { user, referralCode }, isRelay }
    );

    return buildAuthResponse(
      resultingUser,
      isReturning ? 'Welcome back, Operative!' : 'Telegram Operative activated successfully!'
    );
  } catch (error) {
    console.error('Telegram Auth Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal authentication server error.' },
      { status: 500 }
    );
  }
}
