'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Store } from '@/lib/types';
import { calculateDistanceKm } from '@/lib/geo';
import 'leaflet/dist/leaflet.css';

interface DiscoveryMapProps {
  stores: Store[];
  selectedStoreId?: string;
  onSelectStore?: (store: Store) => void;
  userLocation?: { lat: number; lng: number } | null;
  height?: string;
}

export default function DiscoveryMap({
  stores,
  selectedStoreId,
  onSelectStore,
  userLocation,
  height = '540px',
}: DiscoveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const circleRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically require Leaflet on client
    const L = require('leaflet');

    // Default icon fix for Leaflet in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const defaultCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : stores.length > 0
        ? [stores[0].latitude, stores[0].longitude]
        : [28.6139, 77.2090]; // Delhi fallback

      const map = L.map(mapContainerRef.current).setView(defaultCenter, 12);

      // OpenStreetMap Tiles (100% Free & Open Source)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Add user marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-pin-icon',
        html: `
          <div style="position:relative; width:22px; height:22px;">
            <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#10b981; opacity:0.3; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position:relative; width:16px; height:16px; margin:3px; border-radius:50%; background:#059669; border:2.5px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Your Current Location</b>');
      markersRef.current['user-loc'] = userMarker;
    }

    // Add store markers
    stores.forEach((store) => {
      const isSelected = store.id === selectedStoreId;

      // Color coding per category
      let badgeColor = '#10b981'; // Retail emerald
      let categoryEmoji = '🛍️';
      if (store.category === 'HOSPITALITY') {
        badgeColor = '#f59e0b'; // Amber
        categoryEmoji = '☕';
      } else if (store.category === 'DIGITAL') {
        badgeColor = '#8b5cf6'; // Violet
        categoryEmoji = '⚡';
      }

      const storeNumberFormatted = `#${String(store.storeNumber).padStart(2, '0')}`;

      const customIcon = L.divIcon({
        className: 'store-custom-marker',
        html: `
          <div style="
            background: ${store.isVerified ? 'linear-gradient(135deg, #059669, #10b981)' : badgeColor}; 
            color: white; 
            padding: 4px 9px; 
            border-radius: 14px; 
            font-size: 11px; 
            font-weight: 800; 
            display: flex; 
            align-items: center; 
            gap: 4px;
            box-shadow: ${store.isVerified ? '0 0 0 3px rgba(250, 204, 21, 0.85), 0 6px 14px rgba(0,0,0,0.35)' : '0 4px 10px rgba(0,0,0,0.22)'};
            border: 2px solid ${store.isVerified ? '#fef08a' : 'white'};
            white-space: nowrap;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
            transition: transform 0.2s;
          ">
            <span>${categoryEmoji}</span>
            <span>${storeNumberFormatted}</span>
            ${store.isVerified ? '<span style="background:#fef08a;color:#065f46;border-radius:50%;width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;">✓</span>' : ''}
          </div>
        `,
        iconSize: [72, 30],
        iconAnchor: [36, 15],
      });

      const marker = L.marker([store.latitude, store.longitude], { icon: customIcon }).addTo(map);

      let distanceText = '';
      if (userLocation) {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, store.latitude, store.longitude);
        distanceText = `<div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 4px;">📍 ${dist} km away from you</div>`;
      }

      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${badgeColor}; letter-spacing: 0.5px;">Store ${storeNumberFormatted}</span>
            ${store.isVerified ? '<span style="font-size: 10px; background: #ecfdf5; color: #065f46; border: 1px solid #10b981; padding: 1px 7px; border-radius: 999px; font-weight: 800;">✓ Verified</span>' : '<span style="font-size: 10px; background: #f3f4f6; color: #6b7280; padding: 1px 6px; border-radius: 999px;">Standard</span>'}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin: 6px 0 4px;">
            ${store.logoUrl ? `<img src="${store.logoUrl}" alt="${store.name}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb; flex-shrink: 0;" />` : ''}
            <h4 style="font-size: 14px; font-weight: 700; margin: 0; color: #111827;">${store.name}</h4>
          </div>
          <p style="font-size: 11px; color: #4b5563; margin: 0 0 6px; line-height: 1.3;">${store.description || store.address}</p>
          
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;">
            <span style="font-size: 10px; background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px;">🛵 Delivery: ${store.deliveryRadiusKm} km</span>
            ${store.allowSelfPickup ? '<span style="font-size: 10px; background: #eff6ff; color: #1e40af; padding: 2px 6px; border-radius: 4px;">🏪 In-Person Pickup</span>' : ''}
          </div>
          
          ${distanceText}

          <div style="margin-top: 8px;">
            <a href="/store/${store.slug}" style="
              display: block; 
              text-align: center; 
              background: #059669; 
              color: white; 
              text-decoration: none; 
              padding: 6px 12px; 
              border-radius: 6px; 
              font-size: 12px; 
              font-weight: 600;
            ">
              View Store Catalog →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectStore) onSelectStore(store);

        // Draw delivery radius circle
        if (circleRef.current) circleRef.current.remove();
        if (store.deliveryRadiusKm > 0) {
          circleRef.current = L.circle([store.latitude, store.longitude], {
            radius: store.deliveryRadiusKm * 1000,
            color: badgeColor,
            fillColor: badgeColor,
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(map);
        }
      });

      markersRef.current[store.id] = marker;

      if (isSelected) {
        marker.openPopup();
        if (store.deliveryRadiusKm > 0) {
          circleRef.current = L.circle([store.latitude, store.longitude], {
            radius: store.deliveryRadiusKm * 1000,
            color: badgeColor,
            fillColor: badgeColor,
            fillOpacity: 0.15,
            weight: 2,
          }).addTo(map);
        }
      }
    });

    // Auto-fit bounds if we have multiple stores
    if (stores.length > 1 && !selectedStoreId) {
      const group = new L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [stores, selectedStoreId, userLocation, onSelectStore]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Retail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Hospitality & Dining
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Tech & Digital
        </span>
      </div>
    </div>
  );
}
