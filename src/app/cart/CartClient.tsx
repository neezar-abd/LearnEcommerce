'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Store, Trash2, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { updateCartItemQty, deleteCartItem, toggleCartItemSelected, selectAllCartItems } from './actions'
import { formatRupiah } from '@/lib/format'

interface CartItemData {
  id: string
  quantity: number
  selected: boolean
  variant: {
    id: string
    name: string
    price: number
    stock: number
    product: {
      id: string
      name: string
      store: { id: string; name: string }
      images: { url: string }[]
    }
  }
}

interface CartClientProps {
  initialItems: CartItemData[]
}
export default function CartClient({ initialItems }: CartClientProps) {
  const [items, setItems] = useState(initialItems)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const setPending = (id: string, pending: boolean) => {
    setPendingIds(prev => {
      const next = new Set(prev)
      pending ? next.add(id) : next.delete(id)
      return next
    })
  }

  const handleQtyChange = (item: CartItemData, delta: number) => {
    const newQty = item.quantity + delta
    if (newQty < 1) {
      handleDelete(item.id)
      return
    }
    if (newQty > item.variant.stock) return

    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i))
    setPending(item.id, true)

    startTransition(async () => {
      await updateCartItemQty(item.id, newQty)
      setPending(item.id, false)
    })
  }

  const handleDelete = (itemId: string) => {
    // Optimistic remove
    setItems(prev => prev.filter(i => i.id !== itemId))
    startTransition(async () => {
      await deleteCartItem(itemId)
    })
  }

  const handleToggleSelected = (item: CartItemData) => {
    const newVal = !item.selected
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, selected: newVal } : i))
    startTransition(async () => {
      await toggleCartItemSelected(item.id, newVal)
    })
  }

  const allSelected = items.length > 0 && items.every(i => i.selected)
  const handleSelectAll = () => {
    const newVal = !allSelected
    setItems(prev => prev.map(i => ({ ...i, selected: newVal })))
    startTransition(async () => {
      await selectAllCartItems(newVal)
    })
  }

  const selectedItems = items.filter(i => i.selected)
  const totalHarga = selectedItems.reduce((acc, i) => acc + Number(i.variant.price) * i.quantity, 0)
  const totalQty = selectedItems.reduce((acc, i) => acc + i.quantity, 0)

  // Group by store
  const storeGroups = items.reduce((acc, item) => {
    const sid = item.variant.product.store.id
    if (!acc[sid]) acc[sid] = { name: item.variant.product.store.name, items: [] }
    acc[sid].items.push(item)
    return acc
  }, {} as Record<string, { name: string; items: CartItemData[] }>)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-16 text-center">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-14 h-14 text-gray-300" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">Keranjang belanjamu kosong</h2>
        <p className="text-gray-500 mb-6">Mungkin ini saat yang tepat untuk mencari produk impianmu!</p>
        <a href="/" className="bg-[#7C3AED] text-white px-10 py-3 rounded-md font-medium inline-block hover:bg-[#6D28D9] transition-all duration-200 active:scale-95 hover:shadow-md shadow-[#7C3AED]/20">
          Mulai Belanja
        </a>
      </div>
    )
  }

  return (
    <>
      {/* HEADER ROW */}
      <div className="bg-white rounded-sm shadow-sm p-4 flex gap-4 text-sm text-gray-500 mb-4 font-medium hidden md:flex">
        <div className="w-[45%] flex gap-4 items-center">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
            checked={allSelected}
            onChange={handleSelectAll}
          />
          <span>Produk</span>
        </div>
        <div className="w-[15%] text-center">Harga Satuan</div>
        <div className="w-[15%] text-center">Kuantitas</div>
        <div className="w-[15%] text-center">Total Harga</div>
        <div className="w-[10%] text-center">Aksi</div>
      </div>

      {/* ITEMS GROUPED BY STORE */}
      <div className="space-y-4">
        {Object.entries(storeGroups).map(([storeId, group]) => {
          const storeAllSelected = group.items.every(i => i.selected)
          const handleStoreSelectAll = () => {
            const newVal = !storeAllSelected
            setItems(prev => prev.map(i =>
              i.variant.product.store.id === storeId ? { ...i, selected: newVal } : i
            ))
            startTransition(async () => {
              await Promise.all(group.items.map(i => toggleCartItemSelected(i.id, newVal)))
            })
          }

          return (
            <div key={storeId} className="bg-white rounded-sm shadow-sm">
              {/* Store Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
                  checked={storeAllSelected}
                  onChange={handleStoreSelectAll}
                />
                <Store className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-sm text-gray-800">{group.name}</span>
              </div>

              {/* Items */}
              {group.items.map(item => (
                <div key={item.id} className={`p-4 flex flex-col md:flex-row md:items-center border-b border-gray-50 last:border-0 transition-all duration-300 hover:bg-gray-50 ${pendingIds.has(item.id) ? 'opacity-60' : ''}`}>

                  {/* Mobile Top Row: Checkbox, Image, Info */}
                  <div className="w-full md:w-[45%] flex gap-3 md:gap-4 items-start">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#7C3AED] mt-2 cursor-pointer flex-shrink-0"
                      checked={item.selected}
                      onChange={() => handleToggleSelected(item)}
                    />
                    <div className="w-20 h-20 bg-gray-100 border border-gray-200 relative flex-shrink-0 rounded-sm overflow-hidden">
                      <Image
                        src={item.variant.product.images[0]?.url || 'https://via.placeholder.com/80'}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={`/product/${item.variant.product.id}`} className="text-sm text-gray-800 hover:text-[#7C3AED] line-clamp-2 leading-tight md:leading-relaxed">
                        {item.variant.product.name}
                      </a>
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 mt-1 md:mt-2 rounded border border-gray-100 inline-block">
                        Variasi: {item.variant.name}
                      </div>
                      {item.variant.stock <= 5 && (
                        <div className="text-xs text-orange-500 mt-1">Sisa {item.variant.stock} stok</div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Price - Hidden on mobile, shown in bottom row instead */}
                  <div className="hidden md:block w-[15%] text-center text-sm text-gray-700">
                    {formatRupiah(Number(item.variant.price))}
                  </div>

                  {/* Mobile Bottom Row: Price, Qty, Total, Delete */}
                  <div className="w-full md:w-auto flex-1 flex flex-row items-center justify-between mt-4 md:mt-0 ml-7 md:ml-0 gap-2 md:gap-0">
                    
                    {/* Price on mobile, hidden on desktop */}
                    <div className="md:hidden text-sm text-[#7C3AED] font-medium">
                      {formatRupiah(Number(item.variant.price))}
                    </div>

                    {/* Quantity */}
                    <div className="md:w-[15%] flex justify-center md:flex-none">
                      <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden h-7 md:h-8">
                        <button
                          onClick={() => handleQtyChange(item, -1)}
                          disabled={pendingIds.has(item.id)}
                          className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all active:scale-95 border-r border-gray-300 disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="w-8 md:w-10 text-center text-xs md:text-sm font-medium text-gray-800 bg-white">
                          {pendingIds.has(item.id) ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
                        </div>
                        <button
                          onClick={() => handleQtyChange(item, +1)}
                          disabled={pendingIds.has(item.id) || item.quantity >= item.variant.stock}
                          className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all active:scale-95 border-l border-gray-300 disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Total - Hidden on mobile */}
                    <div className="hidden md:block w-[15%] text-center text-sm font-semibold text-[#7C3AED]">
                      {formatRupiah(Number(item.variant.price) * item.quantity)}
                    </div>

                    {/* Delete */}
                    <div className="md:w-[10%] text-center ml-2 md:ml-0">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-90 flex items-center justify-center text-sm p-2 rounded-full"
                      >
                        <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* FIXED CHECKOUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-between">
          <div className="flex items-center justify-between w-full md:w-auto md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
                checked={allSelected}
                onChange={handleSelectAll}
              />
              Pilih Semua ({items.length})
            </label>
            <button
              onClick={() => {
                const toDelete = items.filter(i => i.selected).map(i => i.id)
                setItems(prev => prev.filter(i => !i.selected))
                startTransition(async () => {
                  await Promise.all(toDelete.map(id => deleteCartItem(id)))
                })
              }}
              className="text-sm text-gray-500 hover:text-red-500 transition"
              disabled={selectedItems.length === 0}
            >
              Hapus Terpilih
            </button>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto md:gap-6 pt-2 md:pt-0 border-t md:border-0 border-gray-100">
            <div className="text-sm text-gray-700 flex flex-col items-start md:items-end">
              <div className="text-xs md:text-sm">Total ({totalQty} produk):</div>
              <div className="text-[#7C3AED] font-bold text-lg md:text-2xl transition-all leading-none">{formatRupiah(totalHarga)}</div>
            </div>
            <a
              href="/checkout"
              className={`bg-[#7C3AED] text-white px-8 md:px-12 py-2.5 md:py-3.5 rounded-lg font-medium hover:bg-[#6D28D9] text-base md:text-lg text-center shadow-md shadow-[#7C3AED]/20 transition-all duration-200 active:scale-95 ${
                selectedItems.length === 0 ? 'pointer-events-none !bg-gray-300 shadow-none' : ''
              }`}
            >
              Checkout ({selectedItems.length})
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
