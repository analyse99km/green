import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ReservationStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = await db.updateReservationStatus(id, body.status as ReservationStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
