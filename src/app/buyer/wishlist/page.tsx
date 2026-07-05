import Navbar from '@/components/Navbar'
import { Heart } from 'lucide-react'
import WishlistPageClient from './WishlistPageClient'

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-5 h-5 text-[#7C3AED] fill-[#7C3AED]" />
          <h1 className="text-lg font-semibold text-gray-800">Wishlist Saya</h1>
        </div>

        <WishlistPageClient />
      </div>
    </div>
  )
}
