import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashSellerPassword, verifyGitHubOwnerToken, saveSellerVaultToGitHub } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let store = null;
    if (slug.startsWith('no-')) {
      const num = parseInt(slug.replace('no-', ''), 10);
      if (!isNaN(num)) {
        store = await db.getStoreByNumber(num);
      }
    }

    if (!store) {
      store = await db.getStoreBySlug(slug);
    }

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, store });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const store = await db.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Protect administrative fields from regular seller editing
    delete body.id;
    delete body.storeNumber;
    delete body.isVerified;
    delete body.isSuspended;
    delete body.suspensionReason;
    delete body.sellerPasswordHash;

    // Read-only protection for paymentConfig and connected GitHub repos
    const isSensitiveChange = Boolean(body.paymentConfig || body.storageConfig || body.storageProvider);
    if (isSensitiveChange) {
      const ownerPat = body.ownerGithubToken;
      const sellerPass = body.sellerPassword;
      const targetRepo = store.githubVaultRepo || store.storageConfig?.githubRepo;

      if (targetRepo) {
        if (!ownerPat) {
          return NextResponse.json(
            { success: false, error: 'Read-only: Owner GitHub PAT is required to modify payment config or connected repos.' },
            { status: 403 }
          );
        }
        const check = await verifyGitHubOwnerToken(ownerPat, targetRepo);
        if (!check.ok) {
          return NextResponse.json({ success: false, error: check.message }, { status: 403 });
        }
        if (body.paymentConfig && store.githubVaultRepo && store.sellerId && store.sellerPasswordHash) {
          await saveSellerVaultToGitHub(
            ownerPat,
            store.slug,
            store.sellerId,
            store.sellerPasswordHash,
            body.paymentConfig
          );
        }
      } else if (store.sellerPasswordHash) {
        if (!sellerPass || hashSellerPassword(sellerPass) !== store.sellerPasswordHash) {
          return NextResponse.json(
            { success: false, error: 'Read-only: Seller password is required to modify payment or storage settings.' },
            { status: 403 }
          );
        }
      }
    }

    delete body.ownerGithubToken;
    delete body.sellerPassword;

    const updated = await db.updateStore(store.id, body);
    return NextResponse.json({ success: true, store: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
