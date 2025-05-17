// app/(admin)/admin/page.tsx
export default function AdminDashboardPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-2">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-slate-700">
            Welcome to the admin panel. Please select a section from the sidebar to manage your website&apos;s content.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            You can manage the Hero section, site navigation, and footer content from here.
          </p>
        </div>
      </div>
    );
  }