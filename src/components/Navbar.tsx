import { createClient } from '@/utils/supabase/server';
import { Search, ShoppingCart, Bell, Mail, User } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function Navbar({ searchQuery }: { searchQuery?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile data if user exists
  let userProfile = null;
  if (user) {
    userProfile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });
  }

  // Calculate cart count
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
    <header className="bg-white border-b border-gray-200 text-gray-700 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-4 md:gap-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <span className="text-[#7C3AED] font-bold text-2xl tracking-tight">LokaBeli</span>
        </a>

        {/* Kategori */}
        <div className="hidden md:block flex-shrink-0">
          <span className="text-gray-500 hover:text-[#7C3AED] cursor-pointer text-sm font-medium">Kategori</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form action="/" method="GET" className="flex items-center w-full bg-white border border-gray-300 rounded-md overflow-hidden focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] focus-within:shadow-md transition-all duration-300">
            <div className="pl-3 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari buku bekas, novel..." 
              className="w-full px-3 py-2 text-sm text-gray-800 outline-none"
            />
          </form>
        </div>

        {/* Icons & Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 md:gap-2 text-gray-500">
            <a href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 hover:text-[#7C3AED] transition-all duration-200 active:scale-95">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white transform transition-transform animate-pulse">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </a>
            <a href="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 hover:text-[#7C3AED] transition-all duration-200 active:scale-95 hidden md:block">
              <Bell className="w-6 h-6" />
              {/* Badge for notification */}
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                1
              </span>
            </a>
            <a href="/messages" className="p-2 rounded-full hover:bg-gray-100 hover:text-[#7C3AED] transition-all duration-200 active:scale-95 hidden md:block">
              <Mail className="w-6 h-6" />
            </a>
          </div>

          <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

          {userProfile ? (
            <div className="relative group flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors duration-200">
                <div className="w-8 h-8 bg-[#FAF5FF] rounded-full flex items-center justify-center text-[#7C3AED] overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <span className="font-medium text-sm text-gray-700 group-hover:text-[#7C3AED] transition-colors hidden md:block">{userProfile.name || 'penjual'}</span>
              </div>
              
              <a href="/seller" className="hidden md:flex items-center justify-center px-4 py-1.5 border border-[#7C3AED] text-[#7C3AED] text-sm font-semibold rounded-md hover:bg-[#7C3AED] hover:text-white transition-all duration-300 active:scale-95 hover:shadow-md shadow-[#7C3AED]/20">
                Buka Toko
              </a>

              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out origin-top-right scale-95 group-hover:scale-100 w-48 z-50">
                <div className="bg-white text-gray-700 rounded-xl shadow-lg flex flex-col text-sm relative border border-gray-100 overflow-hidden">
                  <div className="absolute -top-2 right-12 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
                  <a href="/buyer/profile" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors relative z-10">Akun Saya</a>
                  <a href="/buyer/wishlist" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors relative z-10">Wishlist</a>
                  <a href="/buyer/orders" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors relative z-10">Pesanan Saya</a>
                  <div className="h-px bg-gray-100 my-1 relative z-10"></div>
                  <form action="/auth/signout" method="post" className="w-full relative z-10">
                    <button type="submit" className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors">Log Out</button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 font-medium text-sm items-center">
              <a href="/login" className="px-4 py-1.5 border border-[#7C3AED] text-[#7C3AED] rounded-md hover:bg-gray-50 transition-all duration-200 active:scale-95">Masuk</a>
              <a href="/login" className="px-4 py-1.5 bg-[#7C3AED] text-white rounded-md hover:bg-[#6D28D9] transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md">Daftar</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
