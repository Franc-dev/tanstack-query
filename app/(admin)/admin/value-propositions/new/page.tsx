// app/(admin)/admin/value-propositions/new/page.tsx
import ValuePropositionItemForm from '@/components/admin/ValuePropositionItemForm';
import { upsertValuePropositionItemAction } from '@/lib/actions/valuePropositionActions';
import { type ValuePropositionItem } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Opt-out of caching for admin pages to ensure fresh data for forms
export const revalidate = 0;

export default function NewValuePropositionItemPage() {
  // Define the initial empty data structure for a new item.
  // This ensures the form starts with appropriate defaults.
  const initialData: Partial<ValuePropositionItem> = {
    title: '',
    imageUrl: '',
    imageAlt: '',
    linkUrl: '',
    order: 0,        // Default order
    published: true, // Default to published for new items
  };

  return (
    <div className="space-y-6">
      {/* Navigation link to go back to the list of value propositions */}
      <Link
        href="/admin/value-propositions"
        className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700 transition-colors group mb-2"
      >
        <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
        Back to Value Propositions List
      </Link>

      {/*
        The ValuePropositionItemForm component is used here.
        - initialData: Provides the empty structure for a new item.
        - formAction: Specifies the server action (upsertValuePropositionItemAction) to be called on form submission.
        - No itemId prop is passed, signifying that this is a "create new item" operation.
      */}
      <ValuePropositionItemForm
        initialData={initialData}
        formAction={upsertValuePropositionItemAction}
        // No itemId is passed, as this is for creating a new item
      />
    </div>
  );
}
