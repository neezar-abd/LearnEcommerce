import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, MapPin, Package, Store, Truck } from 'lucide-react'
import { completeOrderAction, submitReviewAction } from './actions'
import Navbar from '@/components/Navbar'

export const revalidate = 0

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      cart: { include: { items: true } },
      transactions: {
        include: {
          orders: {
            include: {
              store: true,
              address: true,
              orderItems: {
                include: {
                  review: true,
                  variant: {
                    select: { productId: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!profile) return null

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number)
  }

  const transactions = profile.transactions || []

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-4 mt-6">
        
        {/* TABS NAVIGATION (Visual Only For Now) */}
        <div className="bg-white rounded-sm flex shadow-sm mb-4 text-sm font-medium text-gray-700">
          <div className="flex-1 py-4 text-center border-b-2 border-[#EE4D2D] text-[#EE4D2D] cursor-pointer">Semua</div>
          <div className="flex-1 py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Belum Bayar</div>
          <div className="flex-1 py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Dikemas</div>
          <div className="flex-1 py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Dikirim</div>
          <div className="flex-1 py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Selesai</div>
        </div>

        {transactions.length === 0 ? (
           <div className="bg-white rounded-sm shadow-sm p-16 text-center">
             <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h2 className="text-lg text-gray-800 font-medium">Belum Ada Pesanan</h2>
             <p className="text-gray-500 mt-2">Daftar pesananmu masih kosong nih.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(trx => (
              <div key={trx.id} className="bg-white rounded-sm shadow-sm">
                
                {/* HEAD TRANSAKSI */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2 text-gray-600">
                     <span className="font-semibold text-gray-800">Transaksi Invoice:</span>
                     <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">{trx.id.split('-')[0]}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-gray-500">Total Transaksi: </span>
                      <span className="text-[#EE4D2D] font-medium">{formatRupiah(Number(trx.totalAmount))}</span>
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded uppercase">
                         {trx.paymentStatus}
                      </span>
                   </div>
                </div>

                {/* LOOP PER ORDER (Toko Split) */}
                {trx.orders.map(order => (
                  <div key={order.id} className="p-4 border-b border-dashed border-gray-100">
                    <div className="flex justify-between mb-4 items-center">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-800 text-sm">{order.store.name}</span>
                        <button className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded border border-gray-200 flex items-center gap-1">
                           Chat Penjual
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-[#EE4D2D] text-sm uppercase flex items-center gap-1 font-medium">
                          Status: {order.status}
                        </div>
                        {order.status === 'SHIPPED' && (
                          <form action={completeOrderAction.bind(null, order.id)}>
                            <button type="submit" className="bg-[#EE4D2D] text-white px-3 py-1.5 text-xs rounded hover:bg-[#d73510] font-semibold transition">
                              Pesanan Diterima
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.orderItems.map(item => {
                        const hasReviewed = !!item.review;
                        return (
                        <div key={item.id} className="flex flex-col gap-2">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                               [Gambar]
                            </div>
                            <div className="flex-1">
                              <h3 className="text-gray-800 text-sm font-medium">{item.productName}</h3>
                              <p className="text-gray-500 text-xs mt-1">Variasi: {item.variantName}</p>
                              <p className="text-gray-800 text-sm mt-1">x{item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium text-gray-800">
                              {formatRupiah(Number(item.price))}
                            </div>
                          </div>
                          
                          {/* REVIEW SECTION ONLY FOR COMPLETED ORDER */}
                          {order.status === 'COMPLETED' && !hasReviewed && item.variant?.productId && (
                            <div className="border border-green-100 bg-green-50 p-3 mt-2 rounded">
                              <form action={submitReviewAction.bind(null, item.id, item.variant.productId)} className="flex items-center gap-3">
                                <select name="rating" className="text-sm bg-white border border-gray-300 rounded p-1 outline-none text-yellow-500 font-bold">
                                  <option value="5">⭐⭐⭐⭐⭐</option>
                                  <option value="4">⭐⭐⭐⭐</option>
                                  <option value="3">⭐⭐⭐</option>
                                  <option value="2">⭐⭐</option>
                                  <option value="1">⭐</option>
                                </select>
                                <input type="text" name="comment" required placeholder="Tulis ulasan produk..." className="flex-1 text-sm border-gray-300 border px-2 py-1.5 rounded outline-none" />
                                <button type="submit" className="bg-white border border-[#EE4D2D] text-[#EE4D2D] px-3 py-1 text-xs rounded hover:bg-[#fff0ed] font-medium transition">
                                  Kirim Ulasan
                                </button>
                              </form>
                            </div>
                          )}

                          {order.status === 'COMPLETED' && hasReviewed && (
                            <div className="bg-gray-50 text-gray-600 text-xs p-2 rounded mt-2 border border-gray-100 flex gap-2 items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Anda sudah mengulas produk ini: {item.review?.rating} Bintang.
                            </div>
                          )}
                        </div>
                      )})}
                    </div>

                    {/* SHIPPING DETAILS */}
                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                      {/* Alamat */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-600 mb-0.5">Dikirim ke</div>
                          <div>{order.address.receiverName} · {order.address.phone}</div>
                          <div>{order.address.fullAddress}</div>
                        </div>
                      </div>
                      {/* Kurir & Ongkir */}
                      <div className="flex items-start gap-2">
                        <Truck className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-600 mb-0.5">Pengiriman</div>
                          {order.shippingCourier
                            ? <><div>{order.shippingCourier}</div><div>Ongkos Kirim: <span className="text-[#EE4D2D] font-medium">{formatRupiah(Number(order.shippingCost))}</span></div></>
                            : <div className="text-gray-400 italic">Belum ada info kurir</div>
                          }
                          {order.trackingNumber && (
                            <div className="mt-1">No. Resi: <span className="font-semibold text-gray-700">{order.trackingNumber}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SUBTOTAL PER TOKO */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end items-center gap-4 text-sm">
                      <span className="text-gray-500">Subtotal produk: <span className="text-gray-800 font-medium">{formatRupiah(Number(order.subtotal))}</span></span>
                      {Number(order.shippingCost) > 0 && (
                        <span className="text-gray-500">+ Ongkir: <span className="text-gray-800 font-medium">{formatRupiah(Number(order.shippingCost))}</span></span>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
