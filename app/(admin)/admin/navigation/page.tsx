// app/(admin)/admin/navigation/page.tsx
import { getAdminNavigationItems, type PopulatedNavItem } from '@/lib/data/navigation'; // Assuming PopulatedNavItem includes children
import NavigationManager from '@/components/admin/NavigationManager';

// Opt-out of caching for admin pages to ensure fresh data
export const revalidate = 0;

export default async function ManageNavigationPage() {
  // Fetch all navigation items, including their children, for the admin panel.
  // The getAdminNavigationItems function should be structured to return items
  // in a way that their hierarchy (parent/child) can be easily determined or is already processed.
  const navigationItems: PopulatedNavItem[] = await getAdminNavigationItems();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Navigation</h1>
        {/* The "Add New Item" functionality will likely be part of NavigationManager */}
      </div>

      <NavigationManager initialItems={navigationItems} />
    </div>
  );
}
