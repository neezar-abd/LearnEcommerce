'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

interface WishlistProductCardProps {
  id: string
  name: string
  imageUrl: string
  price: number
  storeName: string
}

export default function WishlistPageClient() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [products, setProducts] = useState<WishlistProductCardProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlistIds(ids)

    if (ids.length === 0) {
      setLoading(false)
      return
    }

    // Fetch product details from our API
    fetch(`/api/products/batch?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const removeFromWishlist = (productId: string) => {
    const updated = wishlistIds.filter(id => id !== productId)
    setWishlistIds(updated)
    setProducts(prev => prev.filter(p => p.id !== productId))
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  if (loading) {
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
        <a href="/" className="bg-[#EE4D2D] text-white px-8 py-2.5 rounded-sm text-sm font-medium hover:bg-[#D73510] transition inline-block">
          Mulai Belanja
        </a>
      </div>
    )
  }

  if (products.length === 0 && !loading) {
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
        <div key={product.id} className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden flex flex-col">
          <a href={`/product/${product.id}`} className="block">
            <div className="aspect-square bg-gray-50 relative overflow-hidden">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.storeName && (
                <div className="absolute top-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                  {product.storeName}
                </div>
              )}
            </div>
          </a>
          <div className="p-3 flex flex-col flex-1">
            <a href={`/product/${product.id}`}>
              <h3 className="text-[13px] text-gray-800 line-clamp-2 leading-snug hover:text-[#EE4D2D] transition">{product.name}</h3>
            </a>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="text-[#EE4D2D] font-medium text-sm">{formatRupiah(product.price)}</span>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="text-[#EE4D2D] hover:scale-110 transition-transform"
                title="Hapus dari wishlist"
              >
                <Heart className="w-4 h-4 fill-[#EE4D2D]" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
