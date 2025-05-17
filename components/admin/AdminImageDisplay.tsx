/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/AdminImageDisplay.tsx
'use client'; // This directive makes it a Client Component

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react'; // For a fallback icon

interface AdminImageDisplayProps {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string; // Text for placeholder if image fails
}

export default function AdminImageDisplay({
  src,
  alt,
  width,
  height,
  className = "object-cover rounded-md bg-slate-200",
  fallbackText = "No Image"
}: AdminImageDisplayProps) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src); // Reset src if the prop changes
    setError(false);   // Reset error state if src prop changes
  }, [src]);

  const handleImageError = () => {
    setError(true);
    // You could also set a placeholder URL here if preferred
    // setCurrentSrc(`https://placehold.co/${width}x${height}/e2e8f0/94a3b8?text=${fallbackText.replace(/\s/g, '+')}`);
  };

  if (error || !currentSrc) {
    // Display a placeholder or fallback UI if there's an error or no src
    return (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className={`flex items-center justify-center bg-slate-100 rounded-md text-slate-400 ${className.replace('object-cover', '')}`} // Remove object-cover if not applicable to placeholder
      >
        <ImageOff size={Math.min(width, height) / 2} />
        {/* <span className="text-xs ml-1">{fallbackText}</span> */}
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleImageError}
      priority={false} // Usually not priority for admin list images
    />
  );
}
