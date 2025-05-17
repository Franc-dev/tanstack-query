// app/(admin)/admin/value-propositions/page.tsx
import Link from 'next/link';
import { getAdminValuePropositionItems } from '@/lib/data/valueProposition';
import { type ValuePropositionItem } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Eye, EyeOff } from 'lucide-react';
// Import the client component for delete confirmation
import DeleteValuePropositionItemButton from '@/components/admin/DeleteValuePropositionItemButton';
// Import the client component for displaying images with error handling
import AdminImageDisplay from '@/components/admin/AdminImageDisplay';

// Opt-out of caching for admin pages to ensure fresh data is always fetched
export const revalidate = 0;

export default async function ManageValuePropositionsPage() {
  // Fetch all value proposition items for the admin panel
  const items: ValuePropositionItem[] = await getAdminValuePropositionItems();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Value Propositions</h1>
        {/* Link to the page for creating a new value proposition item */}
        <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
          <Link href="/admin/value-propositions/new">
            <PlusCircle size={20} className="mr-2" />
            Add New Item
          </Link>
        </Button>
      </div>

      {/* Display a message if no items are found */}
      {items.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-slate-600">No value proposition items found. Add one to get started!</p>
        </div>
      ) : (
        // Display the table of value proposition items
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-200 w-full">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Link</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 w-full">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Use the AdminImageDisplay Client Component for image rendering */}
                    <AdminImageDisplay
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title} // Provide alt text
                      width={64}  // Desired display width
                      height={48} // Desired display height
                      className="object-cover rounded-md h-12 w-16 bg-slate-200" // Tailwind classes for styling
                      fallbackText={item.title.substring(0,3) || "Img"} // Text for placeholder if image fails
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{item.title}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500">{item.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* Display published status with an icon */}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">
                    {/* Display the link URL if it exists */}
                    {item.linkUrl ? (
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 hover:underline">
                        {item.linkUrl.substring(0, 20)}...
                      </a>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Button to edit the item */}
                    <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                      <Link href={`/admin/value-propositions/${item.id}/edit`} aria-label={`Edit ${item.title}`}>
                        <Edit3 size={16} />
                      </Link>
                    </Button>
                    {/* Button to delete the item (uses a client component for confirmation) */}
                    <DeleteValuePropositionItemButton itemId={item.id} itemTitle={item.title} />
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
