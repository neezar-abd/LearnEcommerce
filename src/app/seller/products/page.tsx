import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createStoreAction, addProductAction, updateStoreCityAction } from '../actions'
import CitySearch from '@/components/CitySearch'
import {
  Store, Package, LayoutDashboard, LogOut, ClipboardList, TrendingUp, Settings, Navigation, Bell, Search
} from 'lucide-react'
import ProductTableActions from '../ProductTableActions'
import { formatRupiah } from '@/lib/format'
import SellerBottomNav from '../SellerBottomNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      store: {
        include: {
          wallet: true,
          orders: { select: { id: true, status: true } },
          products: {
            include: {
              variants: { take: 1 },
              category: true,
              images: { take: 1 }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })



  // KONDISI 1: JIKA USER BELUM BUKA TOKO
  if (!profile?.store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded shadow-sm border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-[#FFEEEE] rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-[#7C3AED]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Buka Toko Gratis!</h2>
            <p className="text-gray-500 text-sm text-center mt-2">Mulai berjualan di LokaBeli dan capai jutaan pembeli setiap harinya.</p>
          </div>
          
          <form action={createStoreAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko *</label>
              <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white" placeholder="LokaBeli Official" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko *</label>
              <textarea name="description" required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white" placeholder="Menjual kebutuhan sehari-hari dengan kualitas terbaik..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten Toko <span className="text-[#7C3AED]">*</span></label>
              <CitySearch name="cityId" placeholder="Cari kota lokasi toko..." required />
              <p className="text-xs text-gray-400 mt-1">Digunakan untuk menghitung ongkos kirim ke pembeli.</p>
            </div>
            <button type="submit" className="w-full bg-[#7C3AED] text-white py-3 rounded hover:bg-[#6D28D9] font-medium transition-colors">
              Buat Toko Sekarang
            </button>
          </form>
        </div>
      </div>
    )
  }

  // KONDISI 2: USER SUDAH PUNYA TOKO (DASHBOARD)
  const store = profile.store
  const categories = await prisma.category.findMany()

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col pb-20 md:pb-0">
      {/* SELLER HEADER TOPBAR */}
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2 text-[#7C3AED] min-w-0">
          <Store className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium text-base md:text-lg tracking-tight truncate">LokaBeli<span className="hidden sm:inline"> Seller Centre</span></span>
        </Link>
        <div className="flex items-center gap-3 md:gap-6 text-gray-500 flex-shrink-0">
          <Bell className="w-5 h-5 cursor-pointer hover:text-[#7C3AED]" />
          <div className="flex items-center gap-2 cursor-pointer border-l pl-3 md:pl-6 border-gray-200">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
               {store.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] md:max-w-[150px] truncate">{store.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-[240px] bg-white h-[calc(100vh-56px)] sticky top-14 overflow-y-auto hidden md:block pt-4 border-r border-gray-200">
          
          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4" /> Pesanan
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <Link href="/seller/orders" className="hover:text-[#7C3AED] cursor-pointer transition">Pesanan Saya</Link>
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Pengiriman Massal</span>
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Pengaturan Pengiriman</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2 text-[#7C3AED]">
              <Package className="w-4 h-4" /> Produk
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2 font-medium">
              <Link href="/seller" className="text-[#7C3AED] cursor-pointer transition hover:text-[#6D28D9]">Produk Saya</Link>
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Tambah Produk Baru</span>
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Manajemen Merek</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" /> Bisnis Saya
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Performa Toko</span>
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Kesehatan Toko</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" /> Toko
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Profil Toko</span>
              <span className="hover:text-[#7C3AED] cursor-pointer transition">Dekorasi Toko</span>
              <Link href="/" className="hover:text-[#7C3AED] cursor-pointer transition text-gray-400 mt-4 border-t pt-2 block">
                Kembali ke Marketplace
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* DAFTAR PRODUK (UI TABLE STYLE LENGKAP) - 2 Kolom Kiri */}
            <div className="col-span-1 lg:col-span-2 bg-white rounded shadow-sm border border-gray-100">
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-base font-semibold text-gray-800">Produk Saya ({store.products.length})</h2>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <input type="text" placeholder="Cari Nama Produk..." className="text-sm px-3 py-1.5 focus:outline-none w-48 text-gray-800" />
                  <div className="bg-gray-50 p-1.5 border-l border-gray-300"><Search className="w-4 h-4 text-gray-500" /></div>
                </div>
              </div>
              
              <div className="bg-[#f6f6f6] hidden md:grid grid-cols-12 gap-4 p-3 text-xs font-medium text-gray-500 border-b border-gray-100">
                <div className="col-span-6 pl-2">Produk</div>
                <div className="col-span-2">Harga</div>
                <div className="col-span-2">Stok</div>
                <div className="col-span-2 text-right pr-2">Aksi</div>
              </div>

              {store.products.length === 0 ? (
                 <div className="text-center py-16">
                   <div className="text-gray-200 mb-3 flex justify-center"><Package className="w-16 h-16" /></div>
                   <p className="text-gray-500 text-sm">Toko kamu belum memiliki produk.<br/>Upload produk dari menu di sebelah kanan.</p>
                 </div>
              ) : (
                 <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                   {store.products.map(product => (
                     <div key={product.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 text-sm text-gray-700 hover:bg-gray-50 transition border-b md:border-b-0 last:border-0 border-gray-100">
                       
                       <div className="md:col-span-6 flex gap-3">
                         <div className="w-16 h-16 md:w-12 md:h-12 bg-white border border-gray-200 object-cover flex-shrink-0 rounded-md md:rounded-sm overflow-hidden">
                           <img src={product.images[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex flex-col justify-center flex-1">
                           <span className="font-medium text-gray-800 line-clamp-2 md:line-clamp-1" title={product.name}>{product.name}</span>
                           <span className="text-[11px] text-gray-400 mt-0.5 mb-1 md:mb-0">Kategori: {product.category.name}</span>
                           <div className="md:hidden flex gap-3 text-xs mt-1">
                             <div className="font-semibold text-[#7C3AED]">{formatRupiah(Number(product.variants[0]?.price || 0))}</div>
                             <div className="text-gray-500 border-l pl-3">Stok: {product.variants[0]?.stock}</div>
                           </div>
                         </div>
                       </div>

                       <div className="hidden md:flex col-span-2 items-center font-medium">
                         {formatRupiah(Number(product.variants[0]?.price || 0))}
                       </div>

                       <div className="hidden md:flex col-span-2 items-center">
                         {product.variants[0]?.stock === 0 ? (
                           <span className="text-[#7C3AED] font-medium text-xs bg-red-50 px-1.5 py-0.5 rounded">Habis</span>
                         ) : (
                           <span>{product.variants[0]?.stock}</span>
                         )}
                       </div>

                       <div className="hidden md:block col-span-2">
                         <ProductTableActions productId={product.id} />
                       </div>
                       
                       {/* Mobile Actions */}
                       <div className="md:hidden mt-2 pt-3 border-t border-gray-50">
                         <ProductTableActions productId={product.id} />
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>

            {/* FORM UPLOAD PRODUK BARU - 1 Kolom Kanan */}
            <div className="col-span-1 bg-white rounded shadow-sm border border-gray-100 h-fit sticky top-20">
              <div className="bg-gray-50 border-b border-gray-100 p-4">
                <h2 className="text-base font-semibold text-gray-800">+ Tambah Produk Baru</h2>
              </div>
              <div className="p-5">
                <form action={addProductAction} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Nama Barang *</label>
                    <input type="text" name="name" required className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Kategori *</label>
                    <select name="categoryId" required className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm">
                      <option value="">Pilih Kategori...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Harga *</label>
                      <input type="number" name="price" required min={0} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm" placeholder="Rp" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Stok *</label>
                      <input type="number" name="stock" required min={0} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Berat (gram) *</label>
                      <input type="number" name="weight" required min={1} defaultValue={1000} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm" placeholder="1000" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Foto Produk *</label>
                    <input type="file" name="image" accept="image/*" required className="w-full px-3 py-1.5 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9]" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Deskripsi *</label>
                    <textarea name="description" required rows={3} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#7C3AED] text-gray-900 bg-white shadow-sm resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-[#7C3AED] text-white py-2.5 rounded-md shadow-sm hover:shadow-md shadow-[#7C3AED]/20 hover:bg-[#6D28D9] text-[13px] font-medium transition-all duration-200 active:scale-95 mt-2">
                    Simpan & Tampilkan
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>
      <SellerBottomNav />
    </div>
  )
}