// app/(admin)/admin/value-propositions/[itemId]/edit/page.tsx
import ValuePropositionItemForm from '@/components/admin/ValuePropositionItemForm';
import { upsertValuePropositionItemAction } from '@/lib/actions/valuePropositionActions';
import { getValuePropositionItemById } from '@/lib/data/valueProposition';
import { notFound } from 'next/navigation'; // For handling cases where the item isn't found
import { type ValuePropositionItem } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Opt-out of caching for admin pages to ensure fresh data for forms
export const revalidate = 0;

// Define the properties expected by this page component, including dynamic route parameters.
interface EditValuePropositionItemPageProps {
  params: {
    itemId: string; // The ID of the value proposition item to edit, from the URL.
  };
}

export default async function EditValuePropositionItemPage({ params }: EditValuePropositionItemPageProps) {
  const { itemId } = params; // Destructure itemId from params

  // Fetch the existing value proposition item data from the database using its ID.
  const itemData: ValuePropositionItem | null = await getValuePropositionItemById(itemId);

  // If no item data is found for the given ID, render a 404 page.
  // This is important for handling cases where the URL might contain an invalid ID.
  if (!itemData) {
    notFound();
  }

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
        The ValuePropositionItemForm component is used here to render the form for editing an existing item.
        - initialData: Pre-fills the form with the fetched itemData.
        - formAction: Specifies the server action (upsertValuePropositionItemAction) to be called on form submission.
        - itemId: Passes the ID of the current item, indicating to the form and action that this is an "update" operation.
      */}
      <ValuePropositionItemForm
        initialData={itemData}
        formAction={upsertValuePropositionItemAction}
        itemId={itemData.id} // Pass the existing item's ID for updates.
      />
    </div>
  );
}
