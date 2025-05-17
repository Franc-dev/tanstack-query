/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(admin)/admin/hero/page.tsx
import Link from 'next/link';
import { getAdminHeroSlides } from '@/lib/data/heroSlides'; // Using the new data fetching function
import { type HeroSlide } from '@prisma/client';
import { Button } from '@/components/ui/button'; // Assuming you have this
import { PlusCircle, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
// You'll need a client component to handle delete confirmation
import DeleteSlideButton from '@/components/admin/DeleteSlideButton';

// Opt-out of caching for admin pages to ensure fresh data
export const revalidate = 0;

export default async function ManageHeroSlidesPage() {
  const slides = await getAdminHeroSlides();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Hero Slides</h1>
        <Button asChild className="bg-sky-500 hover:bg-sky-600">
          <Link href="/admin/hero/new">
            <PlusCircle size={20} className="mr-2" />
            Add New Slide
          </Link>
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-slate-600">No hero slides found. Get started by adding a new one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Label/Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {slides.map((slide) => (
                <tr key={slide.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{slide.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <div className="font-medium">{slide.slideLabel || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{slide.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {slide.published ? (
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
                    {new Date(slide.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/hero/${slide.id}/edit`} aria-label={`Edit ${slide.title}`}>
                        <Edit3 size={16} />
                      </Link>
                    </Button>
                    {/* Delete button would ideally have a confirmation dialog */}
                    <DeleteSlideButton slideId={slide.id} slideTitle={slide.title} />
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
