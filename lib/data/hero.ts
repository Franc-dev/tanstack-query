// lib/data/hero.ts
import prisma from '@/lib/prisma';
import { unstable_cache as nextCache } from 'next/cache';
import { HeroSlide } from '@prisma/client';

export async function getHeroSection(id: string): Promise<HeroSlide | null> {
  return nextCache(
    async () => {
      // console.log(`DB: Fetching hero section: ${id}`);
      return prisma.heroSlide.findUnique({
        where: { id, published: true }, // Consider if admin should see unpublished
      });
    },
    [`hero-${id}`],
    { tags: ['content', 'hero', `hero-${id}`] }
  )();
}

export async function getAdminHeroSection(id: string): Promise<HeroSlide | null> {
    // Admin version might not use aggressive caching or fetches unpublished
    // For now, let's keep it simple and similar, but could differ
    // console.log(`DB (Admin): Fetching hero section: ${id}`);
    return prisma.heroSlide.findUnique({
        where: { id },
    });
}