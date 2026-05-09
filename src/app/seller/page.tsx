import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createStoreAction, addProductAction, updateStoreCityAction } from './actions'
import CitySearch from '@/components/CitySearch'
import {
  Store, Package, LayoutDashboard, LogOut, ClipboardList, TrendingUp, Settings, Navigation, Bell, Search
} from 'lucide-react'
import ProductTableActions from './ProductTableActions'

export const revalidate = 0

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

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  // KONDISI 1: JIKA USER BELUM BUKA TOKO
  if (!profile?.store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded shadow-sm border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-[#FFEEEE] rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-[#EE4D2D]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Buka Toko Gratis!</h2>
            <p className="text-gray-500 text-sm text-center mt-2">Mulai berjualan di UchinagaStore dan capai jutaan pembeli setiap harinya.</p>
          </div>
          
          <form action={createStoreAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko *</label>
              <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white" placeholder="Uchinaga Official" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko *</label>
              <textarea name="description" required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white" placeholder="Menjual kebutuhan sehari-hari dengan kualitas terbaik..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten Toko <span className="text-[#EE4D2D]">*</span></label>
              <CitySearch name="cityId" placeholder="Cari kota lokasi toko..." required />
              <p className="text-xs text-gray-400 mt-1">Digunakan untuk menghitung ongkos kirim ke pembeli.</p>
            </div>
            <button type="submit" className="w-full bg-[#EE4D2D] text-white py-3 rounded hover:bg-[#D73510] font-medium transition-colors">
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
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col">
      {/* MOBILE WARNING OVERLAY */}
      <div className="md:hidden fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
        <LayoutDashboard className="w-16 h-16 text-[#EE4D2D] mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Buka di Desktop</h2>
        <p className="text-gray-500 text-sm">Untuk pengalaman manajemen toko yang lebih baik dan optimal, silakan buka Seller Centre melalui perangkat Desktop atau Laptop.</p>
        <a href="/" className="mt-8 text-[#EE4D2D] font-medium border border-[#EE4D2D] px-6 py-2 rounded">Kembali ke Beranda</a>
      </div>

      {/* SELLER HEADER TOPBAR */}
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6 sticky top-0 z-20">
        <a href="/" className="flex items-center gap-2 text-[#EE4D2D]">
          <Store className="w-6 h-6" />
          <span className="font-medium text-lg tracking-tight">Shopee Seller Centre</span>
        </a>
        <div className="flex items-center gap-6 text-gray-500">
          <Bell className="w-5 h-5 cursor-pointer hover:text-[#EE4D2D]" />
          <div className="flex items-center gap-2 cursor-pointer border-l pl-6 border-gray-200">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
               {store.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">{store.name}</span>
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
              <a href="/seller/orders" className="hover:text-[#EE4D2D] cursor-pointer transition">Pesanan Saya</a>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Pengiriman Massal</span>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Pengaturan Pengiriman</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2 text-[#EE4D2D]">
              <Package className="w-4 h-4" /> Produk
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2 font-medium">
              <a href="/seller" className="text-[#EE4D2D] cursor-pointer transition hover:text-[#D73510]">Produk Saya</a>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Tambah Produk Baru</span>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Manajemen Merek</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" /> Bisnis Saya
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Performa Toko</span>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Kesehatan Toko</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" /> Toko
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Profil Toko</span>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Dekorasi Toko</span>
              <a href="/" className="hover:text-[#EE4D2D] cursor-pointer transition text-gray-400 mt-4 border-t pt-2 block">
                Kembali ke Marketplace
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-6 overflow-x-hidden">

          {/* MATRIKS / STATUS PESANAN ALERT */}
          <div className="grid grid-cols-4 bg-white rounded shadow-sm border border-gray-100 mb-6 text-center divide-x divide-gray-100 p-4">
            <a href="/seller/orders" className="flex flex-col gap-1 cursor-pointer hover:bg-gray-50 py-2 rounded-sm transition">
              <span className="text-2xl font-bold text-[#2673dd]">{store.orders.filter(o => o.status === 'PACKING').length}</span>
              <span className="text-xs text-gray-500">Perlu Diproses</span>
            </a>
            <a href="/seller/orders" className="flex flex-col gap-1 cursor-pointer hover:bg-gray-50 py-2 rounded-sm transition">
              <span className="text-2xl font-bold text-[#2673dd]">{store.orders.filter(o => o.status === 'SHIPPED').length}</span>
              <span className="text-xs text-gray-500">Sedang Dikirim</span>
            </a>
            <a href="/seller/orders" className="flex flex-col gap-1 cursor-pointer hover:bg-gray-50 py-2 rounded-sm transition">
              <span className="text-2xl font-bold text-[#2673dd]">{store.orders.filter(o => o.status === 'COMPLETED').length}</span>
              <span className="text-xs text-gray-500">Selesai</span>
            </a>
            <div className="flex flex-col gap-1 cursor-pointer hover:bg-gray-50 py-2 rounded-sm transition">
              <span className="text-xl font-bold text-green-600">{formatRupiah(Number(store.wallet?.balance || 0))}</span>
              <span className="text-xs text-gray-500">Saldo Toko</span>
            </div>
          </div>

          {/* CITY MISSING WARNING BANNER */}
          {!store.cityId && (
            <div className="bg-orange-50 border border-orange-200 rounded-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-700 mb-1">⚠️ Kota Toko Belum Diset</p>
                <p className="text-xs text-orange-600">Pembeli tidak bisa melihat ongkos kirim dari toko kamu. Set kota toko sekarang supaya sistem bisa menghitung ongkir otomatis.</p>
              </div>
              <form action={updateStoreCityAction} className="flex gap-2 items-end flex-shrink-0 w-full sm:w-80">
                <div className="flex-1">
                  <CitySearch name="cityId" placeholder="Cari kota toko..." required />
                </div>
                <button type="submit" className="bg-[#EE4D2D] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#D73510] transition whitespace-nowrap">
                  Simpan
                </button>
              </form>
            </div>
          )}
          {store.cityId && (
            <div className="bg-green-50 border border-green-200 rounded-sm px-4 py-2.5 mb-6 flex items-center justify-between">
              <p className="text-xs text-green-700">✓ Kota toko sudah diset (ID: {store.cityId}) — Ongkir bisa dihitung otomatis</p>
              <form action={updateStoreCityAction} className="flex gap-2 items-center">
                <CitySearch name="cityId" placeholder="Ganti kota..." />
                <button type="submit" className="text-xs text-green-700 border border-green-300 px-2 py-1 rounded hover:bg-green-100 transition">
                  Update
                </button>
              </form>
            </div>
          )}

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
              
              <div className="bg-[#f6f6f6] grid grid-cols-12 gap-4 p-3 text-xs font-medium text-gray-500 border-b border-gray-100">
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
                     <div key={product.id} className="grid grid-cols-12 gap-4 p-4 text-sm text-gray-700 hover:bg-gray-50 transition">
                       
                       <div className="col-span-6 flex gap-3">
                         <div className="w-12 h-12 bg-white border border-gray-200 object-cover flex-shrink-0 rounded-sm overflow-hidden">
                           <img src={product.images[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex flex-col justify-center">
                           <span className="font-medium text-gray-800 line-clamp-1" title={product.name}>{product.name}</span>
                           <span className="text-[11px] text-gray-400 mt-0.5">Kategori: {product.category.name}</span>
                         </div>
                       </div>

                       <div className="col-span-2 flex items-center font-medium">
                         {formatRupiah(Number(product.variants[0]?.price || 0))}
                       </div>

                       <div className="col-span-2 flex items-center">
                         {product.variants[0]?.stock === 0 ? (
                           <span className="text-[#EE4D2D] font-medium text-xs bg-red-50 px-1.5 py-0.5 rounded">Habis</span>
                         ) : (
                           <span>{product.variants[0]?.stock}</span>
                         )}
                       </div>

                       {/* Use our new client component and pass the ID */}
                       <ProductTableActions productId={product.id} />
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
                    <input type="text" name="name" required className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Kategori *</label>
                    <select name="categoryId" required className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm">
                      <option value="">Pilih Kategori...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Harga *</label>
                      <input type="number" name="price" required min={0} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm" placeholder="Rp" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Stok *</label>
                      <input type="number" name="stock" required min={0} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Berat (gram) *</label>
                      <input type="number" name="weight" required min={1} defaultValue={1000} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm" placeholder="1000" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Foto Produk *</label>
                    <input type="file" name="image" accept="image/*" required className="w-full px-3 py-1.5 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#EE4D2D] file:text-white hover:file:bg-[#D73510]" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Deskripsi *</label>
                    <textarea name="description" required rows={3} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white shadow-sm resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-[#EE4D2D] text-white py-2.5 rounded-sm shadow hover:bg-[#D73510] text-[13px] font-medium transition-colors mt-2">
                    Simpan & Tampilkan
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}