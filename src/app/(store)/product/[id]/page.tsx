import { notFound } from 'next/navigation'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { ShoppingCart, Store as StoreIcon, Star, CheckCircle } from 'lucide-react'
import AddToCartClient from './AddToCartClient'
import ChatSellerButton from './ChatSellerButton'
import { formatRupiah } from '@/lib/format'

export const revalidate = 0

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  // 1. Fetch data dari DB
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      store: true,
      category: true,
      images: true,
      variants: true,
      reviews: true
    },
  })

  // 2. Kalau barang gak ketemu, lempar halaman 404 Next.js
  if (!product) {
    notFound()
  }



  // Cari rentang harga termurah - termahal (karena 1 produk bs banyak varian ukuran/warna)
  const prices = product.variants.map(v => Number(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay = minPrice === maxPrice 
    ? formatRupiah(minPrice) 
    : `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;

  const totalStock = product.variants.reduce((acc, curr) => acc + curr.stock, 0);

  // Kalkulasi total rating dari db
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews > 0 
    ? (product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      {/* BERBREADCRUMB */}
      <div className="max-w-[1200px] mx-auto px-4 py-4 text-sm text-gray-500">
        LokaBeli &gt; {product.category.name} &gt; <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-2">
          
          {/* KIRI - FOTO PRODUK */}
          <div className="w-full lg:w-[32%] flex flex-col gap-3">
            <div className="aspect-square relative flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
               {product.images.length > 0 ? (
                 <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
               ) : (
                 <ShoppingCart className="w-32 h-32 text-gray-200" />
               )}
            </div>
            
            {/* THUMBNAIL */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.slice(0, 5).map((img, i) => (
                  <div key={img.id} className={`w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${i === 0 ? 'border-[#7C3AED]' : 'border-transparent hover:border-gray-300'}`}>
                    <Image src={img.url} alt={`Thumb ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TENGAH - INFO DETAIL */}
          <div className="w-full lg:w-[40%] flex flex-col">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-3 text-sm mb-3">
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="font-semibold text-gray-700">{averageRating} <span className="text-gray-400 font-normal">({totalReviews} ulasan)</span></span>
              </div>
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-3">
              {formatRupiah(Number(product.variants[0]?.price) || 0)}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#FAF5FF] text-[#7C3AED] px-2 py-1 rounded-sm text-xs font-semibold">Kondisi: Baik</span>
              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-sm text-xs font-semibold">Stok: {totalStock}</span>
            </div>

            <hr className="border-gray-200 mb-5" />

            {/* DETAIL KATEGORI */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Detail Produk</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-gray-500">Kategori</div>
                <div className="text-[#7C3AED] font-medium text-right md:text-left">{product.category.name}</div>
              </div>
            </div>

            <hr className="border-gray-200 mb-5" />

            {/* DESKRIPSI PRODUK */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Deskripsi Produk</h3>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>

            <hr className="border-gray-200 mb-5" />

            {/* ULASAN PRODUK */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Ulasan Pembeli ({totalReviews})</h3>
              {product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{review.comment || <em className="text-gray-400 text-xs">Tanpa komentar</em>}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Belum ada ulasan untuk produk ini.</div>
              )}
            </div>

            <hr className="border-gray-200 mb-5" />

            {/* STORE INFO MINI */}
            <div className="flex items-center justify-between mt-2 mb-8 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                   <StoreIcon className="w-5 h-5 text-gray-400" />
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <h4 className="font-semibold text-gray-900 text-sm">{product.store.name}</h4>
                     <span className="bg-[#7C3AED] text-white text-[10px] px-1 py-0.5 rounded-sm font-bold leading-none">Verified</span>
                   </div>
                   <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     Bandung
                   </div>
                 </div>
              </div>
              <button className="border border-[#7C3AED] text-[#7C3AED] px-4 py-1.5 rounded-3xl text-xs font-semibold hover:bg-[#FAF5FF] transition-colors">
                Kunjungi Toko
              </button>
            </div>
          </div>

          {/* KANAN - ATUR JUMLAH (STICKY BOX) */}
          <div className="w-full lg:w-[28%]">
            <div className="sticky top-24">
              <AddToCartClient variants={product.variants.map(v => ({ id: v.id, name: v.name, price: Number(v.price), stock: v.stock }))} productId={product.id} productName={product.name} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}