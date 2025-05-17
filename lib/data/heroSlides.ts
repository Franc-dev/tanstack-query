// lib/data/heroSlides.ts
import prisma from '@/lib/prisma';
import { unstable_cache as nextCache } from 'next/cache';
import { type HeroSlide } from '@prisma/client'; // Prisma's generated type for HeroSlide

// Interface matching what HeroCarousel.tsx expects for each slide
export interface CarouselSlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

/**
 * Fetches all hero slides that are marked as published,
 * ordered by the 'order' field.
 * Uses Next.js caching with tags for on-demand revalidation.
 */
export async function getPublishedHeroSlides(): Promise<CarouselSlideData[]> {
  const cachedSlides = await nextCache(
    async () => {
      // console.log("DB: Fetching published hero slides for public site");
      const slidesFromDb = await prisma.heroSlide.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      });

      // Map Prisma model to the structure expected by the carousel component
      return slidesFromDb.map(slide => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        ctaText: slide.ctaText,
        ctaLink: slide.ctaLink,
        imageUrl: slide.imageUrl,
        imageAlt: slide.imageAlt,
      }));
    },
    ['published-hero-slides'], // Cache key
    { tags: ['heroSlides-public', 'content'] } // Cache tags
  )();
  return cachedSlides;
}

/**
 * Fetches all hero slides for the admin panel, regardless of published status,
 * ordered by the 'order' field.
 * This might not need aggressive caching or could use different tags.
 */
export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
    // console.log("DB: Fetching all hero slides for admin panel");
    const slides = await prisma.heroSlide.findMany({
        orderBy: { order: 'asc' },
    });
    return slides;
}

/**
 * Fetches a single hero slide by its ID.
 * Useful for the admin edit page.
 */
export async function getHeroSlideById(id: string): Promise<HeroSlide | null> {
    if (!id) return null;
    // console.log(`DB: Fetching hero slide by ID for admin: ${id}`);
    const slide = await prisma.heroSlide.findUnique({
        where: { id },
    });
    return slide;
}
