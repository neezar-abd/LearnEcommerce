import { notFound } from 'next/navigation'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { ShoppingCart, Store as StoreIcon, Star, CheckCircle } from 'lucide-react'
import AddToCartClient from './AddToCartClient'
import Navbar from '@/components/Navbar'

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

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

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
      <Navbar />

      {/* BERBREADCRUMB */}
      <div className="max-w-[1200px] mx-auto px-4 py-4 text-sm text-gray-500">
        UchinagaStore &gt; {product.category.name} &gt; <span className="text-gray-800">{product.name}</span>
      </div>

      {/* PRODUCT MAIN CARD */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="bg-white rounded-sm p-4 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          
          {/* KIRI - FOTO PRODUK */}
          <div className="w-full md:w-2/5 flex flex-col gap-4">
            <div className="aspect-square relative flex items-center justify-center bg-gray-50 border border-gray-100 overflow-hidden">
               {product.images.length > 0 ? (
                 <Image src={product.images[0].url} alt={product.name} fill className="object-contain" />
               ) : (
                 <ShoppingCart className="w-32 h-32 text-gray-200" />
               )}
            </div>
            
            {/* THUMBNAIL (Opsional) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.slice(0, 5).map((img, i) => (
                <div key={img.id} className={`w-20 h-20 relative flex-shrink-0 border-2 cursor-pointer ${i === 0 ? 'border-[#EE4D2D]' : 'border-transparent hover:border-[#EE4D2D]'}`}>
                  <Image src={img.url} alt={`Thumb ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* KANAN - INFO DETAIL */}
          <div className="w-full md:w-3/5 flex flex-col">
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center text-[#EE4D2D]">
                <span className="font-semibold underline underline-offset-4 mr-1">{averageRating}</span>
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="border-l border-gray-300 h-4"></span>
              <div className="text-gray-500"><span className="text-gray-900 border-b border-gray-900">{totalReviews}</span> Penilaian</div>
              <span className="border-l border-gray-300 h-4"></span>
              <div className="text-gray-500"><span className="text-gray-900">100+</span> Terjual</div>
            </div>

            {/* KOMPONEN INTERAKTIF PILIH VARIAN, QTY & TOMBOL KERANJANG */}
            <AddToCartClient variants={product.variants.map(v => ({ id: v.id, name: v.name, price: Number(v.price), stock: v.stock }))} productId={product.id} productName={product.name} />

            <div className="mt-8 border-t border-gray-100 pt-4 flex gap-4 text-sm text-gray-600">
               <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-[#EE4D2D]" /> 100% Ori</div>
               <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-[#EE4D2D]" /> Garansi Shopee</div>
            </div>

          </div>
        </div>

        {/* TOKO SECTION */}
        <div className="bg-white rounded-sm p-6 mt-4 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
             <StoreIcon className="w-8 h-8 text-gray-500" />
           </div>
           <div className="flex-1">
             <h3 className="font-medium text-lg text-gray-800">{product.store.name}</h3>
             <p className="text-sm text-gray-500">{product.store.description}</p>
             <div className="mt-2 flex gap-2">
               <button className="border border-[#EE4D2D] text-[#EE4D2D] px-3 py-1 rounded-sm text-xs bg-[#FFEEEE] flex items-center gap-1">
                 <StoreIcon className="w-3 h-3" /> Kunjungi Toko
               </button>
             </div>
           </div>
           <div className="hidden md:flex gap-8 text-sm text-gray-500 pl-8 border-l border-gray-200">
             <div className="flex flex-col gap-2">
               <span>Penilaian: <span className="text-[#EE4D2D]">284RB</span></span>
               <span>Produk: <span className="text-[#EE4D2D]">136</span></span>
             </div>
             <div className="flex flex-col gap-2">
               <span>Waktu Chat Dibalas: <span className="text-[#EE4D2D]">Hitungan Jam</span></span>
               <span>Pengikut: <span className="text-[#EE4D2D]">1.2JT</span></span>
             </div>
           </div>
        </div>

        {/* DETAIL & SPESIFIKASI */}
        <div className="bg-white rounded-sm p-6 md:p-8 mt-4 shadow-sm mb-10 text-sm">
           <div className="bg-gray-50 p-4 mb-4 font-medium text-lg uppercase text-gray-800 rounded-sm">
             Spesifikasi Produk
           </div>
           <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-y-2 md:gap-y-4 text-gray-700 md:pl-4 mb-10">
             <div className="text-gray-500 text-xs md:text-sm">Kategori</div><div className="mb-2 md:mb-0">UchinagaStore &gt; {product.category.name}</div>
             <div className="text-gray-500 text-xs md:text-sm">Stok</div><div className="mb-2 md:mb-0">{totalStock}</div>
             <div className="text-gray-500 text-xs md:text-sm">Dikirim Dari</div><div className="mb-2 md:mb-0">KOTA JAKARTA PUSAT - KEMAYORAN, DKI JAKARTA, ID</div>
           </div>

           <div className="bg-gray-50 p-4 mb-4 font-medium text-lg uppercase text-gray-800 rounded-sm">
             Deskripsi Produk
           </div>
           <div className="pl-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
             {product.description}
           </div>
        </div>

        {/* SECTION ULASAN PEMBELI */}
        <div className="bg-white rounded-sm p-6 md:p-8 mt-4 shadow-sm mb-10 text-sm">
           <div className="font-medium text-lg uppercase text-gray-800 mb-6">
             Penilaian Produk
           </div>
           <div className="flex gap-6 items-center p-6 bg-[#fffbf8] border border-[#f9ede5] rounded-sm mb-6">
             <div className="text-center">
               <div className="text-[#EE4D2D] text-3xl font-medium"><span className="text-4xl">{averageRating}</span> dari 5</div>
               <div className="flex justify-center text-[#EE4D2D] mt-1">
                 <Star className="w-5 h-5 fill-current" />
               </div>
             </div>
           </div>

           {product.reviews.length === 0 ? (
             <div className="text-center py-10 text-gray-500">Belum ada penilaian untuk produk ini.</div>
           ) : (
             <div className="divide-y divide-gray-100">
               {product.reviews.map((review) => (
                 <div key={review.id} className="py-4 flex gap-4">
                   <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 font-bold">
                     U
                   </div>
                   <div>
                     <div className="mb-1 text-xs">Penikmat Belanja</div>
                     <div className="flex text-[#EE4D2D] mb-2">
                       {Array.from({ length: review.rating }).map((_, i) => (
                         <Star key={i} className="w-3 h-3 fill-current" />
                       ))}
                     </div>
                     <div className="text-gray-500 text-xs mb-3">{new Date(review.createdAt).toLocaleDateString('id-ID')}</div>
                     <div className="text-gray-800 text-sm">{review.comment || 'Telah memberikan penilaian bintang ' + review.rating}</div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  )
}