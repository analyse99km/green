import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistanceKm } from '@/lib/geo';
import {
  initGitHubStoreFolder,
  hashSellerPassword,
  saveSellerVaultToGitHub,
  syncStoreDataToGitHub,
} from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase();
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const maxRadius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null;

    let stores = await db.getAllStores();

    // Hide suspended stores from general discovery unless specifically querying by slug or admin
    stores = stores.filter((s) => !s.isSuspended);

    if (category && category !== 'ALL') {
      stores = stores.filter((s) => s.category === category);
    }

    if (query) {
      stores = stores.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          `store #${s.storeNumber}`.toLowerCase().includes(query)
      );
    }

    // Distance filtering if buyer coordinates are supplied
    if (lat !== null && lng !== null && maxRadius !== null) {
      stores = stores.filter((s) => {
        const dist = calculateDistanceKm(lat, lng, s.latitude, s.longitude);
        return dist <= Math.min(s.deliveryRadiusKm, maxRadius) || s.allowSelfPickup;
      });
    }

    return NextResponse.json({ success: true, stores });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.ownerName || !body.ownerEmail || !body.phoneNumber || !body.sellerId || !body.sellerPassword) {
      return NextResponse.json(
        { success: false, error: 'Store Name, Owner Name, Email, Phone, Seller ID, and Password are all required.' },
        { status: 400 }
      );
    }

    // Generate safe unique slug
    const baseSlug = (body.name || 'store')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    let slug = baseSlug;
    let existing = await db.getStoreBySlug(slug);
    let counter = 1;
    while (existing) {
      slug = `${baseSlug}-${counter++}`;
      existing = await db.getStoreBySlug(slug);
    }

    const passwordHash = hashSellerPassword(body.sellerPassword);
    const patToken = body.storageConfig?.githubToken || body.vaultGithubToken;
    let githubVaultRepo: string | undefined;

    if (patToken) {
      const vaultRes = await saveSellerVaultToGitHub(
        patToken,
        slug,
        body.sellerId.trim(),
        passwordHash,
        body.paymentConfig || {}
      );
      if (vaultRes.ok && vaultRes.vaultRepo) {
        githubVaultRepo = vaultRes.vaultRepo;
      }
    }

    const isGitHubVaulted = Boolean(patToken && body.storageProvider === 'GITHUB');
    const sanitizedStorageConfig = body.storageConfig
      ? { ...body.storageConfig, githubToken: undefined } // Never persist GitHub PAT on our server!
      : undefined;

    const newStore = await db.createStore({
      slug,
      name: body.name,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      phoneNumber: body.phoneNumber,
      sellerId: isGitHubVaulted ? undefined : body.sellerId.trim(),
      sellerPasswordHash: isGitHubVaulted ? undefined : passwordHash,
      githubVaultRepo,
      paymentConfigLocked: true,
      description: body.description || '',
      category: body.category || 'RETAIL',
      logoUrl: body.logoUrl || '',
      bannerUrl: body.bannerUrl || '',
      latitude: body.latitude || 28.6139,
      longitude: body.longitude || 77.2090,
      address: body.address || 'Local Street',
      allowSelfPickup: body.allowSelfPickup !== undefined ? body.allowSelfPickup : true,
      deliveryType: body.deliveryType || 'LOCAL',
      deliveryRadiusKm: body.deliveryRadiusKm || 10.0,
      themeConfig: body.themeConfig || {
        primaryColor: 'emerald',
        accentColor: '#10b981',
        layout: 'standard',
      },
      customCss: body.customCss || '',
      customJs: body.customJs || '',
      storageProvider: body.storageProvider || 'LOCAL',
      storageConfig: sanitizedStorageConfig,
      paymentConfig: body.paymentConfig || {},
    });

    // Auto-create store folder & sync store.json in GitHub repo if GitHub CDN is selected
    let githubFolderStatus = null;
    if (newStore.storageProvider === 'GITHUB' && patToken && body.storageConfig) {
      githubFolderStatus = await initGitHubStoreFolder(
        newStore.id,
        newStore.name,
        body.storageConfig
      );
      const targetRepo = body.storageConfig.githubRepo?.includes('/')
        ? body.storageConfig.githubRepo.trim()
        : `${body.storageConfig.githubRepo?.trim()}/green-store-assets`;
      await syncStoreDataToGitHub(
        patToken,
        targetRepo,
        body.storageConfig.githubBranch || 'main',
        newStore.slug,
        'store.json',
        newStore
      );
    }

    return NextResponse.json({ success: true, store: newStore, githubFolderStatus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
