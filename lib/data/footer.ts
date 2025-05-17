// lib/data/footer.ts
import prisma from '@/lib/prisma';
import { unstable_cache as nextCache } from 'next/cache';
import { FooterContent } from '@prisma/client';

/**
 * Fetches the footer content for the public-facing site.
 * Only fetches if published. Uses Next.js caching.
 */
export async function getFooter(identifier: string = "main_footer"): Promise<FooterContent | null> {
  return nextCache(
    async () => {
      // console.log(`DB (Public): Fetching footer content: ${identifier}`);
      return prisma.footerContent.findUnique({
        where: { identifier, published: true },
      });
    },
    [`footer-${identifier}`], // Cache key
    { tags: ['content', 'footer', `footer-${identifier}`] } // Cache tags
  )();
}

/**
 * Fetches the footer content for the admin panel, regardless of published status.
 * This might not need aggressive caching or could use different tags.
 */
export async function getAdminFooterContent(identifier: string = "main_footer"): Promise<FooterContent | null> {
    // console.log(`DB (Admin): Fetching footer content for admin: ${identifier}`);
    const footer = await prisma.footerContent.findUnique({
        where: { identifier },
    });
    return footer;
}
