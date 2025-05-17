// lib/data/navigation.ts
import prisma from '@/lib/prisma';
import { unstable_cache as nextCache } from 'next/cache';
import { NavigationItem } from '@prisma/client';

// Interface for navigation items that includes their children, populated.
export interface PopulatedNavItem extends NavigationItem {
  children: PopulatedNavItem[];
}

/**
 * Fetches all navigation items and structures them into a hierarchy.
 * This version is intended for the admin panel, so it fetches all items.
 */
export async function getAdminNavigationItems(): Promise<PopulatedNavItem[]> {
  // console.log("DB (Admin): Fetching all navigation items");
  const items = await prisma.navigationItem.findMany({
    orderBy: [
      { parentId: 'asc' }, // Process items with parents later or ensure parents are processed first
      { order: 'asc' },    // Order by the 'order' field
    ],
  });

  const itemMap = new Map<string, PopulatedNavItem>();
  const roots: PopulatedNavItem[] = [];

  // First pass: create a map of all items and initialize children arrays
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build the hierarchy
  items.forEach(item => {
    const currentItem = itemMap.get(item.id)!; // Assert non-null as we just added it
    if (item.parentId && itemMap.has(item.parentId)) {
      const parentItem = itemMap.get(item.parentId)!;
      parentItem.children.push(currentItem);
    } else {
      // If it has no parentId or the parentId doesn't exist in the map, it's a root item
      roots.push(currentItem);
    }
  });

  // Ensure children within each parent are also sorted by their 'order' field
  const sortChildrenRecursive = (nodes: PopulatedNavItem[]) => {
    for (const node of nodes) {
      if (node.children.length > 0) {
        node.children.sort((a, b) => a.order - b.order);
        sortChildrenRecursive(node.children);
      }
    }
  };

  sortChildrenRecursive(roots); // Sort children at all levels
  roots.sort((a, b) => a.order - b.order); // Sort root items

  return roots;
}

/**
 * Fetches published navigation items for the public-facing site.
 * Uses Next.js caching.
 */
export async function getNavigation(): Promise<PopulatedNavItem[]> {
  return nextCache(
    async () => {
      // console.log("DB (Public): Fetching published navigation items");
      const items = await prisma.navigationItem.findMany({
        // Add a 'published' field to your NavigationItem model if you want to control visibility
        // where: { published: true },
        orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
      });

      const itemMap = new Map<string, PopulatedNavItem>();
      const roots: PopulatedNavItem[] = [];

      items.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
      });

      items.forEach(item => {
        const currentItem = itemMap.get(item.id)!;
        if (item.parentId && itemMap.has(item.parentId)) {
          itemMap.get(item.parentId)!.children.push(currentItem);
        } else {
          roots.push(currentItem);
        }
      });
      
      // Ensure children within each parent are also sorted by their 'order' field
      const sortChildrenRecursive = (nodes: PopulatedNavItem[]) => {
        for (const node of nodes) {
          if (node.children.length > 0) {
            node.children.sort((a, b) => a.order - b.order);
            sortChildrenRecursive(node.children);
          }
        }
      };
      sortChildrenRecursive(roots);
      roots.sort((a,b) => a.order - b.order);


      return roots;
    },
    ['navigation-items-public'],
    { tags: ['content', 'navigation'] }
  )();
}

/**
 * Fetches a single navigation item by its ID.
 */
export async function getNavigationItemById(id: string): Promise<NavigationItem | null> {
    if (!id) return null;
    return prisma.navigationItem.findUnique({
        where: { id },
    });
}
