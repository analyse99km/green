import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Developer Mode & Visual Inventory Management Endpoint
 * Allows sellers to update inventory manually or via programmatic webhook/code script
 */
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
    
    // Supports either single product update: { productId, inventory, fakeStockAlarm }
    // Or bulk batch update: { items: [{ productId, inventory, price, fakeStockAlarm }] }
    if (body.items && Array.isArray(body.items)) {
      const results = [];
      for (const item of body.items) {
        if (item.productId && item.inventory !== undefined) {
          const updated = await db.updateProduct(item.productId, {
            inventory: parseInt(item.inventory, 10),
            fakeStockAlarm: item.fakeStockAlarm !== undefined ? parseInt(item.fakeStockAlarm, 10) : undefined,
            price: item.price !== undefined ? parseFloat(item.price) : undefined,
            originalPrice: item.originalPrice !== undefined ? parseFloat(item.originalPrice) : undefined,
          });
          results.push(updated);
        }
      }
      return NextResponse.json({ success: true, updatedCount: results.length, items: results });
    } else if (body.productId && body.inventory !== undefined) {
      const updated = await db.updateProduct(body.productId, {
        inventory: parseInt(body.inventory, 10),
        fakeStockAlarm: body.fakeStockAlarm !== undefined ? parseInt(body.fakeStockAlarm, 10) : undefined,
      });
      return NextResponse.json({ success: true, product: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload structure' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
