// app/page.tsx
import HeroCarousel from '@/components/sections/HeroCarousel';
// getPublishedHeroSlides already returns data in CarouselSlideData[] format
// which is compatible with what HeroCarousel expects.
import { getPublishedHeroSlides, type CarouselSlideData } from '@/lib/data/heroSlides';
import ValuePropositionGrid from '@/components/sections/ValuePropositionGrid';
import FeaturedItemsDisplay from '@/components/sections/FeaturedItemsDisplay'; // For "Featured Products and Solutions"

// ** Regarding Header: **
// If the Header is meant for all pages, it should ideally be in app/layout.tsx.
// If it's specific to this homepage, then this placement is fine.
// For this example, I'm keeping it here as per your provided code.
import Header from '@/components/layout/Header';
import { getNavigation } from '@/lib/data/navigation';
import FooterComponent from '@/components/layout/FooterComponent';
import { getFooter } from '@/lib/data/footer';
// Optional: Revalidate this page at a specific interval (e.g., every hour)
// export const revalidate = 3600;

export default async function HomePage() {
  // Fetch hero slides data - this is already in the correct format for HeroCarousel
  const heroSlidesData: CarouselSlideData[] = await getPublishedHeroSlides();
  const navigationItems = await getNavigation(); // For the Header if kept on this page

  // Map the data to match HeroSlideData interface
  const mappedSlides = heroSlidesData.map(slide => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle || undefined,
    description: slide.subtitle || undefined,
    primaryCta: slide.ctaText && slide.ctaLink ? {
      text: slide.ctaText,
      href: slide.ctaLink
    } : undefined,
    image: {
      src: slide.imageUrl || '',
      alt: slide.imageAlt || ''
    }
  }));
  const footerData = await getFooter('main_footer');
  return (
    <>
      {/* Header is placed here as per your provided code.
          Consider moving to app/layout.tsx for site-wide consistency if applicable. */}
      <Header navigationItems={navigationItems} />

      {/* Hero Carousel Section */}
      {/* This component fetches and displays hero slides */}
      <HeroCarousel
        slides={mappedSlides}
        autoPlayDelay={7000}
      />

      {/* Featured Products and Solutions Section */}
      {/* This component fetches and displays featured items using a carousel style */}
      <FeaturedItemsDisplay />

      {/* Value Proposition Grid Section */}
      {/* This component fetches and displays value proposition items in a grid */}
      <ValuePropositionGrid />

      {/* Example of another subsequent section (optional) */}
      {/* This section provides additional content or calls to action */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Further Information
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-lg">
            Discover more about our company and what we offer.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 bg-slate-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="text-sky-500 mb-4">
                {/* Placeholder for an icon, e.g., using Lucide React or inline SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                Our Story
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Learn about our journey and the values that drive us forward.
              </p>
            </div>
            {/* Card 2 */}
            <div className="p-8 bg-slate-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="text-sky-500 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 12H3M12 3v18"/></svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                Core Services
              </h3>
              <p className="text-slate-500 leading-relaxed">
                An overview of the primary services we provide to our valued clients.
              </p>
            </div>
            {/* Card 3 */}
            <div className="p-8 bg-slate-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="text-sky-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><path d="M12 20h.01"/></svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                Client Success
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Read testimonials and case studies from our satisfied partners.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FooterComponent data={footerData} />
    </>
  );
}
