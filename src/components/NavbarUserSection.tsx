import { createClient } from '@/utils/supabase/server';
import { ShoppingCart, Mail, User } from 'lucide-react';
import prisma from '@/lib/prisma';
import NotificationDropdown from './NotificationDropdown';
import Link from 'next/link';

/**
 * Async Server Component - Fetches user session, profile, and cart count.
 * Rendered inside a Suspense boundary in Navbar so it never blocks page streaming.
 */
export default async function NavbarUserSection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    userProfile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });
  }

  let cartItemCount = 0;
  if (userProfile) {
    const cart = await prisma.cart.findUnique({
      where: { profileId: userProfile.id },
      include: { items: true }
    });
    if (cart) {
      cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    }
  }

  return (
    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
      <div className="flex items-center gap-1 md:gap-2 text-gray-500">
        <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 hover:text-[#7C3AED] transition-all duration-200 active:scale-95">
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </Link>
        {userProfile ? (
          <NotificationDropdown profileId={userProfile.id} />
        ) : null}
        <Link href="/messages" className="p-2 rounded-full hover:bg-gray-100 hover:text-[#7C3AED] transition-all duration-200 active:scale-95 hidden md:block">
          <Mail className="w-6 h-6" />
        </Link>
      </div>

      <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

      {userProfile ? (
        <div className="relative group flex items-center gap-4">
          <Link href="/buyer/profile" className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors duration-200">
            <div className="w-8 h-8 bg-[#FAF5FF] rounded-full flex items-center justify-center text-[#7C3AED] overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="font-medium text-sm text-gray-700 group-hover:text-[#7C3AED] transition-colors hidden md:block">{userProfile.name || 'penjual'}</span>
          </Link>

          <Link href="/seller" className="hidden md:flex items-center justify-center px-4 py-1.5 border border-[#7C3AED] text-[#7C3AED] text-sm font-semibold rounded-md hover:bg-[#7C3AED] hover:text-white transition-all duration-300 active:scale-95 hover:shadow-md shadow-[#7C3AED]/20">
            Buka Toko
          </Link>

          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out origin-top-right scale-95 group-hover:scale-100 w-48 z-50">
            <div className="bg-white text-gray-700 rounded-xl shadow-lg flex flex-col text-sm relative border border-gray-100 overflow-hidden">
              <div className="absolute -top-2 right-12 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
              <Link href="/buyer/profile" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors relative z-10">Akun Saya</Link>
              <Link href="/buyer/wishlist" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors relative z-10">Wishlist</Link>
              <Link href="/buyer/orders" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors relative z-10">Pesanan Saya</Link>
              <div className="h-px bg-gray-100 my-1 relative z-10"></div>
              <form action="/auth/signout" method="post" className="w-full relative z-10">
                <button type="submit" className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors">Log Out</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 font-medium text-sm items-center">
          <Link href="/login" className="px-4 py-1.5 border border-[#7C3AED] text-[#7C3AED] rounded-md hover:bg-gray-50 transition-all duration-200 active:scale-95">Masuk</Link>
          <Link href="/login" className="px-4 py-1.5 bg-[#7C3AED] text-white rounded-md hover:bg-[#6D28D9] transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md">Daftar</Link>
        </div>
      )}
    </div>
  );
}
