import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initGitHubStoreFolder, listStoreAssets } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    const store = await db.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const assets = await listStoreAssets(store.id, store.storageProvider, store.storageConfig);
    return NextResponse.json({ success: true, assets, provider: store.storageProvider });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, storageProvider, storageConfig } = body;

    const store = await db.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const updated = await db.updateStore(store.id, {
      storageProvider,
      storageConfig,
    });

    let folderResult = null;
    if (storageProvider === 'GITHUB' && storageConfig?.githubToken && storageConfig?.githubRepo) {
      folderResult = await initGitHubStoreFolder(store.id, store.name, storageConfig);
    }

    return NextResponse.json({ success: true, store: updated, folderResult });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
