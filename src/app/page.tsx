import Image from "next/image";
import { createClient } from '@/utils/supabase/server';
import { 
  Tv, Laptop, Smartphone, Shirt, Footprints, Briefcase, Glasses, 
  Watch, Pill, Guitar, Utensils, Sparkles, Search, ShoppingCart
} from 'lucide-react';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatRupiah } from '@/lib/format';
import Link from 'next/link'



const iconMap: Record<string, React.ReactNode> = {
  Tv: <Tv className="w-8 h-8 text-blue-500 stroke-1" />,
  Laptop: <Laptop className="w-8 h-8 text-gray-700 stroke-1" />,
  Smartphone: <Smartphone className="w-8 h-8 text-gray-800 stroke-1" />,
  Shirt: <Shirt className="w-8 h-8 text-blue-900 stroke-1" />,
  Footprints: <Footprints className="w-8 h-8 text-orange-700 stroke-1" />,
  Briefcase: <Briefcase className="w-8 h-8 text-amber-800 stroke-1" />,
  Glasses: <Glasses className="w-8 h-8 text-pink-600 stroke-1" />,
  Watch: <Watch className="w-8 h-8 text-slate-800 stroke-1" />,
  Pill: <Pill className="w-8 h-8 text-emerald-500 stroke-1" />,
  Guitar: <Guitar className="w-8 h-8 text-red-700 stroke-1" />,
  Utensils: <Utensils className="w-8 h-8 text-orange-500 stroke-1" />,
  Sparkles: <Sparkles className="w-8 h-8 text-fuchsia-500 stroke-1" />
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const ITEMS_PER_PAGE = 24

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { q, categoryId, page } = await searchParams;
  const searchQuery = typeof q === 'string' ? q : undefined;
  const categoryFilter = typeof categoryId === 'string' ? categoryId : undefined;
  const currentPage = typeof page === 'string' ? Math.max(1, parseInt(page)) : 1;
  
  const categories = await prisma.category.findMany();

  // Build "where" filter based on search query and category
  const whereFilter: any = {};
  if (searchQuery) {
    whereFilter.name = { contains: searchQuery, mode: 'insensitive' };
  }
  if (categoryFilter) {
    whereFilter.categoryId = categoryFilter;
  }

  const totalCount = await prisma.product.count({ where: whereFilter });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const products = await prisma.product.findMany({
    where: whereFilter,
    include: { 
      store: true,
      variants: { take: 1 },
      images: { take: 1 }
    },
    orderBy: { createdAt: 'desc' },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });



  // Build pagination URL helper
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (categoryFilter) params.set('categoryId', categoryFilter)
    params.set('page', String(p))
    return `/?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-10">
      <Navbar searchQuery={searchQuery} />

      <main className="max-w-[1200px] mx-auto px-4 mt-8 space-y-6">
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-2/3 h-[180px] md:h-auto md:max-h-[300px] overflow-hidden rounded-2xl shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" 
              alt="Promo Banner Main" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-4 md:max-h-[300px]">
            <div className="h-[120px] md:h-[calc(50%-0.5rem)] overflow-hidden rounded-2xl shadow-sm flex-1">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" 
                alt="Promo 1" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="h-[120px] md:h-[calc(50%-0.5rem)] overflow-hidden rounded-2xl shadow-sm flex-1">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" 
                alt="Promo 2" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Kategori Section */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-semibold text-lg">Kategori Pilihan</h2>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-6 lg:grid-cols-8 gap-4 custom-scrollbar pb-2">
            {categories.map((cat) => (
              <Link href={`/?categoryId=${cat.id}`} key={cat.id} className={`flex-none w-[80px] md:w-auto p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all rounded-xl border border-transparent ${categoryFilter === cat.id ? 'bg-[#FAF5FF] border-[#7C3AED]' : 'hover:bg-gray-50 hover:border-gray-100'}`}>
                <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${categoryFilter === cat.id ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.icon && iconMap[cat.icon] ? (
                    <div className={categoryFilter === cat.id ? '[&>svg]:text-white' : '[&>svg]:text-gray-600'}>
                      {iconMap[cat.icon]}
                    </div>
                  ) : (
                    <Sparkles className="w-6 h-6 stroke-1" />
                  )}
                </div>
                <span className={`text-[12px] text-center leading-tight line-clamp-2 ${categoryFilter === cat.id ? 'text-[#7C3AED] font-bold' : 'text-gray-600'}`}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Produk Rekomendasi Section */}
        <div>
          <div className="flex items-end justify-between mb-4 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Produk Terbaru</h2>
              <div className="w-12 h-1 bg-[#7C3AED] rounded-full mt-1.5"></div>
            </div>
            {totalCount > 0 && (
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{totalCount} produk</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {products.length > 0 ? products.map((product) => (
               <Link href={`/product/${product.id}`} key={product.id} className="bg-white border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer rounded-xl overflow-hidden flex flex-col h-full block pb-2">
                <div className="aspect-square bg-gray-50 w-full relative overflow-hidden shrink-0">
                  <img src={product.images[0]?.url || 'https://via.placeholder.com/300'} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2 flex flex-col flex-1">
                  <h3 className="text-[13px] text-gray-800 mb-0.5 truncate">{product.name}</h3>
                  <div className="text-base font-bold text-gray-900 mb-1.5">
                    {formatRupiah(Number(product.variants[0]?.price) || 0)}
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                      <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span className="text-gray-600 font-medium">Top Rated</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-sm border border-gray-100 shadow-sm mt-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">Maaf, kami tidak dapat menemukan produk yang Anda cari. Coba gunakan kata kunci lain atau kembali berbelanja.</p>
                <Link href="/" className="px-8 py-3 bg-[#7C3AED] text-white rounded-md font-medium hover:bg-[#6D28D9] shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                  Lihat Semua Produk
                </Link>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 pb-8">
              {currentPage > 1 && (
                <Link href={buildPageUrl(currentPage - 1)} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-sm text-sm hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors shadow-sm">
                  &laquo; Sebelumnya
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - currentPage) <= 2)
                .map(p => (
                  <Link
                    key={p}
                    href={buildPageUrl(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-sm text-sm border shadow-sm transition-colors ${
                      p === currentPage
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED] font-semibold'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              {currentPage < totalPages && (
                <Link href={buildPageUrl(currentPage + 1)} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-sm text-sm hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors shadow-sm">
                  Selanjutnya &raquo;
                </Link>
              )}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
