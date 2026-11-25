import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  cleanReferralInput,
  findRecruiterEmail,
  fetchMasterUsersFresh,
  loadLocalUsers,
  saveLocalUsers,
  mergeUsersDictionaries,
  reconcileAllReferrals,
  mutateMasterUsers,
} from '@/lib/masterDb';

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, name, referralCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // ── STRICT REGISTRATION FLOW ──────────────────────────────────────────
    if (action === 'register') {
      let conflict = false;
      let createdUser: any = null;
      const isRelay = req.headers.get('x-cluster-relay') === '1';

      await mutateMasterUsers(
        'users sync update [skip ci]',
        (users) => {
        if (users[cleanEmail]) {
          conflict = true;
          return;
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        const userHash = crypto.createHash('sha256').update(cleanEmail).digest('hex');
        const userId = `usr_${userHash.slice(0, 16)}`;
        const username = (name && String(name).trim()) || cleanEmail.split('@')[0];
        const userReferralCode = `NEON-${userHash.slice(0, 8).toUpperCase()}`;

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

        createdUser = {
          userId,
          email: cleanEmail,
          name: username,
          salt,
          passwordHash,
          userReferralCode,
          referredBy: resolvedReferredBy,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          lastSaveAt: Date.now(),
          playerState: {
            id: userId,
            name: username,
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

        users[cleanEmail] = createdUser;
        reconcileAllReferrals(users);
      },
      { endpoint: '/api/auth/email', payload: { action, email, password, name, referralCode }, isRelay }
      );

      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            message: 'An account with this email already exists! Please click "Sign In" to access your operative.',
          },
          { status: 409 }
        );
      }

      return buildAuthResponse(createdUser, 'Account successfully created and registered!');
    }

    // ── STRICT SIGN IN FLOW ───────────────────────────────────────────────
    // Always merge fresh Master DB + local disk so login across runners NEVER returns stale state!
    const localUsers = loadLocalUsers();
    const { users: remoteUsers } = await fetchMasterUsersFresh();
    const users = mergeUsersDictionaries(localUsers, remoteUsers);
    reconcileAllReferrals(users);

    const currentTargetUser = users[cleanEmail];
    if (!currentTargetUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'No operative found with this email. Please switch to "Register Account" first to create your profile.',
        },
        { status: 404 }
      );
    }

    // Verify password hash with salt
    const testHash = crypto.pbkdf2Sync(password, currentTargetUser.salt, 1000, 64, 'sha512').toString('hex');
    if (testHash !== currentTargetUser.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect password! Please check your credentials and try again.',
        },
        { status: 401 }
      );
    }

    // Update last login & save merged state locally
    currentTargetUser.lastLoginAt = Date.now();
    users[cleanEmail] = currentTargetUser;
    saveLocalUsers(users);

    return buildAuthResponse(currentTargetUser, 'Authenticated successfully!');
  } catch (error) {
    console.error('Email Auth Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal authentication server error.' }, { status: 500 });
  }
}

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
    userReferralCode: user.userReferralCode,
    referredBy: finalReferredBy,
    sessionToken,
    playerState: user.playerState || null,
  });

  // Enable SameSite=None and Secure for smooth iframe authentication
  response.cookies.set('metropolis_session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('metropolis_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(raw);
    return NextResponse.json({ authenticated: true, user: payload });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('metropolis_session');
  return response;
}
