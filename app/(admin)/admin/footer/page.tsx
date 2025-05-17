// app/(admin)/admin/footer/page.tsx
import { getAdminFooterContent } from '@/lib/data/footer';
import FooterForm from '@/components/admin/FooterForm';
import { type FooterContent } from '@prisma/client';

// Opt-out of caching for admin pages to ensure fresh data for forms
export const revalidate = 0;

export default async function ManageFooterPage() {
  let footerData = await getAdminFooterContent('main_footer');

  // Provide default structure if no footer content exists yet
  if (!footerData) {
    footerData = {
      id: '', // Will be handled by upsert
      identifier: 'main_footer',
      copyrightText: `© ${new Date().getFullYear()} MyAppName. All rights reserved.`,
      links: [], // Prisma expects JSON, so an empty array is fine
      socialMedia: [], // Prisma expects JSON
      published: true,
      createdAt: new Date(), // Not strictly needed for form, but good for type consistency
      updatedAt: new Date(), // Not strictly needed for form
    };
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 border-b pb-3">Manage Footer Content</h1>
      <FooterForm initialData={footerData as FooterContent} />
    </div>
  );
}
