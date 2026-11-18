'use client';

import React, { useState } from 'react';

export function isImageUri(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/') ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/i.test(s)
  );
}

interface DynamicIconProps {
  icon?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallback?: string;
}

export default function DynamicIcon({
  icon,
  alt = 'icon',
  className = '',
  imgClassName = 'w-full h-full object-contain inline-block rounded',
  fallback = '🌱',
}: DynamicIconProps) {
  const [hasError, setHasError] = useState(false);

  if (!icon || icon.trim() === '') {
    return <span className={className}>{fallback}</span>;
  }

  const cleanIcon = icon.trim();

  if (isImageUri(cleanIcon) && !hasError) {
    return (
      <img
        src={cleanIcon}
        alt={alt}
        className={`${imgClassName} ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return <span className={className}>{hasError ? fallback : cleanIcon}</span>;
}
