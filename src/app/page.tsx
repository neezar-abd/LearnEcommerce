import Image from "next/image";
import { createClient } from '@/utils/supabase/server';
import { 
  Tv, Laptop, Smartphone, Shirt, Footprints, Briefcase, Glasses, 
  Watch, Pill, Guitar, Utensils, Sparkles, Search, ShoppingCart
} from 'lucide-react';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';

export const revalidate = 0; // Disable caching for now to see immediate DB changes

const iconMap: Record<string, any> = {
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

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

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
        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full md:w-2/3 h-[150px] md:h-auto md:max-h-[235px] overflow-hidden rounded-sm bg-white shadow-sm border border-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" 
              alt="Promo Banner Main" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-2 md:max-h-[235px]">
            <div className="h-[100px] md:h-1/2 overflow-hidden rounded-sm bg-white shadow-sm border border-gray-200 flex-1">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" 
                alt="Promo 1" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-[100px] md:h-1/2 overflow-hidden rounded-sm bg-white shadow-sm border border-gray-200 flex-1">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" 
                alt="Promo 2" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Kategori Section */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200">
          <div className="border-b border-gray-100 p-4">
            <h2 className="text-gray-500 font-medium">KATEGORI </h2>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-6 border-l border-t border-gray-100 custom-scrollbar">
            {categories.map((cat) => (
              <a href={`/?categoryId=${cat.id}`} key={cat.id} className={`flex-none w-[100px] md:w-auto border-r border-b border-gray-100 p-3 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-shadow bg-white z-10 h-32 ${categoryFilter === cat.id ? 'bg-gray-50 border-b-2 border-b-[#EE4D2D]' : ''}`}>
                <div className="drop-shadow-sm">{cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : <Sparkles className="w-8 h-8 text-gray-400 stroke-1" />}</div>
                <span className={`text-[12px] text-center leading-tight line-clamp-2 ${categoryFilter === cat.id ? 'text-[#EE4D2D] font-medium' : 'text-gray-700'}`}>{cat.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Produk Rekomendasi Section */}
        <div className="pt-4">
          <div className="bg-white p-4 border-b-4 border-[#EE4D2D] sticky top-0 z-10 mb-2 flex items-center justify-between">
            <h2 className="text-[#EE4D2D] font-medium uppercase tracking-wide">Produk Terbaru</h2>
            {totalCount > 0 && (
              <span className="text-xs text-gray-400">{totalCount} produk ditemukan</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {products.length > 0 ? products.map((product) => (
               <a href={`/product/${product.id}`} key={product.id} className="bg-white hover:border-[#EE4D2D] border border-transparent shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer rounded-sm overflow-hidden flex flex-col h-full block">
                <div className="aspect-square bg-white w-full relative overflow-hidden shrink-0 border-b border-gray-100">
                  <img src={product.images[0]?.url || 'https://via.placeholder.com/300'} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                  {product.store && (
                    <div className="absolute top-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                      {product.store.name}
                    </div>
                  )}
                </div>
                <div className="p-2 flex flex-col flex-1">
                  <h3 className="text-[13px] text-gray-800 leading-snug line-clamp-2 mb-2">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[#EE4D2D] font-medium">
                      {formatRupiah(Number(product.variants[0]?.price) || 0)}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Stok: {product.variants[0]?.stock || 0}
                    </span>
                  </div>
                </div>
              </a>
            )) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600">Produk Tidak Ditemukan</h3>
                <p className="text-sm mt-1">Coba gunakan kata kunci lain atau hapus filter kategori.</p>
                <a href="/" className="mt-4 px-6 py-2 bg-[#EE4D2D] text-white rounded-sm hover:bg-[#d74326] transition-colors">Lihat Semua Produk</a>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 pb-8">
              {currentPage > 1 && (
                <a href={buildPageUrl(currentPage - 1)} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-sm text-sm hover:border-[#EE4D2D] hover:text-[#EE4D2D] transition-colors shadow-sm">
                  &laquo; Sebelumnya
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - currentPage) <= 2)
                .map(p => (
                  <a
                    key={p}
                    href={buildPageUrl(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-sm text-sm border shadow-sm transition-colors ${
                      p === currentPage
                        ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] font-semibold'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              {currentPage < totalPages && (
                <a href={buildPageUrl(currentPage + 1)} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-sm text-sm hover:border-[#EE4D2D] hover:text-[#EE4D2D] transition-colors shadow-sm">
                  Selanjutnya &raquo;
                </a>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-[#EE4D2D] mt-12 pt-12 pb-6 px-4">
         <div className="text-center text-sm text-gray-500">
            <p>&copy; 2026 UchinagaStore. Belanja Mudah, Aman, dan Cepat.</p>
         </div>
      </footer>
    </div>
  );
}
