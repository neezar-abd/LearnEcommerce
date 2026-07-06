'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import useSWR from 'swr'
import { formatRupiah } from '@/lib/format'
import Link from 'next/link'

interface WishlistProductCardProps {
  id: string
  name: string
  imageUrl: string
  price: number
  storeName: string
}

export default function WishlistPageClient() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlistIds(ids)
  }, [])

  const fetcher = (url: string) => fetch(url).then(r => r.json())

  const { data: products = [], isLoading, mutate } = useSWR<WishlistProductCardProps[]>(
    wishlistIds.length > 0 ? `/api/products/batch?ids=${wishlistIds.join(',')}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const removeFromWishlist = (productId: string) => {
    const updated = wishlistIds.filter(id => id !== productId)
    setWishlistIds(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
    mutate(products.filter(p => p.id !== productId), false) // Optimistic SWR mutation
  }


  if (isLoading && wishlistIds.length > 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-sm border border-gray-100 animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (wishlistIds.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-16 text-center">
        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">Wishlist Kamu Masih Kosong</h2>
        <p className="text-sm text-gray-500 mb-6">Tambahkan produk yang kamu suka ke wishlist!</p>
        <Link href="/" className="bg-[#7C3AED] text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-[#6D28D9] transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md inline-block">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-16 text-center">
        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700">Produk tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mt-2">Produk di wishlist kamu mungkin sudah tidak tersedia.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
          <Link href={`/product/${product.id}`} className="block">
            <div className="aspect-square bg-gray-50 relative overflow-hidden">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.storeName && (
                <div className="absolute top-0 left-0 bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                  {product.storeName}
                </div>
              )}
            </div>
          </Link>
          <div className="p-3 flex flex-col flex-1">
            <Link href={`/product/${product.id}`}>
              <h3 className="text-[13px] text-gray-800 line-clamp-2 leading-snug hover:text-[#7C3AED] transition">{product.name}</h3>
            </Link>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="text-[#7C3AED] font-medium text-sm">{formatRupiah(product.price)}</span>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="text-[#7C3AED] hover:scale-110 active:scale-90 transition-all duration-200 p-1"
                title="Hapus dari wishlist"
              >
                <Heart className="w-4 h-4 fill-[#7C3AED]" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
