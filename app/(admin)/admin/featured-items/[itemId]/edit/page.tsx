// app/(admin)/admin/featured-items/[itemId]/edit/page.tsx
import FeaturedItemForm from '@/components/admin/FeaturedItemForm'; // To be created
import { upsertFeaturedItemAction } from '@/lib/actions/featuredItemActions'; // Already imported
import { getFeaturedItemById } from '@/lib/data/featuredItems';
import { notFound } from 'next/navigation';
// import { type FeaturedItem } from '@prisma/client'; // Already imported
import Link from 'next/link'; // Re-import
import { ArrowLeft } from 'lucide-react'; // Re-import


export const revalidate = 0;

interface EditFeaturedItemPageProps {
  params: {
    itemId: string;
  };
}

export default async function EditFeaturedItemPage({ params }: EditFeaturedItemPageProps) {
  const { itemId } = params;
  const itemData = await getFeaturedItemById(itemId);

  if (!itemData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/featured-items" className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700 group mb-2">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Featured Items
      </Link>
      <FeaturedItemForm
        initialData={itemData}
        formAction={upsertFeaturedItemAction}
        itemId={itemData.id}
      />
    </div>
  );
}
