/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(admin)/admin/hero/[slideId]/edit/page.tsx
import HeroForm from '@/components/admin/HeroForm';
import { updateHeroSlideAction } from '@/lib/actions/heroSlideActions';
import { getHeroSlideById } from '@/lib/data/heroSlides'; // Fetches existing slide data
import { notFound } from 'next/navigation'; // For handling cases where slide isn't found
import { type HeroSlide } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Ensure fresh data for forms and prevent aggressive caching on this admin page.
export const revalidate = 0;

// Define the properties expected by this page component, including dynamic route parameters.
interface EditHeroSlidePageProps {
  params: {
    slideId: string; // The ID of the hero slide to edit, from the URL.
  };
}

export default async function EditHeroSlidePage({ params }: EditHeroSlidePageProps) {
  const slideId = params.slideId;

  // Fetch the existing hero slide data from the database using its ID.
  const slideData = await getHeroSlideById(slideId);

  // If no slide data is found for the given ID, render a 404 page.
  if (!slideData) {
    notFound();
  }

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
        The HeroForm component is used to render the form for editing an existing slide.
        - initialData: Pre-fills the form with the fetched slideData.
        - formAction: Specifies the server action to be called on form submission.
        - slideId: Passes the ID of the current slide, indicating an "update" operation.
      */}
      <HeroForm
        initialData={slideData}
        formAction={updateHeroSlideAction}
        slideId={slideData.id} // Pass the existing slide's ID for updates.
      />
    </div>
  );
}
