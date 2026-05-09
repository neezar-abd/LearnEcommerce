import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Store, Package, ClipboardList, TrendingUp, Settings, Navigation, Bell, Search, MapPin, LayoutDashboard } from 'lucide-react'
import { updateOrderStatusAction } from './actions'

export const revalidate = 0

export default async function SellerOrdersPage() {
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
          orders: {
            include: {
              address: true,
              transaction: {
                include: { profile: true }
              },
              orderItems: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  // Format currency
  const formatRupiah = (price: number | any) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(price) || 0);
  };

  if (!profile?.store) {
    redirect('/seller')
  }

  const store = profile.store

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
            <div className="text-sm font-semibold text-[#EE4D2D] flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4" /> Pesanan
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2 font-medium">
              <a href="/seller/orders" className="text-[#EE4D2D] cursor-pointer transition hover:text-[#D73510]">Pesanan Saya</a>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Pengiriman Massal</span>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Pengaturan Pengiriman</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" /> Produk
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <a href="/seller" className="hover:text-[#EE4D2D] cursor-pointer transition">Produk Saya</a>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Tambah Produk Baru</span>
              <span className="hover:text-[#EE4D2D] cursor-pointer transition">Manajemen Merek</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="bg-white rounded shadow-sm border border-gray-100 min-h-[500px]">
            <div className="border-b px-6 py-4">
              <h1 className="text-lg font-medium text-gray-800">Semua Pesanan</h1>
            </div>

            {store.orders.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Belum ada orderan masuk nih.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {store.orders.map(order => (
                  <div key={order.id} className="p-6">
                    {/* Header Order */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">{order.transaction.profile.name}</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{order.address.fullAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">No. Order: <span className="text-gray-800 font-medium">#{order.id.split('-')[0].toUpperCase()}</span></span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          order.status === 'UNPAID' ? 'bg-orange-100 text-orange-600' :
                          order.status === 'PACKING' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-600' :
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status === 'UNPAID' ? 'Menunggu Konfirmasi' :
                           order.status === 'PACKING' ? 'Dikemas' :
                           order.status === 'SHIPPED' ? 'Dikirim' :
                           order.status === 'COMPLETED' ? 'Selesai' : order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="flex flex-col gap-3">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                            <p className="text-xs text-gray-500">Var: {item.variantName} x {item.quantity}</p>
                          </div>
                          <div className="text-sm text-gray-800">{formatRupiah(item.price)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping info */}
                    {order.shippingCourier && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
                        <span className="font-semibold">Kurir:</span> {order.shippingCourier}
                        <span className="mx-1">·</span>
                        <span className="font-semibold">Ongkir:</span> {formatRupiah(order.shippingCost)}
                        {order.trackingNumber && <><span className="mx-1">·</span><span className="font-semibold">Resi:</span> {order.trackingNumber}</>}
                      </div>
                    )}

                    {/* Footer Order: Actions & Totals */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
                      <form action={updateOrderStatusAction.bind(null, order.id)} className="flex items-center gap-3">
                        <input type="hidden" name="status" value={
                          order.status === 'UNPAID' ? 'PACKING' :
                          order.status === 'PACKING' ? 'SHIPPED' : order.status
                        } />

                        {order.status === 'PACKING' && (
                          <input 
                            name="trackingNumber" 
                            type="text" 
                            required 
                            placeholder="Input Resi Pengiriman" 
                            className="text-sm px-3 py-1.5 border border-gray-300 rounded focus:border-[#EE4D2D] outline-none"
                          />
                        )}

                        {order.status === 'UNPAID' && (
                          <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition">
                            Proses Pesanan
                          </button>
                        )}
                        {order.status === 'PACKING' && (
                          <button type="submit" className="px-4 py-1.5 bg-[#EE4D2D] hover:bg-[#D73510] text-white text-sm font-medium rounded transition">
                            Kirim Pesanan
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <span className="text-sm text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded">
                            Dikirim · Resi: <span className="font-bold">{order.trackingNumber || '-'}</span>
                          </span>
                        )}
                        {order.status === 'COMPLETED' && (
                          <span className="text-sm text-green-700">✓ Pesanan Selesai</span>
                        )}
                      </form>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                        <p className="text-lg font-bold text-[#EE4D2D]">{formatRupiah(order.subtotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}