'use client';

import Link from 'next/link';
// Ensure this path is correct for your project structure.
// Example: import { PopulatedNavItem } from '@/lib/data/navigation';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Menu, X, ChevronDown, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define PopulatedNavItem interface if not imported
// This is an example, adjust it to match your actual data structure.
export interface PopulatedNavItem {
  id: string | number; // Unique identifier
  label: string;
  href?: string; // Optional: if it's a direct link
  children?: PopulatedNavItem[]; // For dropdowns or nested items
  description?: string; // Optional: for descriptions in dropdowns
  isGroupLabel?: boolean; // Optional: to explicitly mark an item as just a label for children
  target?: string; // Optional: for external links e.g. '_blank'
  rel?: string; // Optional: for external links e.g. 'noopener noreferrer'
}

interface HeaderProps {
  navigationItems: PopulatedNavItem[];
}

const MAX_DESKTOP_FLYOUT_LEVEL = 1; // Main Nav (implicit) -> Dropdown (level 0 for items) -> Fly-out (level 1 for items) -> Links (no more fly-outs)
const MAX_MOBILE_ACCORDION_LEVEL = 2; // Root item (level 0) -> Children (level 1) -> Grandchildren (level 2) -> Links (no more accordions)

// --- RecursiveDropdownItem Component (with 3-level limit for desktop fly-outs) ---
interface RecursiveDropdownItemProps {
  navItem: PopulatedNavItem;
  onLinkClick: () => void;
  level?: number; // 0 for items in main dropdown, 1 for items in first fly-out
}

function RecursiveDropdownItem({ navItem, onLinkClick, level = 0 }: RecursiveDropdownItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = navItem.children && navItem.children.length > 0;
  const canOpenFlyout = hasChildren && level < MAX_DESKTOP_FLYOUT_LEVEL;

  const baseLinkClassName = `w-full text-left px-4 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-100 hover:text-[#006056] transition-colors duration-150 ease-in-out relative flex justify-between items-center`;
  const groupLabelClassName = `px-4 pt-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 cursor-default flex justify-between items-center`;
  const lastLevelLinkClassName = `${baseLinkClassName} text-sm font-normal pl-6`; // For items at max depth

  // Case 1: Item is purely a group label (no href or explicitly marked)
  if ((!navItem.href && hasChildren) || navItem.isGroupLabel) {
    return (
      <li
        className="relative"
        onMouseEnter={() => { if (canOpenFlyout) setIsHovered(true); }}
        onMouseLeave={() => { if (canOpenFlyout) setIsHovered(false); }}
      >
        <div className={groupLabelClassName}>
          <span>{navItem.label}</span>
          {canOpenFlyout && <ChevronDown size={14} className={`transform transition-transform duration-200 ${isHovered ? 'rotate-0' : '-rotate-90'}`} />}
        </div>
        {canOpenFlyout && ( // Render fly-out if allowed
          <AnimatePresence>
            {isHovered && (
              <motion.ul
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={`absolute left-full top-0 -mt-px ml-1 w-auto min-w-[16rem] max-w-xs bg-white rounded-lg shadow-xl py-1 z-[${70 + level}] border border-slate-200 divide-y divide-slate-100`}
              >
                {navItem.children?.map(child => (
                  <RecursiveDropdownItem
                    key={child.id || child.label}
                    navItem={child}
                    onLinkClick={onLinkClick}
                    level={level + 1}
                  />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
        {hasChildren && !canOpenFlyout && ( // Max level reached, list children as simple links
          <ul className="bg-slate-50 divide-y divide-slate-100">
            {navItem.children?.map(child => (
              <li key={child.id || child.label}>
                <Link
                  href={child.href || '#'}
                  target={child.target}
                  rel={child.rel}
                  className={lastLevelLinkClassName}
                  onClick={onLinkClick}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  // Case 2: Clickable link, which might also open a fly-out or list children
  return (
    <li
      className="relative"
      onMouseEnter={() => { if (canOpenFlyout) setIsHovered(true); }}
      onMouseLeave={() => { if (canOpenFlyout) setIsHovered(false); }}
    >
      <Link
        href={navItem.href || '#'}
        target={navItem.target}
        rel={navItem.rel}
        className={`${baseLinkClassName} ${canOpenFlyout ? 'font-semibold' : ''}`}
        onClick={() => {
           if (!canOpenFlyout || navItem.href) { // If it won't open a flyout, or it's a direct link, close menu
             onLinkClick();
           }
        }}
      >
        <span>{navItem.label}</span>
        {canOpenFlyout && <ChevronDown size={14} className={`transform transition-transform duration-200 ${isHovered ? 'rotate-0' : '-rotate-90'}`} />}
      </Link>
      {canOpenFlyout && ( // Render fly-out if allowed
        <AnimatePresence>
          {isHovered && (
            <motion.ul
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute left-full top-0 -mt-px ml-1 w-auto min-w-[16rem] max-w-xs bg-white rounded-lg shadow-xl py-1 z-[${70 + level}] border border-slate-200 divide-y divide-slate-100`}
            >
              {navItem.children?.map(child => (
                <RecursiveDropdownItem
                  key={child.id || child.label}
                  navItem={child}
                  onLinkClick={onLinkClick}
                  level={level + 1}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
      {hasChildren && !canOpenFlyout && ( // Max level reached, list children as simple links
          <ul className="bg-slate-50 divide-y divide-slate-100">
            {navItem.children?.map(child => (
              <li key={child.id || child.label}>
                <Link
                  href={child.href || '#'}
                  target={child.target}
                  rel={child.rel}
                  className={lastLevelLinkClassName}
                  onClick={onLinkClick}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
    </li>
  );
}

// --- DesktopDropdownAnimated Component (uses RecursiveDropdownItem) ---
function DesktopDropdownAnimated({
  item,
  isOpen,
  setIsParentHovered,
}: {
  item: PopulatedNavItem;
  isOpen: boolean;
  setIsParentHovered: (isHovered: boolean) => void;
}) {
  if (!item.children) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute top-full left-0 mt-1 w-auto min-w-[18rem] max-w-md bg-white rounded-lg shadow-xl py-1 z-[60] border border-slate-200"
        >
          <ul className="divide-y divide-slate-100">
            {item.children.map((childNavItem) => (
              <RecursiveDropdownItem
                key={childNavItem.id || childNavItem.label}
                navItem={childNavItem}
                onLinkClick={() => setIsParentHovered(false)}
                level={0}
              />
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- DesktopNavLink Component ---
function DesktopNavLink({ item }: { item: PopulatedNavItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();

  let isActive = pathname === item.href;
  if (hasChildren && !isActive && item.children) {
    const checkActiveRecursive = (items: PopulatedNavItem[]): boolean => {
      for (const navItem of items) {
        if (pathname === navItem.href) return true;
        if (navItem.children && checkActiveRecursive(navItem.children)) return true;
      }
      return false;
    };
    isActive = checkActiveRecursive(item.children);
  }

  const isExternalLink = item.href?.startsWith('http') || item.target === '_blank';
  const linkBaseStyle = "inline-flex items-center px-3 py-4 text-sm font-medium transition-colors duration-150 ease-in-out relative";
  const activeStyle = "text-white";
  const inactiveStyle = "text-gray-300 hover:text-white";

  return (
    <li
      className="relative"
      onMouseEnter={() => { if (hasChildren) setIsHovered(true); }}
      onMouseLeave={() => { if (hasChildren) setIsHovered(false); }}
    >
      <Link
        href={item.href || (hasChildren ? '#' : (item.href || '#'))}
        target={item.target}
        rel={item.rel || (isExternalLink ? 'noopener noreferrer' : undefined)}
        className={`${linkBaseStyle} ${isActive ? activeStyle : inactiveStyle} ${hasChildren && isHovered ? 'text-white' : ''}`}
        onClick={(e) => {
          if (hasChildren && !item.href) {
            e.preventDefault();
          }
        }}
      >
        <motion.span className="py-1">{item.label}</motion.span>
        {isExternalLink && !hasChildren && <ExternalLink size={14} className="ml-1.5 opacity-80" />}
        {hasChildren && (
          <motion.span
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex ml-1.5"
          >
            <ChevronDown size={14} />
          </motion.span>
        )}
        <AnimatePresence>
          {(isActive || (hasChildren && isHovered)) && (
            <motion.div
              className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-green-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.3 }}
              style={{ originX: 0.5 }}
            />
          )}
        </AnimatePresence>
      </Link>
      {hasChildren && (
        <DesktopDropdownAnimated
          item={item}
          isOpen={isHovered}
          setIsParentHovered={setIsHovered}
        />
      )}
    </li>
  );
}

// --- MobileAccordion Component (with 3-level depth limit) ---
interface MobileAccordionProps {
    item: PopulatedNavItem;
    onItemClick: () => void;
    currentLevel?: number;
}

function MobileAccordion({ item, onItemClick, currentLevel = 0 }: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const isExternalLink = item.href?.startsWith('http') || item.target === '_blank';

  const canOpenAccordion = hasChildren && currentLevel < MAX_MOBILE_ACCORDION_LEVEL;
  const paddingLeftClass = `pl-${4 + currentLevel * 3}`; // e.g., pl-4, pl-7, pl-10

  // Render as a simple link if no children or max accordion level reached
  if (!hasChildren || (hasChildren && !canOpenAccordion)) {
    return (
      <li className={`border-b border-gray-800 last:border-b-0`}>
        <Link
          href={item.href || '#'}
          target={item.target}
          rel={item.rel || (isExternalLink ? 'noopener noreferrer' : undefined)}
          className={`block w-full py-3 text-base font-medium transition ${paddingLeftClass} ${isActive ? 'text-blue-400' : 'text-gray-200 hover:text-white'}`}
          onClick={onItemClick}
        >
          <div className="flex items-center justify-between pr-4">
            <span>{item.label}</span>
            {/* Show external link icon only if it's a terminal item */}
            {isExternalLink && <ExternalLink size={14} className="ml-1.5 shrink-0" />}
          </div>
        </Link>
        {/* If it has children but cannot open an accordion (max level), list them as simple indented links */}
        {hasChildren && !canOpenAccordion && (
            <ul className={`bg-gray-850 divide-y divide-gray-750`}>
                {item.children?.map(childItem => (
                    <li key={childItem.id || childItem.label} className={`${paddingLeftClass} border-t border-gray-800 first:border-t-0`}>
                        <Link
                            href={childItem.href || '#'}
                            target={childItem.target}
                            rel={childItem.rel}
                            className={`block w-full py-2 text-sm font-normal text-gray-300 hover:text-white transition pl-3`}
                            onClick={onItemClick}
                        >
                            {childItem.label}
                        </Link>
                    </li>
                ))}
            </ul>
        )}
      </li>
    );
  }

  // Render as an expandable accordion item
  return (
    <li className="border-b border-gray-800 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full py-3 text-base font-medium text-gray-200 hover:text-white transition ${paddingLeftClass} pr-4`}
        aria-expanded={isOpen}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} shrink-0`}
        />
      </button>

      {isOpen && item.children && (
        <div className="bg-gray-850"> {/* Slightly different bg for nested mobile items */}
          <ul>
            {item.children.map(childItem => (
              <MobileAccordion
                key={childItem.id || childItem.label}
                item={childItem}
                onItemClick={onItemClick}
                currentLevel={currentLevel + 1}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

// --- Main Header Component ---
export default function Header({ navigationItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out 
              ${isScrolled 
                ? 'bg-gray-900/90 shadow-lg backdrop-blur-sm' 
                : 'bg-gray-900/80 backdrop-blur-sm'}`}
    >
      {/* MODIFIED: Removed specific bg-gray-900 and border-b to allow inheritance and remove the line */}
      <div className=""> {/* Was: "bg-gray-900 border-b border-gray-800" */}
        <div className="container mx-auto px-4 flex justify-end">
          <div className="flex items-center space-x-6">
            <Link href="/support" className="py-2 text-xs text-gray-300 hover:text-white transition-colors">Support</Link>
            <Link href="/about" className="py-2 text-xs text-gray-300 hover:text-white transition-colors">About Us</Link>
            <Link href="/login" className="py-2 text-xs text-gray-300 hover:text-white transition-colors">Log In</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[70px]">
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="text-white font-bold flex items-center">
              <Image 
                src="https://res.cloudinary.com/dunssu2gi/image/upload/v1747397477/blog-images/spg9mdczuxtyu4dak8ji.jpg" 
                alt="Mitsumi Logo" 
                width={32}
                height={32}
                className="object-contain"
              />
              <div className="ml-3">
                <div className="text-xl font-bold uppercase tracking-wide">Mitsumi</div>
                <div className="text-sm text-gray-400">Distribution</div>
              </div>
            </div>
          </Link>
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <DesktopNavLink key={item.id || item.label} item={item} />
              ))}
            </ul>
          </nav>
          <div className="hidden md:block">
            <Link href="/demo" className="inline-flex items-center px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded transition-colors duration-200">
              Request a Demo
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label="Open main menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-gray-900 z-[100] transition-transform duration-300 ease-in-out transform md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
               <div className="text-white font-bold flex items-center">
                {/* Placeholder for logo in mobile menu if different, or use Image component */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <div className="ml-3">
                  <div className="text-xl font-bold uppercase tracking-wide">Mitsumi</div>
                  <div className="text-sm text-gray-400">Distribution</div>
                </div>
               </div>
            </Link>
            <button onClick={closeMobileMenu} className="p-2 text-gray-400 hover:text-white" aria-label="Close main menu">
              <X size={24} />
            </button>
          </div>
          <div className="flex-grow py-2 overflow-y-auto">
            <nav>
              <ul>
                {navigationItems.map((item) => (
                  <MobileAccordion
                    key={item.id || item.label}
                    item={item}
                    onItemClick={closeMobileMenu}
                    currentLevel={0}
                  />
                ))}
              </ul>
            </nav>
            <div className="mt-6 px-4 pb-6">
              <Link href="/demo" onClick={closeMobileMenu} className="block w-full py-3 text-center bg-white text-gray-900 font-medium rounded">
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}