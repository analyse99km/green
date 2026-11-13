import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await db.getOrderById(orderId);
      return NextResponse.json({ success: true, order });
    }

    if (storeId) {
      const orders = await db.getOrdersByStoreId(storeId);
      return NextResponse.json({ success: true, orders });
    }

    const orders = await db.getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.storeId || !body.buyerName || !body.buyerContact || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required order details' }, { status: 400 });
    }

    // Direct decentralized P2P payment flow

    const order = await db.createOrder({
      storeId: body.storeId,
      buyerName: body.buyerName,
      buyerContact: body.buyerContact,
      deliveryAddress: body.deliveryAddress || (body.deliveryType === 'SELF_PICKUP' ? 'Store Pickup' : 'No address provided'),
      deliveryType: body.deliveryType || 'DELIVERY',
      shippingStatusText: 'Platform Delivery Network - Coming Soon 🔒 (Seller Self-Delivery)',
      items: body.items,
      totalAmount: parseFloat(body.totalAmount),
      currency: body.currency || 'USD',
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionId || '',
      proofUrl: body.proofUrl || '',
    });

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
