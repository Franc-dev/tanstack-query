'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Newspaper,
  Star,
  Link as LinkIconNav,
  Package,
  Anchor,
  Menu,
  X
} from 'lucide-react';

// Define the structure for navigation items
interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

// List of navigation items for the admin sidebar
const navItems: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/hero', label: 'Hero Slides', icon: Newspaper },
  { href: '/admin/featured-items', label: 'Featured Items', icon: Star },
  { href: '/admin/navigation', label: 'Navigation', icon: LinkIconNav },
  { href: '/admin/value-propositions', label: 'Value Propositions', icon: Package },
  { href: '/admin/footer', label: 'Footer', icon: Anchor },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-slate-800 p-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2 text-white">
          <ShieldCheck size={24} className="text-sky-400" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
        <button 
          onClick={toggleMobileMenu}
          className="text-white p-2 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <aside 
        className={`bg-slate-800 text-slate-100 flex-shrink-0 flex flex-col
                   md:w-64 md:block md:static md:z-0
                   fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
                   ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Admin Panel Logo/Title - Hidden on mobile (shown in header) */}
        <div className="text-center py-4 mt-0 md:mt-5 mb-5 hidden md:block">
          <Link href="/admin" className="flex items-center justify-center space-x-2.5 text-xl font-semibold group">
            <ShieldCheck size={30} className="text-sky-400 group-hover:text-sky-300 transition-colors"/>
            <span className="group-hover:text-sky-300 transition-colors">Admin Panel</span>
          </Link>
        </div>

        {/* Add spacing on mobile to account for the header */}
        <div className="md:hidden h-16"></div>

        {/* Navigation Links */}
        <nav className="flex-grow space-y-1.5 p-5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 group py-2.5 px-3.5 rounded-lg transition-all duration-150 ease-in-out
                            ${isActive
                              ? 'bg-sky-600 text-white shadow-md transform scale-105'
                              : 'hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white focus:outline-none'
                            }`}
              >
                <item.icon size={20} className={`transition-colors ${isActive ? 'text-white': 'text-slate-400 group-hover:text-sky-300'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer section of the sidebar */}
        <div className="pt-4 pb-4 px-5 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">&copy; {new Date().getFullYear()} Your App</p>
        </div>
      </aside>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}