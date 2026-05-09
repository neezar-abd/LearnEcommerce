'use client'

import { useEffect, useState, useTransition } from 'react'
import { Truck, Package, CheckCircle2, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { placeOrderAction } from './actions'

interface Variant { id: string; name: string; price: number }
interface Product { id: string; name: string; weight: number; store: { id: string; name: string; cityId: string | null } }
interface CartItem { id: string; quantity: number; variant: Variant & { product: Product } }
interface Address { id: string; label: string; receiverName: string; phone: string; fullAddress: string; isPrimary: boolean; cityId: string | null }
interface ShippingService { service: string; description: string; cost: number; etd: string }
interface CourierResult { courier: string; services: ShippingService[] }

interface CheckoutClientProps {
  addresses: Address[]
  cartItemsByStore: { storeId: string; storeName: string; storeCityId: string | null; items: CartItem[] }[]
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function CheckoutClient({ addresses, cartItemsByStore }: CheckoutClientProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isPrimary)?.id || addresses[0]?.id || ''
  )
  const [shippingOptions, setShippingOptions] = useState<Record<string, CourierResult[]>>({})
  const [selectedShipping, setSelectedShipping] = useState<Record<string, { courier: string; cost: number }>>({})
  const [loadingShipping, setLoadingShipping] = useState<Record<string, boolean>>({})
  const [shippingError, setShippingError] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [orderError, setOrderError] = useState('')

  const selectedAddress = addresses.find(a => a.id === selectedAddressId)

  // Re-fetch shipping whenever address changes
  useEffect(() => {
    if (!selectedAddress?.cityId) return
    setSelectedShipping({})
    setShippingOptions({})

    cartItemsByStore.forEach(storeGroup => {
      if (!storeGroup.storeCityId) return
      fetchShipping(storeGroup.storeId, storeGroup.storeCityId, selectedAddress.cityId!, storeGroup.items)
    })
  }, [selectedAddressId])

  const fetchShipping = async (
    storeId: string,
    originCityId: string,
    destCityId: string,
    items: CartItem[]
  ) => {
    if (originCityId === destCityId) {
      // same city, use flat low cost mock
    }

    setLoadingShipping(prev => ({ ...prev, [storeId]: true }))
    setShippingError(prev => ({ ...prev, [storeId]: '' }))

    const totalWeight = items.reduce((acc, item) => acc + (item.variant.product.weight * item.quantity), 0)

    try {
      const res = await fetch('/api/shipping/cost', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ originCityId, destinationCityId: destCityId, weightGrams: totalWeight })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setShippingOptions(prev => ({ ...prev, [storeId]: data.results }))
    } catch (e: any) {
      setShippingError(prev => ({ ...prev, [storeId]: e.message || 'Gagal memuat ongkir' }))
    } finally {
      setLoadingShipping(prev => ({ ...prev, [storeId]: false }))
    }
  }

  const productTotal = cartItemsByStore
    .flatMap(g => g.items)
    .reduce((acc, item) => acc + Number(item.variant.price) * item.quantity, 0)

  const shippingTotal = Object.values(selectedShipping).reduce((acc, s) => acc + s.cost, 0)
  const grandTotal = productTotal + shippingTotal

  const allShippingSelected = cartItemsByStore.every(g => selectedShipping[g.storeId])
  const hasAddressWithCity = selectedAddress?.cityId
  const storesNeedCityId = cartItemsByStore.filter(g => !g.storeCityId).map(g => g.storeName)

  useEffect(() => {
    // Inject Midtrans Snap script dynamically
    const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement('script')
      script.src = scriptUrl
      script.setAttribute('data-client-key', clientKey)
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!allShippingSelected) {
      setOrderError('Pilih kurir pengiriman untuk semua toko')
      return
    }
    setOrderError('')

    const formData = new FormData()
    formData.append('addressId', selectedAddressId)
    formData.append('shippingData', JSON.stringify(selectedShipping))

    startTransition(async () => {
      const result = await placeOrderAction(formData)
      if (result?.error) {
        setOrderError(result.error)
      } else if (result?.success && result.token) {
        // Trigger Midtrans Snap
        // @ts-ignore
        window.snap.pay(result.token, {
          onSuccess: function (result: any) {
            window.location.href = '/buyer/orders'
          },
          onPending: function (result: any) {
            window.location.href = '/buyer/orders'
          },
          onError: function (result: any) {
            setOrderError('Pembayaran gagal')
          },
          onClose: function () {
            setOrderError('Anda menutup popup sebelum menyelesaikan pembayaran')
            window.location.href = '/buyer/orders'
          }
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ─── LEFT: Address + Shipping ─── */}
      <div className="lg:col-span-2 flex flex-col gap-6">

        {/* ADDRESS SELECTION */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-[#EE4D2D] rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <h2 className="font-semibold text-gray-800">Alamat Pengiriman</h2>
          </div>
          <div className="p-6">
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">Kamu belum punya alamat tersimpan.</p>
                <a href="/buyer/profile#addresses" className="text-[#EE4D2D] text-sm font-medium hover:underline">
                  + Tambah Alamat Sekarang
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-[#EE4D2D] bg-[#fff9f8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressSelect"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="accent-[#EE4D2D] mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-800">{addr.receiverName}</span>
                        <span className="text-gray-400 text-sm">|</span>
                        <span className="text-sm text-gray-500">{addr.phone}</span>
                        <span className="text-xs border border-gray-300 text-gray-500 px-1.5 py-0.5 rounded">{addr.label}</span>
                        {addr.isPrimary && (
                          <span className="text-xs border border-[#EE4D2D] text-[#EE4D2D] px-1.5 py-0.5 rounded">Utama</span>
                        )}
                        {!addr.cityId && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Perlu Kota (untuk ongkir)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{addr.fullAddress}</p>
                    </div>
                  </label>
                ))}
                <a href="/buyer/profile#addresses" className="text-[#EE4D2D] text-sm hover:underline inline-block mt-1">
                  + Tambah Alamat Baru
                </a>
              </div>
            )}
          </div>
        </div>

        {/* SHIPPING PER STORE */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-[#EE4D2D] rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</div>
            <h2 className="font-semibold text-gray-800">Pilih Pengiriman</h2>
          </div>

          {!hasAddressWithCity && selectedAddress && (
            <div className="mx-6 mt-4 flex items-center gap-2 text-sm bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Alamat yang dipilih belum memiliki data kota. <a href="/buyer/profile#addresses" className="font-semibold underline">Update alamat</a> untuk menghitung ongkos kirim.</span>
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {cartItemsByStore.map(storeGroup => {
              const storeShipping = shippingOptions[storeGroup.storeId] || []
              const isLoading = loadingShipping[storeGroup.storeId]
              const error = shippingError[storeGroup.storeId]
              const selected = selectedShipping[storeGroup.storeId]

              return (
                <div key={storeGroup.storeId} className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-sm text-gray-800">{storeGroup.storeName}</span>
                    <span className="text-xs text-gray-400">({storeGroup.items.length} produk)</span>
                    {!storeGroup.storeCityId && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded">
                        Penjual belum set kota toko
                      </span>
                    )}
                  </div>

                  {/* Product mini list */}
                  <div className="space-y-2 mb-4 pl-2">
                    {storeGroup.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span className="truncate max-w-[260px]">{item.variant.product.name} ({item.variant.name}) x{item.quantity}</span>
                        <span className="font-medium text-gray-800 ml-4 flex-shrink-0">
                          {formatRupiah(Number(item.variant.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping options */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-[#EE4D2D]" />
                      Menghitung ongkos kirim...
                    </div>
                  )}
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />{error}
                    </div>
                  )}
                  {!isLoading && !error && storeShipping.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pilih Kurir:</p>
                      {storeShipping.map(courier =>
                        courier.services.map(svc => {
                          const key = `${courier.courier} ${svc.service}`
                          const isSelected = selected?.courier === key
                          return (
                            <label
                              key={key}
                              className={`flex items-center gap-4 p-3 border rounded-sm cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#EE4D2D] bg-[#fff9f8]'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`shipping_${storeGroup.storeId}`}
                                className="accent-[#EE4D2D] flex-shrink-0"
                                checked={isSelected}
                                onChange={() =>
                                  setSelectedShipping(prev => ({
                                    ...prev,
                                    [storeGroup.storeId]: { courier: key, cost: svc.cost }
                                  }))
                                }
                              />
                              <Truck className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#EE4D2D]' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-800">{courier.courier} {svc.service}</span>
                                  <span className="text-xs text-gray-500">({svc.description})</span>
                                </div>
                                <span className="text-xs text-gray-400">Estimasi {svc.etd}</span>
                              </div>
                              <span className={`font-semibold text-sm flex-shrink-0 ${isSelected ? 'text-[#EE4D2D]' : 'text-gray-700'}`}>
                                {formatRupiah(svc.cost)}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#EE4D2D] flex-shrink-0" />}
                            </label>
                          )
                        })
                      )}
                    </div>
                  )}
                  {!isLoading && !error && storeShipping.length === 0 && hasAddressWithCity && storeGroup.storeCityId && (
                    <div className="text-sm text-gray-400 bg-gray-50 px-4 py-3 rounded-sm">
                      Tidak ada layanan pengiriman tersedia untuk rute ini.
                    </div>
                  )}
                  {!hasAddressWithCity && !isLoading && (
                    <div className="text-sm text-gray-400 bg-gray-50 px-4 py-3 rounded-sm">
                      Pilih alamat dengan data kota untuk melihat ongkos kirim.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Order Summary ─── */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 sticky top-20">
          <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-2">
            <div className="w-5 h-5 bg-[#EE4D2D] rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</div>
            <h2 className="font-semibold text-gray-800">Ringkasan Pesanan</h2>
          </div>
          <div className="p-5 space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal Produk</span>
              <span className="font-medium">{formatRupiah(productTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Ongkos Kirim</span>
              {Object.keys(selectedShipping).length > 0 ? (
                <span className="font-medium text-[#EE4D2D]">{formatRupiah(shippingTotal)}</span>
              ) : (
                <span className="text-gray-400 italic text-xs">Pilih kurir dulu</span>
              )}
            </div>

            {/* Shipping breakdown */}
            {Object.keys(selectedShipping).length > 0 && (
              <div className="pl-3 space-y-1 text-xs text-gray-400 border-l-2 border-gray-100">
                {cartItemsByStore.map(g => {
                  const s = selectedShipping[g.storeId]
                  if (!s) return null
                  return (
                    <div key={g.storeId} className="flex justify-between">
                      <span>{g.storeName} ({s.courier})</span>
                      <span>{formatRupiah(s.cost)}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
              <span>Total Pembayaran</span>
              <span className="text-[#EE4D2D]">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {orderError && (
            <div className="mx-5 mb-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {orderError}
            </div>
          )}

          <div className="px-5 pb-5">
            <button
              type="submit"
              disabled={isPending || !allShippingSelected || !selectedAddressId}
              className="w-full bg-[#EE4D2D] text-white py-3.5 rounded-sm font-semibold hover:bg-[#D73510] transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : (
                'Buat Pesanan'
              )}
            </button>
            {!allShippingSelected && cartItemsByStore.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-2">Pilih kurir untuk semua toko terlebih dahulu</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
