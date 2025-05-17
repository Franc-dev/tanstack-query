// app/(admin)/admin/featured-items/page.tsx
import Link from 'next/link';
import { getAdminFeaturedItems } from '@/lib/data/featuredItems';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Eye, EyeOff } from 'lucide-react';
import AdminImageDisplay from '@/components/admin/AdminImageDisplay';
import DeleteFeaturedItemButton from '@/components/admin/DeleteFeaturedItemButton'; // To be created

export const revalidate = 0;

export default async function ManageFeaturedItemsPage() {
  const items = await getAdminFeaturedItems();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Featured Items</h1>
        <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
          <Link href="/admin/featured-items/new">
            <PlusCircle size={20} className="mr-2" />
            Add New Featured Item
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-slate-600">No featured items found. Add one to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Admin Label / Title</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CTAs</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <AdminImageDisplay
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title}
                      width={80} height={50} // Aspect ratio closer to wide banners
                      className="object-cover rounded-md h-auto w-20 bg-slate-200"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-slate-800">{item.adminLabel || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{item.title}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500">{item.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye size={14} className="mr-1"/> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <EyeOff size={14} className="mr-1"/> Unpublished
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {item.ctas ? (JSON.parse(JSON.stringify(item.ctas)) as {text:string}[]).length : 0} CTA(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                      <Link href={`/admin/featured-items/${item.id}/edit`} aria-label={`Edit ${item.title}`}>
                        <Edit3 size={16} />
                      </Link>
                    </Button>
                    <DeleteFeaturedItemButton itemId={item.id} itemTitle={item.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
