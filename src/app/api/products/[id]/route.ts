import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncStoreDataToGitHub } from '@/lib/storage';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Sync to seller's GitHub repository if configured
    try {
      const stores = await db.getAllStores();
      const store = stores.find((s: any) => s.id === updated.storeId);
      if (store && store.storageProvider === 'GITHUB' && store.storageConfig?.githubRepo) {
        const token = body.githubToken || store.storageConfig.githubToken;
        if (token) {
          const storeProducts = await db.getProductsByStoreId(store.id);
          await syncStoreDataToGitHub(
            token,
            store.storageConfig.githubRepo,
            store.storageConfig.githubBranch || 'main',
            store.slug,
            'products.json',
            storeProducts
          );
        }
      }
    } catch (gitErr) {
      console.warn('GitHub sync notice during product update:', gitErr);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
