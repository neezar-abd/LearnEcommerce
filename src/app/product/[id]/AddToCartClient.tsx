'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { addToCart } from '@/app/actions/cart'
import { useRouter } from 'next/navigation'
import WishlistButton from '@/components/WishlistButton'

interface Variant {
  id: string;
  name: string;
  price: number | any;
  stock: number;
}

export default function AddToCartClient({ variants, productId, productName }: { variants: Variant[], productId: string, productName: string }) {
  const router = useRouter()
  // Set varian pertama sebagai default terpilih
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0])
  const [quantity, setQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

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

  return (
    <>
      <div className="bg-[#f8f8f8] px-4 py-5 mb-6 flex items-center">
         <span className="text-3xl font-medium text-[#EE4D2D]">{formatRupiah(Number(selectedVariant.price))}</span>
      </div>

      <div className="flex flex-col gap-6 mb-8 text-sm">
        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0">
          <span className="md:w-24 text-gray-500 md:mt-2">Varian</span>
          <div className="flex flex-wrap gap-2 flex-1">
            {variants.map((v) => (
              <button 
                key={v.id} 
                onClick={() => {
                  setSelectedVariant(v)
                  setQuantity(1) // Reset qty pas ganti varian
                }}
                disabled={v.stock === 0}
                className={`border px-4 py-2 rounded-sm transition-colors ${
                  selectedVariant.id === v.id 
                    ? 'border-[#EE4D2D] text-[#EE4D2D]' 
                    : 'border-gray-300 hover:border-[#EE4D2D] hover:text-[#EE4D2D] bg-white '
                } ${v.stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 line-through' : ''}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
          <span className="md:w-24 text-gray-500">Kuantitas</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-sm">
              <button onClick={handleDecrease} className="px-3 py-1 border-r border-gray-300 hover:bg-gray-50 w-8 md:w-auto">-</button>
              <input 
                type="text" 
                value={quantity} 
                readOnly 
                className="w-12 text-center outline-none bg-white" 
              />
              <button onClick={handleIncrease} className="px-3 py-1 border-l border-gray-300 hover:bg-gray-50 w-8 md:w-auto">+</button>
            </div>
            <span className="text-gray-500">Tersisa {selectedVariant.stock} buah</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto flex-wrap">
        <button 
          onClick={handleAddToCart}
          disabled={isLoading || selectedVariant.stock === 0}
          className="flex-1 md:flex-none border border-[#EE4D2D] bg-[#FFEEEE] text-[#EE4D2D] px-6 py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-[#FFDEDE] disabled:opacity-50"
        >
          <ShoppingCart className="w-5 h-5" />
          {isLoading ? 'Menambahkan...' : 'Masukkan Keranjang'}
        </button>
        <button disabled={selectedVariant.stock === 0} className="flex-1 md:flex-none bg-[#EE4D2D] text-white px-10 py-3 rounded-sm hover:bg-[#D73510] disabled:opacity-50">
          Beli Sekarang
        </button>
        <WishlistButton productId={productId} productName={productName} />
      </div>
    </>
  )
}
