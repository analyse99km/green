import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashSellerPassword, verifySellerGitHubVault } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { storeIdentifier, sellerId, password, githubToken } = await request.json();

    if (!storeIdentifier || !sellerId || !password) {
      return NextResponse.json(
        { success: false, error: 'Store Slug/Number, Seller ID, and Password are required.' },
        { status: 400 }
      );
    }

    const cleanId = storeIdentifier.trim().replace(/^#/, '').replace(/^no-/i, '');
    let store = null;
    if (/^\d+$/.test(cleanId)) {
      store = await db.getStoreByNumber(parseInt(cleanId, 10));
    }
    if (!store) {
      store = await db.getStoreBySlug(cleanId);
    }

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found.' }, { status: 404 });
    }

    // 1. If store uses a Private GitHub Vault, verify directly against the private GitHub repo
    if (store.githubVaultRepo) {
      if (!githubToken || !githubToken.trim()) {
        return NextResponse.json(
          {
            success: false,
            requireGitHubToken: true,
            error: `This store's credentials are locked in private GitHub repo "${store.githubVaultRepo}". Please enter your GitHub PAT.`,
          },
          { status: 401 }
        );
      }

      const vaultCheck = await verifySellerGitHubVault(
        githubToken,
        store.githubVaultRepo,
        store.slug,
        sellerId,
        password
      );
      if (!vaultCheck.ok) {
        return NextResponse.json({ success: false, error: vaultCheck.message }, { status: 401 });
      }
      return NextResponse.json({ success: true, store, vaultVerified: true });
    }

    // 2. Standard credential verification for stores with sellerPasswordHash
    if (store.sellerId && store.sellerPasswordHash) {
      if (store.sellerId !== sellerId.trim() || store.sellerPasswordHash !== hashSellerPassword(password)) {
        return NextResponse.json({ success: false, error: 'Invalid Seller ID or Password.' }, { status: 401 });
      }
      return NextResponse.json({ success: true, store });
    }

    // 3. Seed demo stores fallback (demo / demo123)
    if (sellerId.trim() === 'demo' && password === 'demo123') {
      return NextResponse.json({ success: true, store });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid Seller ID or Password. (For pre-seeded Zurich demo stores, use ID: demo / Pass: demo123)' },
      { status: 401 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
