import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

    // Derive deterministic user seed from email
    const userHash = crypto.createHash('sha256').update(`${email.trim().toLowerCase()}`).digest('hex');
    const userId = `usr_${userHash.slice(0, 16)}`;
    const username = (name && String(name).trim()) || email.split('@')[0];
    const userReferralCode = `NEON-${userHash.slice(0, 8).toUpperCase()}`;

    // Session token
    const tokenPayload = {
      userId,
      email: email.trim().toLowerCase(),
      name: username,
      userReferralCode,
      referralCode: referralCode ? String(referralCode).trim().toUpperCase() : null,
      action: action || 'login',
      timestamp: Date.now(),
    };

    const secret = process.env.SESSION_SECRET || 'metropolis_decentralized_gossip_key_2026';
    const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(tokenPayload)).digest('hex');
    const sessionToken = Buffer.from(JSON.stringify({ ...tokenPayload, sig: signature })).toString('base64');

    const response = NextResponse.json({
      success: true,
      message: action === 'register' ? 'Account successfully registered!' : 'Authenticated successfully!',
      userId,
      username,
      email: email.trim().toLowerCase(),
      userReferralCode,
      referredBy: referralCode ? String(referralCode).trim().toUpperCase() : null,
      sessionToken,
    });

    // Set HTTP-only cookie valid for 30 days
    response.cookies.set('metropolis_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Email Auth Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal authentication server error.' },
      { status: 500 }
    );
  }
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
