// lib/data/featuredItems.ts
import prisma from '@/lib/prisma';
import { unstable_cache as nextCache } from 'next/cache';
import { type FeaturedItem } from '@prisma/client';

// Interface for CTA structure, matching the Zod schema in actions
export interface CtaButton {
  text: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
}

// Extend Prisma's FeaturedItem type to include parsed CTAs for easier use in components
export interface PopulatedFeaturedItem extends Omit<FeaturedItem, 'ctas'> {
  ctas: CtaButton[];
}


/**
 * Fetches all FeaturedItems that are marked as published,
 * ordered by the 'order' field. Parses CTAs from JSON.
 * For public display.
 */
export async function getPublishedFeaturedItems(): Promise<PopulatedFeaturedItem[]> {
  return nextCache(
    async () => {
      const itemsFromDb = await prisma.featuredItem.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      });
      // Manually parse CTAs JSON string into an array of objects
      return itemsFromDb.map(item => ({
        ...item,
        ctas: item.ctas ? (JSON.parse(JSON.stringify(item.ctas)) as CtaButton[]) : [],
      }));
    },
    ['published-featured-items'],
    { tags: ['featuredItems-public', 'content'] }
  )();
}

/**
 * Fetches all FeaturedItems for the admin panel,
 * regardless of published status, ordered by the 'order' field.
 * CTAs remain as Prisma.JsonValue for the admin form.
 */
export async function getAdminFeaturedItems(): Promise<FeaturedItem[]> {
  return prisma.featuredItem.findMany({
    orderBy: { order: 'asc' },
  });
}

/**
 * Fetches a single FeaturedItem by its ID.
 * CTAs remain as Prisma.JsonValue for the admin form.
 */
export async function getFeaturedItemById(id: string): Promise<FeaturedItem | null> {
  if (!id) return null;
  return prisma.featuredItem.findUnique({
    where: { id },
  });
}
