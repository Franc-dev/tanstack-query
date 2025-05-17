// components/sections/ValuePropositionGrid.tsx
import Link from 'next/link';
// Import the data fetching function for value proposition items
import { getPublishedValuePropositionItems } from '@/lib/data/valueProposition';
// Import the Prisma type for ValuePropositionItem
import { type ValuePropositionItem } from '@prisma/client';
// Import necessary icons from lucide-react
import { Plus } from 'lucide-react'; // Added Plus icon
// Import the PublicImageDisplay Client Component
import PublicImageDisplay from '@/components/ui/PublicImageDisplay';

/**
 * ValuePropositionGrid is an asynchronous Server Component that fetches and displays
 * published value proposition items in a responsive grid layout.
 */
export default async function ValuePropositionGrid() {
  // Fetch the items that are marked as published and ordered correctly
  const items: ValuePropositionItem[] = await getPublishedValuePropositionItems();

  // If there are no items to display, render nothing (or a placeholder message)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-100 text-slate-800 py-16 md:py-24 my-1.5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Value Distribution. {/* Title inspired by user's screenshot */}
          </h2>
        </div>

        {/* Responsive grid for displaying the items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, index) => (
            // Each item is a "group" for hover effects and has a relative positioning context
            // Added transition for border and shadow
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[3/2.5] bg-slate-800 border-2 border-transparent hover:border-sky-500/70 hover:shadow-sky-500/30 transition-all duration-300 ease-in-out"
            >
              {/* Use the PublicImageDisplay Client Component for image rendering and error handling */}
              <PublicImageDisplay
                src={item.imageUrl} // The source URL of the image
                alt={item.imageAlt || item.title} // Alt text for accessibility
                fill // Makes the image fill its parent container
                style={{ objectFit: 'cover' }} // Ensures the image covers the area without distortion
                className="transition-transform duration-500 ease-in-out group-hover:scale-105" // Slightly reduced scale for subtlety with other effects
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={index < 4} // Example: prioritize the first 4 images
              />

              {/* Gradient overlay to ensure text on top of the image is readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>

              {/* Text content positioned at the bottom of the card */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white z-10">
                <h3 className="text-lg md:text-xl font-semibold mb-1 group-hover:text-sky-400 transition-colors duration-300">
                  {item.title}
                </h3>
              </div>

              {/* "+" Icon for hover effect, similar to the screenshot */}
              <div className="absolute top-3 right-3 z-20 p-1.5 bg-black/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform scale-75 group-hover:scale-100 group-hover:rotate-90">
                <Plus size={20} className="text-white/80 group-hover:text-sky-300" />
              </div>


              {/* If the item has a linkUrl, make the entire card clickable */}
              {item.linkUrl && (
                <Link
                  href={item.linkUrl}
                  className="absolute inset-0 z-30" // Ensure link is on top of other decorative elements if needed
                  aria-label={`Learn more about ${item.title}`}
                >
                  <span className="sr-only">Learn more about {item.title}</span>
                </Link>
              )}
              {/* Optional: Arrow icon for linked items (kept from previous version) */}
              {/* This might be redundant if the "+" icon serves as the main hover cue for interaction */}
              {/* {item.linkUrl && (
                <div className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                    <ArrowRight size={20} className="text-sky-300" />
                </div>
               )} */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
