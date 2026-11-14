'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Store } from '@/lib/types';
import { calculateDistanceKm } from '@/lib/geo';
import { reverseGeocode, detectUserLocation } from '@/lib/geoClient';
import { detectCurrencyFromCountry } from '@/lib/currency';
import { Search, Crosshair, Layers, Check, MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export type MapTileLayer = 'GOOGLE_ROAD' | 'GOOGLE_SATELLITE' | 'OSM';

interface DiscoveryMapProps {
  stores: Store[];
  selectedStoreId?: string;
  onSelectStore?: (store: Store) => void;
  userLocation?: { lat: number; lng: number } | null;
  onLocationChange?: (loc: { lat: number; lng: number; label?: string; currency?: string }) => void;
  height?: string;
  allowPinDrop?: boolean;
}

export default function DiscoveryMap({
  stores,
  selectedStoreId,
  onSelectStore,
  userLocation,
  onLocationChange,
  height = '540px',
  allowPinDrop = true,
}: DiscoveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<MapTileLayer>('GOOGLE_ROAD');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Switch Tile Layer on the Leaflet instance
  const applyTileLayer = (layer: MapTileLayer, L: any) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newTileLayer: any;
    if (layer === 'GOOGLE_ROAD') {
      newTileLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 21,
        attribution: '&copy; Google Maps',
      });
    } else if (layer === 'GOOGLE_SATELLITE') {
      newTileLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 21,
        attribution: '&copy; Google Maps Satellite Hybrid',
      });
    } else {
      newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
    }

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  };

  // Search any address / landmark and fly there
  const handleSearchAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(parseFloat(data[0].lat).toFixed(6));
        const lng = Number(parseFloat(data[0].lon).toFixed(6));
        const label = data[0].display_name ? data[0].display_name.split(',').slice(0, 3).join(', ') : searchQuery;

        mapInstanceRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
        showNotification(`Moved to: ${label}`);

        if (onLocationChange) {
          const rev = await reverseGeocode(lat, lng);
          const curr = detectCurrencyFromCountry(rev.countryCode);
          onLocationChange({ lat, lng, label, currency: curr });
        }
      } else {
        showNotification('Address not found. Try a nearby street or landmark.');
      }
    } catch {
      showNotification('Search failed. Check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Re-detect high accuracy GPS
  const handleGPSDetect = async () => {
    setIsLocating(true);
    showNotification('Locking onto satellite GPS...');
    try {
      const loc = await detectUserLocation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { animate: true, duration: 1.2 });
      }
      const label = loc.city && loc.country ? `${loc.city}, ${loc.country}` : `GPS (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`;
      showNotification(`📍 Locked (${loc.source}): ${label}`);
      if (onLocationChange) {
        onLocationChange({ lat: loc.lat, lng: loc.lng, label, currency: loc.currency });
      }
    } catch {
      showNotification('GPS unavailable. Click anywhere on the map to pinpoint your location.');
    } finally {
      setIsLocating(false);
    }
  };

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
        : [47.3769, 8.5417]; // Zürich default fallback

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, 13);

      // Add zoom control on bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initial tile layer (Google Roadmap by default)
      applyTileLayer(activeLayer, L);

      // Map Click Listener: allow user to click anywhere to pinpoint exact building / doorstep
      if (allowPinDrop) {
        map.on('click', async (e: any) => {
          const lat = Number(e.latlng.lat.toFixed(6));
          const lng = Number(e.latlng.lng.toFixed(6));

          showNotification(`Pin placed at: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          if (onLocationChange) {
            const rev = await reverseGeocode(lat, lng);
            const curr = detectCurrencyFromCountry(rev.countryCode);
            onLocationChange({
              lat,
              lng,
              label: rev.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              currency: curr,
            });
          }
        });
      }

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Reapply tile layer if activeLayer changes
    applyTileLayer(activeLayer, L);

    // Clear existing store markers
    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Update or create User Marker
    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-pin-icon',
          html: `
            <div style="position:relative; width:28px; height:28px;">
              <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#059669; opacity:0.35; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position:relative; width:20px; height:20px; margin:4px; border-radius:50%; background:#059669; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:900;">
                📍
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          draggable: allowPinDrop,
        }).addTo(map);

        userMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; font-weight: bold; padding: 2px;">
            <span>📍 Your Current Location</span>
            <div style="font-size: 10px; color: #6b7280; font-weight: normal; margin-top: 2px;">
              ${allowPinDrop ? 'Click anywhere on map or drag pin to adjust exact doorstep.' : ''}
            </div>
          </div>
        `);

        if (allowPinDrop) {
          userMarker.on('dragend', async (event: any) => {
            const position = event.target.getLatLng();
            const lat = Number(position.lat.toFixed(6));
            const lng = Number(position.lng.toFixed(6));
            if (onLocationChange) {
              const rev = await reverseGeocode(lat, lng);
              const curr = detectCurrencyFromCountry(rev.countryCode);
              onLocationChange({
                lat,
                lng,
                label: rev.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                currency: curr,
              });
            }
          });
        }

        userMarkerRef.current = userMarker;
      }
    }

    // Add store markers
    stores.forEach((store) => {
      const isSelected = store.id === selectedStoreId;

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

  }, [stores, selectedStoreId, userLocation, activeLayer, onSelectStore, allowPinDrop, onLocationChange]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm bg-neutral-100 dark:bg-neutral-900">
      
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Search Bar (Address / Landmark) */}
        <form
          onSubmit={handleSearchAddress}
          className="pointer-events-auto flex items-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-md p-1 pl-3 max-w-xs sm:max-w-sm w-full"
        >
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search street, area or landmark..."
            className="w-full text-xs bg-transparent border-none outline-none px-2 text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Go'}
          </button>
        </form>

        {/* Map Layer Switcher & GPS Button */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-700 p-1 shadow-md">
          {/* Layer Switcher Pills */}
          <button
            type="button"
            onClick={() => setActiveLayer('GOOGLE_ROAD')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
              activeLayer === 'GOOGLE_ROAD'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Google Maps Roadmap (High Detail Roads & Buildings)"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">Google Road</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('GOOGLE_SATELLITE')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
              activeLayer === 'GOOGLE_SATELLITE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Google Maps Satellite Hybrid (Satellite + Street Labels)"
          >
            <span>🛰️</span>
            <span className="hidden sm:inline">Satellite</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('OSM')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
              activeLayer === 'OSM'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="OpenStreetMap Open Source Layer"
          >
            <span>🌿</span>
            <span className="hidden sm:inline">OSM</span>
          </button>

          {/* GPS Crosshair Trigger */}
          <button
            type="button"
            onClick={handleGPSDetect}
            disabled={isLocating}
            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Lock Exact GPS Location"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Crosshair className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-neutral-900/90 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-fade-in border border-white/10 pointer-events-none">
          {statusNotification}
        </div>
      )}

      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Bottom Information Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Retail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Hospitality & Dining
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Tech & Digital
        </span>
        <span className="text-[10px] text-neutral-400 border-l pl-2 border-neutral-200 dark:border-neutral-700">
          💡 Click anywhere on map to pinpoint exact location
        </span>
      </div>
    </div>
  );
}
