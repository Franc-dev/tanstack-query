// components/ui/PublicImageDisplay.tsx
'use client'; // This directive makes it a Client Component

import Image, { type ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react'; // For a fallback icon

interface PublicImageDisplayProps extends Omit<ImageProps, 'onError' | 'src' | 'alt'> {
  src?: string | null;
  alt: string;
  fallbackIconSize?: number;
  // We'll use 'fill' by default for this use case, so width/height are not primary props here
  // but can be passed if 'fill' is overridden.
}

export default function PublicImageDisplay({
  src,
  alt,
  className = "transition-transform duration-500 ease-in-out group-hover:scale-110",
  fallbackIconSize = 48,
  ...props // Spread remaining ImageProps like fill, style, sizes, priority etc.
}: PublicImageDisplayProps) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src); // Reset src if the prop changes
    setError(false);    // Reset error state if src prop changes
  }, [src]);

  const handleImageError = () => {
    setError(true);
  };

  if (error || !currentSrc) {
    // Fallback UI when image fails to load or src is missing
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-slate-700/50 ${className.replace('group-hover:scale-110', '')}`} // Remove transform from fallback
      >
        <ImageOff size={fallbackIconSize} className="text-slate-500" />
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      onError={handleImageError}
      className={className}
      // Pass through other props like fill, style, sizes, priority
      {...props}
    />
  );
}
