'use client';

import React, { useState } from 'react';
import { Store } from '@/lib/types';
import { X, Calendar, Clock, Users, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';

interface ReservationModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReservationModal({ store, isOpen, onClose }: ReservationModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('19:00');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReservation, setSuccessReservation] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerName,
          customerContact,
          guestCount,
          reservationDate,
          reservationTime,
          specialRequests,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to request table reservation');
      }

      setSuccessReservation(data.reservation);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Reserve a Table</h3>
              <p className="text-xs text-neutral-500">{store.name} (Store #{String(store.storeNumber).padStart(2, '0')})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {successReservation ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900 dark:text-white">Reservation Request Sent!</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Your request for <span className="font-semibold">{successReservation.guestCount} guests</span> on{' '}
                <span className="font-semibold">{successReservation.reservationDate} at {successReservation.reservationTime}</span> has been received by the host.
              </p>
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-600 dark:text-neutral-300">
                The restaurant will contact you directly at <span className="font-mono font-bold">{successReservation.customerContact}</span> to confirm your table.
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="+1 555-0123"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full text-xs px-2 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className="w-full text-xs px-2 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Special Requests / Dietary Notes
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Window seating, birthday celebration, gluten-free"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Reservation...' : 'Confirm Table Booking Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
