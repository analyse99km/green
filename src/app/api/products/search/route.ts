import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistanceKm } from '@/lib/geo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const maxRadius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null;
    const inStockOnly = searchParams.get('inStock') === 'true';

    const [rawProducts, rawStores] = await Promise.all([
      db.getAllProducts(),
      db.getAllStores(),
    ]);

    const allProducts = Array.isArray(rawProducts) ? rawProducts : [];
    const allStores = Array.isArray(rawStores) ? rawStores : [];

    const storeMap = new Map(allStores.filter(Boolean).map((s) => [s.id, s]));

    let results = allProducts
      .filter((p) => {
        if (!p) return false;
        const store = storeMap.get(p.storeId);
        // Exclude suspended stores
        if (!store || store.isSuspended) return false;

        // In-stock filter
        if (inStockOnly && p.inventory <= 0) return false;

        // Category filter
        if (category && category !== 'ALL' && store.category !== category) return false;

        // Text query search
        if (query) {
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
          const matchStore = store.name.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchTags && !matchStore) {
            return false;
          }
        }

        return true;
      })
      .map((product) => {
        const store = storeMap.get(product.storeId)!;
        let distanceKm: number | null = null;
        let isDeliverable = true;

        if (lat !== null && lng !== null) {
          distanceKm = calculateDistanceKm(lat, lng, store.latitude, store.longitude);
          const effectiveRadius = product.customDeliveryRadiusKm ?? store.deliveryRadiusKm;
          isDeliverable = store.deliveryType === 'GLOBAL' || distanceKm <= effectiveRadius;
        }

        return {
          product,
          store: {
            id: store.id,
            storeNumber: store.storeNumber,
            slug: store.slug,
            name: store.name,
            category: store.category,
            address: store.address,
            latitude: store.latitude,
            longitude: store.longitude,
            isVerified: store.isVerified,
            allowSelfPickup: store.allowSelfPickup,
            deliveryType: store.deliveryType,
            deliveryRadiusKm: store.deliveryRadiusKm,
          },
          distanceKm,
          isDeliverable,
        };
      });

    // Optional radius filter if specified
    if (lat !== null && lng !== null && maxRadius !== null) {
      results = results.filter((r) => (r.distanceKm !== null && r.distanceKm <= maxRadius) || r.store.allowSelfPickup);
    }

    // Sort by distance if available
    if (lat !== null && lng !== null) {
      results.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    }

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
