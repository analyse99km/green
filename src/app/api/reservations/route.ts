import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    if (!storeId) {
      return NextResponse.json({ success: false, error: 'storeId is required' }, { status: 400 });
    }

    const reservations = await db.getReservationsByStoreId(storeId);
    return NextResponse.json({ success: true, reservations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.storeId || !body.customerName || !body.customerContact || !body.guestCount || !body.reservationDate || !body.reservationTime) {
      return NextResponse.json({ success: false, error: 'All reservation fields are required' }, { status: 400 });
    }

    const reservation = await db.createReservation({
      storeId: body.storeId,
      customerName: body.customerName,
      customerContact: body.customerContact,
      guestCount: parseInt(body.guestCount, 10),
      reservationDate: body.reservationDate,
      reservationTime: body.reservationTime,
      specialRequests: body.specialRequests || '',
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
