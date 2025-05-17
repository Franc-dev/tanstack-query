// lib/data/valueProposition.ts
import prisma from '@/lib/prisma';
import { unstable_cache as nextCache } from 'next/cache';
import { type ValuePropositionItem } from '@prisma/client';

/**
 * Fetches all ValuePropositionItems that are marked as published,
 * ordered by the 'order' field.
 * For public display.
 */
export async function getPublishedValuePropositionItems(): Promise<ValuePropositionItem[]> {
  return nextCache(
    async () => {
      // console.log("DB: Fetching published Value Proposition Items for public site");
      return prisma.valuePropositionItem.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      });
    },
    ['published-value-proposition-items'], // Cache key
    { tags: ['valuePropositionItems-public', 'content'] } // Cache tags
  )();
}

/**
 * Fetches all ValuePropositionItems for the admin panel,
 * regardless of published status, ordered by the 'order' field.
 */
export async function getAdminValuePropositionItems(): Promise<ValuePropositionItem[]> {
  // console.log("DB: Fetching all Value Proposition Items for admin panel");
  // This admin fetch might not need aggressive caching or could use different tags.
  // For simplicity, not using nextCache here, but you could add it if beneficial.
  return prisma.valuePropositionItem.findMany({
    orderBy: { order: 'asc' },
  });
}

/**
 * Fetches a single ValuePropositionItem by its ID.
 * Useful for the admin edit page.
 */
export async function getValuePropositionItemById(id: string): Promise<ValuePropositionItem | null> {
  if (!id) return null;
  // console.log(`DB: Fetching Value Proposition Item by ID for admin: ${id}`);
  return prisma.valuePropositionItem.findUnique({
    where: { id },
  });
}
