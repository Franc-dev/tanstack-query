// app/(admin)/admin/featured-items/new/page.tsx
import FeaturedItemForm from '@/components/admin/FeaturedItemForm'; // To be created
import { upsertFeaturedItemAction } from '@/lib/actions/featuredItemActions';
import { type FeaturedItem } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default function NewFeaturedItemPage() {
  const initialData: Partial<FeaturedItem> = {
    title: '',
    imageUrl: '',
    ctas: [], // Default to empty array for JSON field
    order: 0,
    published: true,
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/featured-items" className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700 group mb-2">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Featured Items
      </Link>
      <FeaturedItemForm
        initialData={initialData}
        formAction={upsertFeaturedItemAction}
      />
    </div>
  );
}

