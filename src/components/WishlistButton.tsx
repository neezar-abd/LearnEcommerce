'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WishlistButtonProps {
  productId: string
  productName: string
  customClass?: string
}

export default function WishlistButton({ productId, productName, customClass }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const wishlist: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setIsWishlisted(wishlist.includes(productId))
  }, [productId])

  const toggle = () => {
    const wishlist: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]')
    let updated: string[]

    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId)
      setIsWishlisted(false)
    } else {
      updated = [...wishlist, productId]
      setIsWishlisted(true)
    }

    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  return (
    <button
      onClick={toggle}
      title={isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
      className={customClass ? customClass : `flex items-center gap-2 border rounded-sm px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        isWishlisted
          ? 'bg-red-50 border-[#7C3AED] text-[#7C3AED]'
          : 'bg-white border-gray-300 text-gray-600 hover:border-[#7C3AED] hover:text-[#7C3AED]'
      }`}
    >
      <Heart className={`w-4 h-4 transition-all ${isWishlisted ? 'fill-[#7C3AED] text-[#7C3AED]' : ''}`} />
      {isWishlisted ? 'Diwishlist' : 'Wishlist'}
    </button>
  )
}
