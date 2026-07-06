'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react'
import { addToCart } from '@/app/actions/cart'
import { useRouter } from 'next/navigation'
import WishlistButton from '@/components/WishlistButton'
import { formatRupiah } from '@/lib/format'

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function AddToCartClient({ variants, productId, productName }: { variants: Variant[], productId: string, productName: string }) {
  const router = useRouter()
  // Set varian pertama sebagai default terpilih
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0])
  const [quantity, setQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false)

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1)
  }

  const handleIncrease = () => {
    if (quantity < selectedVariant.stock) setQuantity(q => q + 1)
  }

  const handleAddToCart = async () => {
    if (selectedVariant.stock < 1) {
      alert("Stok barang ini sedang habis!")
      return
    }

    setIsLoading(true)
    const result = await addToCart(selectedVariant.id, quantity)
    setIsLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      alert('Berhasil ditambahkan ke keranjang! 🛒')
      router.refresh() // merefresh count keranjang di header
    }
  }

  const handleBuyNow = async () => {
    if (selectedVariant.stock < 1) {
      alert("Stok barang ini sedang habis!")
      return
    }

    setIsBuyNowLoading(true)
    const result = await addToCart(selectedVariant.id, quantity)
    setIsBuyNowLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      router.push('/checkout')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Atur Jumlah</h3>
      
      {/* Varian Selection - if there are multiple variants */}
      {variants.length > 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button 
                key={v.id} 
                onClick={() => {
                  setSelectedVariant(v)
                  setQuantity(1)
                }}
                disabled={v.stock === 0}
                className={`border px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedVariant.id === v.id 
                    ? 'border-[#7C3AED] text-[#7C3AED] bg-[#FAF5FF]' 
                    : 'border-gray-300 hover:border-[#7C3AED] hover:text-[#7C3AED] bg-white '
                } ${v.stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 line-through' : ''}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9">
          <button 
            type="button" 
            onClick={handleDecrease} 
            className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="w-10 h-full border-x border-gray-300 flex items-center justify-center">
            <input 
              type="text" 
              value={quantity} 
              readOnly 
              className="w-full text-center outline-none bg-white text-sm text-gray-900 font-medium" 
            />
          </div>
          <button 
            type="button" 
            onClick={handleIncrease} 
            className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-gray-500">Sisa {selectedVariant.stock}</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-500 text-sm">Subtotal</span>
        <span className="text-lg font-bold text-gray-900">{formatRupiah(Number(selectedVariant.price) * quantity)}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mb-4">
        <button 
          type="button"
          onClick={handleAddToCart}
          disabled={isLoading || isBuyNowLoading || selectedVariant.stock === 0}
          className="w-full bg-[#148356] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#116b47] transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="font-bold">+</span> Keranjang</>}
        </button>
        <button 
          type="button"
          onClick={handleBuyNow}
          disabled={isBuyNowLoading || isLoading || selectedVariant.stock === 0}
          className="w-full border border-[#148356] text-[#148356] py-2.5 rounded-lg font-medium text-sm hover:bg-[#FAF5FF] transition-colors disabled:opacity-50"
        >
          {isBuyNowLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Beli Langsung'}
        </button>
      </div>

      {/* Footer Links */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <WishlistButton productId={productId} productName={productName} customClass="text-gray-500 hover:text-gray-800 text-xs flex items-center gap-1.5" />
        <button className="text-gray-500 hover:text-gray-800 text-xs flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          Share
        </button>
      </div>
    </div>
  )
}
