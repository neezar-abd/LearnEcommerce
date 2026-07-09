import { getUser } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Store, Package, ClipboardList, Bell, MapPin, LayoutDashboard, Zap, CheckCircle, TrendingUp, Settings } from 'lucide-react'
import { updateOrderStatusAction } from './actions'
import GenerateResiButton from './GenerateResiButton'
import { formatRupiah } from '@/lib/format'
import SellerBottomNav from '../SellerBottomNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SellerOrdersPage() {
  const user = await getUser()

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



  if (!profile?.store) redirect('/seller')

  const store = profile.store

  // Hitung stats
  const stats = {
    packing: store.orders.filter(o => o.status === 'PACKING').length,
    shipped: store.orders.filter(o => o.status === 'SHIPPED').length,
    completed: store.orders.filter(o => o.status === 'COMPLETED').length,
    total: store.orders.length,
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col pb-20 md:pb-0">
      {/* SELLER HEADER TOPBAR */}
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/seller" className="text-gray-600 hover:text-[#7C3AED]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-semibold text-gray-800">Pesanan Saya</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6 text-gray-500 flex-shrink-0">
          <Bell className="w-5 h-5 cursor-pointer hover:text-[#7C3AED]" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-[240px] bg-white h-[calc(100vh-56px)] sticky top-14 overflow-y-auto hidden md:block pt-4 border-r border-gray-200">
          
          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-[#7C3AED] flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4" /> Pesanan
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2 font-medium">
              <Link href="/seller/orders" className="text-[#7C3AED] cursor-pointer transition hover:text-[#6D28D9]">Pesanan Saya</Link>
              <span className="hover:text-[#7C3AED] cursor-pointer transition font-normal">Pengiriman Massal</span>
              <span className="hover:text-[#7C3AED] cursor-pointer transition font-normal">Pengaturan Pengiriman</span>
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" /> Produk
            </div>
            <div className="flex flex-col text-[13px] text-gray-600 pl-6 space-y-2">
              <Link href="/seller" className="hover:text-[#7C3AED] cursor-pointer transition">Produk Saya</Link>
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

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-x-hidden">

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Pesanan', value: stats.total, color: 'text-gray-800' },
              { label: 'Perlu Dikemas', value: stats.packing, color: 'text-blue-600' },
              { label: 'Dalam Pengiriman', value: stats.shipped, color: 'text-purple-600' },
              { label: 'Selesai', value: stats.completed, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded shadow-sm border border-gray-100 p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Biteship info banner */}
          <div className="mb-4 bg-gradient-to-r from-[#FFF5F0] to-[#FFF9F5] border border-orange-100 rounded-lg px-5 py-3 flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-[#7C3AED]">Biteship Auto-Resi aktif!</span>
              {' '}Saat pesanan berstatus <span className="font-semibold">Dikemas</span>, klik <span className="font-semibold">"Buat Resi Otomatis"</span> — resi akan dibuat otomatis &amp; status langsung berubah ke Dikirim.
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-gray-100 min-h-[500px]">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h1 className="text-lg font-medium text-gray-800">Semua Pesanan</h1>
              <span className="text-sm text-gray-500">{store.orders.length} total pesanan</span>
            </div>

            {store.orders.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Belum ada orderan masuk nih.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {store.orders.map(order => (
                  <div key={order.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    {/* Header Order */}
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-dashed border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">{order.transaction.profile.name}</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[250px]">{order.address.fullAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-mono">#{order.id.split('-')[0].toUpperCase()}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-sm border ${
                          order.status === 'UNPAID' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          order.status === 'PACKING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          order.status === 'SHIPPED' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                          order.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {order.status === 'UNPAID' ? 'Belum Bayar' :
                           order.status === 'PACKING' ? 'Perlu Dikemas' :
                           order.status === 'SHIPPED' ? 'Dikirim' :
                           order.status === 'COMPLETED' ? 'Selesai' : order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Left: Items & Shipping */}
                      <div className="flex-1 min-w-0">
                        <div className="space-y-2">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded hover:bg-gray-100/50 transition">
                              <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-300">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Var: {item.variantName} <span className="mx-1">•</span> x{item.quantity}</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{formatRupiah(item.price)}</div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping info */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {order.shippingCourier && (
                            <div className="text-gray-600 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                              <span className="font-medium text-gray-700">{order.shippingCourier}</span>
                              <span>•</span>
                              <span>Ongkir: {formatRupiah(order.shippingCost)}</span>
                              {Number(order.shippingSubsidy) > 0 && (
                                <span className="text-[#7C3AED]">(-{formatRupiah(order.shippingSubsidy)})</span>
                              )}
                            </div>
                          )}
                          {order.trackingNumber && (
                            <div className="text-gray-600 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              <span>Resi:</span>
                              <span className="font-mono font-medium">{order.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions & Totals */}
                      <div className="w-full lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-4">
                        <div className="text-right mb-4">
                          <p className="text-xs text-gray-500 mb-0.5">Total Pendapatan</p>
                          <p className="text-lg font-bold text-[#7C3AED] leading-none">{formatRupiah(order.subtotal)}</p>
                          {Number(order.platformFee) > 0 && (
                            <p className="text-[10px] text-gray-400 mt-1">Potongan admin: {formatRupiah(order.platformFee)}</p>
                          )}
                        </div>

                        <div className="flex justify-end mt-auto">
                          {/* PACKING: tawarkan pilihan auto resi atau input manual */}
                          {order.status === 'PACKING' && !order.trackingNumber && (
                            <div className="flex flex-col gap-2 w-full">
                              {/* Auto resi via Biteship */}
                              <GenerateResiButton orderId={order.id} />

                              {/* Atau input manual */}
                              <form action={updateOrderStatusAction.bind(null, order.id)} className="flex items-center gap-2">
                                <input type="hidden" name="status" value="SHIPPED" />
                                <input
                                  name="trackingNumber"
                                  type="text"
                                  required
                                  placeholder="Input resi..."
                                  className="text-xs px-2 py-1.5 border border-gray-300 rounded focus:border-[#7C3AED] outline-none flex-1 min-w-0"
                                />
                                <button type="submit" className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition">
                                  Kirim
                                </button>
                              </form>
                            </div>
                          )}

                          {/* UNPAID: belum bayar, seller belum bisa proses */}
                          {order.status === 'UNPAID' && (
                            <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded w-full text-center">
                              ⏳ Menunggu Pembayaran
                            </span>
                          )}

                          {/* SHIPPED */}
                          {order.status === 'SHIPPED' && (
                            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded w-full text-center">
                              🚚 Sedang Dikirim
                            </span>
                          )}

                          {/* COMPLETED */}
                          {order.status === 'COMPLETED' && (
                            <span className="text-[11px] text-green-700 bg-green-50 px-2 py-1 rounded w-full text-center font-medium">
                              ✓ Selesai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <SellerBottomNav />
    </div>
  )
}