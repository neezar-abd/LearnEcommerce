import { createClient } from '@/utils/supabase/server';
import { Search, ShoppingCart } from 'lucide-react';
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
    <header className="bg-[#EE4D2D] text-white">
      {/* Top Bar - Hidden on mobile */}
      <div className="max-w-[1200px] mx-auto px-4 text-[13px] hidden md:flex justify-between items-center h-8">
        <div className="flex gap-4">
          <a href="/seller" className="hover:text-white/80 cursor-pointer">Seller Centre</a>
          <span className="hover:text-white/80 cursor-pointer">Download</span>
          <span className="hover:text-white/80 cursor-pointer">Ikuti kami di</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="hover:text-white/80 cursor-pointer">Notifikasi</span>
          <span className="hover:text-white/80 cursor-pointer">Bantuan</span>
          <span className="hover:text-white/80 cursor-pointer">Bahasa Indonesia</span>
          {userProfile ? (
            <div className="relative group cursor-pointer z-50">
              <div className="flex items-center gap-2 py-1">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-[10px] overflow-hidden">
                  {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : userProfile.name.charAt(0)}
                </div>
                <span className="font-medium hover:text-white/80">{userProfile.name}</span>
              </div>
              
              <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-36">
                <div className="bg-white text-gray-800 rounded-sm shadow-[0_1px_10px_rgba(0,0,0,0.1)] flex flex-col text-[14px] font-normal relative border border-gray-100">
                  <div className="absolute -top-1.5 right-5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>
                  
                  <a href="/buyer/profile" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#EE4D2D] z-10 transition-colors rounded-t-sm">Akun Saya</a>
                  <a href="/buyer/wishlist" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#EE4D2D] z-10 transition-colors">Wishlist</a>
                  <a href="/buyer/orders" className="px-4 py-2.5 hover:bg-gray-50 hover:text-[#EE4D2D] z-10 transition-colors">Pesanan Saya</a>
                  <form action="/auth/signout" method="post" className="z-10 w-full">
                    <button type="submit" className="w-full text-left px-4 py-2.5 hover:bg-gray-50 hover:text-[#EE4D2D] transition-colors rounded-b-sm">Log Out</button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 font-semibold">
              <a href="/login" className="hover:text-white/80 cursor-pointer">Daftar</a>
              <span className="border-r border-white/40"></span>
              <a href="/login" className="hover:text-white/80 cursor-pointer">Log In</a>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-[1200px] mx-auto px-4 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-8">
        
        {/* Logo and Mobile Auth / Cart */}
        <div className="flex justify-between items-center w-full md:w-auto md:justify-start">
          <a href="/" className="flex items-center gap-2 cursor-pointer w-auto md:w-48">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#EE4D2D] font-bold text-lg md:text-2xl">U</span>
            </div>
            <span className="font-bold text-lg md:text-2xl tracking-tight">Uchinaga</span>
          </a>

          {/* Mobile Right Icons (Cart + Auth) - Hidden on md */}
          <div className="flex items-center gap-3 md:hidden">
            {userProfile ? (
               <a href="/buyer/profile" className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-xs overflow-hidden">
                 {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : userProfile.name.charAt(0)}
               </a>
            ) : (
               <a href="/login" className="text-sm font-semibold">Log In</a>
            )}
            
            <a href="/cart" className="relative p-1.5 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-white text-[#EE4D2D] border-2 border-[#EE4D2D] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                   {cartItemCount > 99 ? '99+' : cartItemCount}
                 </span>
              )}
            </a>
          </div>
        </div>

        {/* Search Bar - Full width on mobile, flexible on desktop */}
        <div className="w-full md:flex-1 order-3 md:order-2">
          <form action="/" method="GET" className="flex w-full bg-white rounded-sm p-1 shadow-sm">
            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari produk..." 
              className="flex-1 px-3 py-1.5 text-gray-800 outline-none rounded-l-sm text-sm md:text-base"
            />
            <button type="submit" className="bg-[#EE4D2D] px-4 md:px-6 py-1.5 rounded-sm hover:bg-[#d74326] transition-colors flex items-center justify-center">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          </form>
        </div>

        {/* Desktop Cart - Hidden on mobile */}
        <div className="w-20 hidden md:flex justify-center order-2 md:order-3">
          <a href="/cart" className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <ShoppingCart className="w-7 h-7" />
            {cartItemCount > 0 && (
               <span className="absolute top-0 right-0 bg-white text-[#EE4D2D] border-2 border-[#EE4D2D] text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                 {cartItemCount > 99 ? '99+' : cartItemCount}
               </span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
}
