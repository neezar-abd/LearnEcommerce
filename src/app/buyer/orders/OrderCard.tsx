'use client'

import { useTransition, useState } from 'react'
import { CheckCircle2, Loader2, MapPin, Store, Truck } from 'lucide-react'
import { completeOrderAction, submitReviewAction } from './actions'

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  UNPAID:    { label: 'Belum Bayar', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  PACKING:   { label: 'Dikemas', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  SHIPPED:   { label: 'Dikirim', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  COMPLETED: { label: 'Selesai', color: 'text-green-600 bg-green-50 border-green-200' },
  CANCELLED: { label: 'Dibatalkan', color: 'text-red-600 bg-red-50 border-red-200' },
}

function CompleteOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => completeOrderAction(orderId))}
      disabled={isPending}
      className="bg-[#EE4D2D] text-white px-3 py-1.5 text-xs rounded hover:bg-[#d73510] font-semibold transition flex items-center gap-1 disabled:opacity-60"
    >
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      {isPending ? 'Memproses...' : 'Pesanan Diterima'}
    </button>
  )
}

function ReviewForm({ orderItemId, productId }: { orderItemId: string; productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await submitReviewAction(orderItemId, productId, fd)
      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="bg-gray-50 text-gray-600 text-xs p-2 rounded mt-2 border border-gray-100 flex gap-2 items-center">
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Ulasan berhasil dikirim!
      </div>
    )
  }

  return (
    <div className="border border-green-100 bg-green-50 p-3 mt-2 rounded">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <select name="rating" className="text-sm bg-white border border-gray-300 rounded p-1.5 outline-none text-yellow-500 font-bold flex-shrink-0">
          <option value="5">⭐⭐⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="2">⭐⭐</option>
          <option value="1">⭐</option>
        </select>
        <input type="text" name="comment" required placeholder="Tulis ulasan produk..." className="flex-1 text-sm border-gray-300 border px-2 py-1.5 rounded outline-none min-w-0" />
        <button
          type="submit"
          disabled={isPending}
          className="bg-white border border-[#EE4D2D] text-[#EE4D2D] px-3 py-1.5 text-xs rounded hover:bg-[#fff0ed] font-medium transition flex items-center justify-center gap-1 disabled:opacity-60 flex-shrink-0"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {isPending ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
      </form>
    </div>
  )
}

interface OrderCardProps {
  trx: {
    id: string
    totalAmount: unknown
    paymentStatus: string
    orders: {
      id: string
      status: string
      shippingCourier: string | null
      shippingCost: unknown
      subtotal: unknown
      trackingNumber: string | null
      store: { name: string }
      address: { receiverName: string; phone: string; fullAddress: string }
      orderItems: {
        id: string
        productName: string
        variantName: string
        quantity: number
        price: unknown
        review: unknown | null
        variant: { productId: string } | null
      }[]
    }[]
  }
}

export default function OrderCard({ trx }: OrderCardProps) {
  return (
    <div className="bg-white rounded-sm shadow-sm overflow-hidden">

      {/* HEAD TRANSAKSI */}
      <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
            <span className="font-semibold text-gray-800 flex-shrink-0">Invoice:</span>
            <span className="text-xs uppercase bg-gray-200 px-2 py-1 rounded font-mono truncate">{trx.id.split('-')[0]}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-sm">Total:</span>
            <span className="text-[#EE4D2D] font-semibold text-sm">{formatRupiah(Number(trx.totalAmount))}</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded border uppercase ${trx.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
              {trx.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ORDERS PER STORE */}
      {trx.orders.map(order => {
        const statusInfo = STATUS_LABEL[order.status] || { label: order.status, color: 'text-gray-600 bg-gray-50 border-gray-200' }
        return (
          <div key={order.id} className="p-3 md:p-4 border-b border-dashed border-gray-100 last:border-0">

            {/* Store header + status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Store className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="font-semibold text-gray-800 text-sm">{order.store.name}</span>
                <button className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded border border-gray-200">Chat Penjual</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                {order.status === 'SHIPPED' && <CompleteOrderButton orderId={order.id} />}
              </div>
            </div>

            {/* Order items */}
            <div className="space-y-3">
              {order.orderItems.map(item => {
                const hasReviewed = !!item.review
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs rounded-sm">
                        [Foto]
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-800 text-sm font-medium line-clamp-2">{item.productName}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">Variasi: {item.variantName}</p>
                        <p className="text-gray-600 text-xs mt-0.5">x{item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-800 flex-shrink-0 ml-2">
                        {formatRupiah(Number(item.price))}
                      </div>
                    </div>

                    {/* Review */}
                    {order.status === 'COMPLETED' && !hasReviewed && item.variant?.productId && (
                      <ReviewForm orderItemId={item.id} productId={item.variant.productId} />
                    )}
                    {order.status === 'COMPLETED' && hasReviewed && (
                      <div className="bg-gray-50 text-gray-600 text-xs p-2 rounded mt-1 border border-gray-100 flex gap-2 items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Sudah diulas
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Shipping & subtotal */}
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-600 mb-0.5">Dikirim ke</div>
                  <div>{order.address.receiverName} · {order.address.phone}</div>
                  <div className="break-words">{order.address.fullAddress}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-600 mb-0.5">Pengiriman</div>
                  {order.shippingCourier
                    ? <><div>{order.shippingCourier}</div><div>Ongkir: <span className="text-[#EE4D2D] font-medium">{formatRupiah(Number(order.shippingCost))}</span></div></>
                    : <div className="text-gray-400 italic">Belum ada info kurir</div>
                  }
                  {order.trackingNumber && (
                    <div className="mt-0.5">No. Resi: <span className="font-semibold text-gray-700">{order.trackingNumber}</span></div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 flex flex-wrap justify-end gap-3 text-xs text-gray-500">
              <span>Subtotal: <span className="text-gray-800 font-medium">{formatRupiah(Number(order.subtotal))}</span></span>
              {Number(order.shippingCost) > 0 && (
                <span>+ Ongkir: <span className="text-gray-800 font-medium">{formatRupiah(Number(order.shippingCost))}</span></span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
