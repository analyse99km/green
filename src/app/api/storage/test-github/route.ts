import { NextRequest, NextResponse } from 'next/server';
import { testGitHubAccess } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { token, repo } = await request.json();

    if (!token || !repo) {
      return NextResponse.json({ ok: false, message: 'GitHub Token and Repo name are required.' }, { status: 400 });
    }

    const test = await testGitHubAccess(token, repo);
    return NextResponse.json(test);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
