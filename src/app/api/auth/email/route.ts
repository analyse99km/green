import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

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

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, name, referralCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const existingUser = users[cleanEmail];

    // ── STRICT REGISTRATION FLOW ──────────────────────────────────────────
    if (action === 'register') {
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: 'An account with this email already exists! Please click "Sign In" to access your operative.',
          },
          { status: 409 }
        );
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      const userHash = crypto.createHash('sha256').update(cleanEmail).digest('hex');
      const userId = `usr_${userHash.slice(0, 16)}`;
      const username = (name && String(name).trim()) || cleanEmail.split('@')[0];
      const userReferralCode = `NEON-${userHash.slice(0, 8).toUpperCase()}`;

      const newUser = {
        userId,
        email: cleanEmail,
        name: username,
        salt,
        passwordHash,
        userReferralCode,
        referredBy: referralCode ? String(referralCode).trim().toUpperCase() : null,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };

      users[cleanEmail] = newUser;
      saveUsers(users);

      return buildAuthResponse(newUser, 'Account successfully created and registered!');
    }

    // ── STRICT SIGN IN FLOW ───────────────────────────────────────────────
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'No operative found with this email. Please switch to "Register Account" first to create your profile.',
        },
        { status: 404 }
      );
    }

    // Verify password hash with salt
    const testHash = crypto.pbkdf2Sync(password, existingUser.salt, 1000, 64, 'sha512').toString('hex');
    if (testHash !== existingUser.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect password! Please check your credentials and try again.',
        },
        { status: 401 }
      );
    }

    // Update last login
    existingUser.lastLoginAt = Date.now();
    users[cleanEmail] = existingUser;
    saveUsers(users);

    return buildAuthResponse(existingUser, 'Authenticated successfully!');
  } catch (error) {
    console.error('Email Auth Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal authentication server error.' },
      { status: 500 }
    );
  }
}

function buildAuthResponse(user: any, message: string) {
  const tokenPayload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userReferralCode: user.userReferralCode,
    referredBy: user.referredBy || null,
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
    referredBy: user.referredBy || null,
    sessionToken,
  });

  response.cookies.set('metropolis_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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
