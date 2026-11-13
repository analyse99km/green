import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncStoreDataToGitHub } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await db.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const products = await db.getProductsByStoreId(store.id);
    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await db.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!body.title || body.price === undefined) {
      return NextResponse.json({ success: false, error: 'Title and price are required' }, { status: 400 });
    }

    const product = await db.createProduct({
      storeId: store.id,
      title: body.title,
      description: body.description || '',
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
      currency: body.currency || 'USD',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'],
      inventory: body.inventory !== undefined ? parseInt(body.inventory, 10) : 50,
      customDeliveryRadiusKm: body.customDeliveryRadiusKm ? parseFloat(body.customDeliveryRadiusKm) : undefined,
      allowCod: Boolean(body.allowCod),
      addons: Array.isArray(body.addons) ? body.addons : [],
      fakeStockAlarm: body.fakeStockAlarm ? parseInt(body.fakeStockAlarm, 10) : undefined,
      saleCountdownEndsAt: body.saleCountdownEndsAt || undefined,
      isFamousDish: Boolean(body.isFamousDish),
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : []),
    });

    // Sync products.json to seller's GitHub repo if GitHub storage & live PAT are provided
    if (store.storageProvider === 'GITHUB' && body.githubToken && store.storageConfig?.githubRepo) {
      const allStoreProducts = await db.getProductsByStoreId(store.id);
      await syncStoreDataToGitHub(
        body.githubToken,
        store.storageConfig.githubRepo,
        store.storageConfig.githubBranch || 'main',
        store.slug,
        'products.json',
        allStoreProducts
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
