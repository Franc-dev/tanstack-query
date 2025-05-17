// components/sections/HeroDisplay.tsx
import Image from 'next/image';
import Link from 'next/link';

interface HeroDisplayProps {
  title: string; // Assuming title is always required and non-empty
  subtitle?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
}

export default function HeroDisplay({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  ctaText,
  ctaLink,
}: HeroDisplayProps) {
  // 1. Refine CTA rendering: Ensure ctaLink is a non-empty string.
  const showCtaButton = ctaText && ctaLink && ctaLink.trim() !== '';

  // 2. Refine Image rendering: Ensure imageUrl is a non-empty string.
  const showImage = imageUrl && imageUrl.trim() !== '';

  // 3. Refine Alt text: Provide a meaningful fallback if imageAlt and title are insufficient.
  // The title prop is required, so it will always be a string.
  // If imageAlt is provided (even an empty string explicitly by user), use it.
  // Otherwise, fallback to title. If title was also empty (which it shouldn't be per prop type), then a generic fallback.
  let effectiveImageAlt = imageAlt ?? title; // Use imageAlt if it's not null/undefined, otherwise title.
  if (imageAlt === '') { // If user explicitly set imageAlt to empty string, respect it (for decorative images, though less common for hero)
    effectiveImageAlt = '';
  } else if (!imageAlt && title) {
    effectiveImageAlt = title; // Fallback to title if imageAlt is null/undefined
  } else if (!imageAlt && !title) { // Should not happen if title is truly required
    effectiveImageAlt = 'Hero image';
  }


  return (
    <section className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-16 md:py-24 rounded-lg shadow-xl overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-md">
            {title} {/* Assumed to be always present and valid */}
          </h1>
          {subtitle && subtitle.trim() !== '' && (
            <p className="text-lg md:text-xl text-slate-300 mb-8 drop-shadow-sm">
              {subtitle}
            </p>
          )}
          {showCtaButton && (
            <Link
              href={ctaLink as string} // ctaLink is now guaranteed to be a non-empty string here
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {ctaText}
            </Link>
          )}
        </div>

        {/* 4. Correct group-hover for image overlay */}
        {showImage && (
          <div className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-2xl order-first md:order-last group"> {/* Added 'group' class here */}
            <Image
              src={imageUrl as string} // imageUrl is now guaranteed to be a non-empty string here
              alt={effectiveImageAlt}
              fill
              style={{ objectFit: 'cover' }}
              priority // LCP optimization
            />
            <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity duration-300"></div>
          </div>
        )}
      </div>
    </section>
  );
}