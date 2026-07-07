import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link'
import SearchBar from './SearchBar';
import NavbarUserSection from './NavbarUserSection';

/**
 * Navbar Skeleton - shown as fallback while NavbarUserSection loads from DB.
 * Matches the shape of the real user section so there's no layout shift.
 */
function NavbarUserSkeleton() {
  return (
    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 animate-pulse">
      {/* Cart icon skeleton */}
      <div className="p-2 rounded-full">
        <ShoppingCart className="w-6 h-6 text-gray-200" />
      </div>
      {/* Bell skeleton (desktop) */}
      <div className="hidden md:block w-6 h-6 rounded-full bg-gray-200" />
      {/* Mail skeleton (desktop) */}
      <div className="hidden md:block w-6 h-6 rounded-full bg-gray-200" />

      <div className="h-6 w-px bg-gray-200 hidden md:block" />

      {/* Avatar skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="hidden md:block h-4 w-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/**
 * Navbar — synchronous, never blocks page streaming.
 * The dynamic user section (DB-dependent) is streamed separately via Suspense.
 */
export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 text-gray-700 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <span className="text-[#7C3AED] font-bold text-2xl tracking-tight">LokaBeli</span>
        </Link>

        {/* Kategori */}
        <div className="hidden md:block flex-shrink-0">
          <span className="text-gray-500 hover:text-[#7C3AED] cursor-pointer text-sm font-medium">Kategori</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Dynamic user section — streamed, never blocks page load */}
        <Suspense fallback={<NavbarUserSkeleton />}>
          <NavbarUserSection />
        </Suspense>
      </div>
    </header>
  );
}
