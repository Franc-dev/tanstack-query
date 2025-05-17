import AdminSidebar from '@/components/layout/AdminSidebar';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-100 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 relative overflow-hidden">
        <main className="absolute inset-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}