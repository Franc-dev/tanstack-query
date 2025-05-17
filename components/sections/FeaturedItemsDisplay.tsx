// components/sections/FeaturedItemsDisplay.tsx
import { getPublishedFeaturedItems, type PopulatedFeaturedItem } from '@/lib/data/featuredItems';
import FeaturedItemsCarousel from './FeaturedItemsCarousel'; // The Client Component

/**
 * FeaturedItemsDisplay is an asynchronous Server Component that fetches
 * published featured items and renders them using the FeaturedItemsCarousel.
 */
export default async function FeaturedItemsDisplay() {
  // Fetch the items that are marked as published and ordered correctly.
  // The getPublishedFeaturedItems function also parses the CTAs JSON.
  const items: PopulatedFeaturedItem[] = await getPublishedFeaturedItems();

  if (!items || items.length === 0) {
    // Optionally render a placeholder or nothing if no items are published
    // console.log("No published featured items found.");
    return null;
  }

  return (
    // The section wrapper can be here or within the Carousel component itself
    // For now, keeping it minimal here.
    <FeaturedItemsCarousel items={items} />
  );
}
