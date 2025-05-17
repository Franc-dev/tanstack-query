// app/(admin)/admin/hero/new/page.tsx
import HeroForm from '@/components/admin/HeroForm';
import { updateHeroSlideAction } from '@/lib/actions/heroSlideActions';
import { type HeroSlide } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Ensure fresh data for forms and prevent aggressive caching on this admin page.
export const revalidate = 0;

export default function NewHeroSlidePage() {
  // Define the initial empty data structure for a new hero slide.
  // This ensures the form starts with appropriate defaults.
  const initialData: Partial<HeroSlide> = {
    title: '',
    slideLabel: '', // Optional label for admin identification
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
    imageAlt: '',
    published: true, // Default to published for new slides
    order: 0,        // Default order
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/hero"
        className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700 transition-colors group"
      >
        <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
        Back to Hero Slides List
      </Link>
      {/*
        The HeroForm component is used here to render the form for creating a new slide.
        - initialData: Provides the empty structure for a new slide.
        - formAction: Specifies the server action to be called on form submission.
        - No slideId is passed, indicating to the form and action that this is a new entry.
      */}
      <HeroForm
        initialData={initialData}
        formAction={updateHeroSlideAction}
        // No slideId prop is passed, signifying a "create" operation.
      />
    </div>
  );
}
