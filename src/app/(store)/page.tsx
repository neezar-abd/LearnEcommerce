import Image from "next/image";
import { createClient } from '@/utils/supabase/server';
import { 
  Tv, Laptop, Smartphone, Shirt, Footprints, Briefcase, Glasses, 
  Watch, Pill, Guitar, Utensils, Sparkles, Search, ShoppingCart
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatRupiah } from '@/lib/format';
import Link from 'next/link'
import { unstable_cache } from 'next/cache';
import ProductCard from '@/components/ProductCard';

const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      take: 8,
      orderBy: [
        { products: { _count: 'desc' } },
        { name: 'asc' }
      ]
    });
  },
  ['categories-list'],
  { revalidate: 3600 }
);



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
  
  // Build "where" filter based on search query and category
  const whereFilter: any = {};
  if (searchQuery) {
    whereFilter.name = { contains: searchQuery, mode: 'insensitive' };
  }
  if (categoryFilter) {
    whereFilter.categoryId = categoryFilter;
  }

  const [categories, products] = await Promise.all([
    getCachedCategories(),
    prisma.product.findMany({
      where: { isActive: true },
      include: { 
        store: true,
        variants: { take: 1 },
        images: { take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
    })
  ]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-10">
      <main className="max-w-[1200px] mx-auto px-4 mt-8 space-y-6">
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-2/3 h-[180px] md:h-[300px] overflow-hidden rounded-2xl shadow-sm relative">
            <Image 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" 
              alt="Promo Banner Main" 
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
          <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-4 h-[120px] md:h-[300px]">
            <div className="h-full md:h-[calc(50%-0.5rem)] overflow-hidden rounded-2xl shadow-sm flex-1 relative">
              <Image 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" 
                alt="Promo 1" 
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="h-full md:h-[calc(50%-0.5rem)] overflow-hidden rounded-2xl shadow-sm flex-1 relative">
              <Image 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" 
                alt="Promo 2" 
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
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
              <Link href={`/search?categoryId=${cat.id}`} key={cat.id} className={`flex-none w-[80px] md:w-auto p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all rounded-xl border border-transparent hover:bg-gray-50 hover:border-gray-100`}>
                <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors bg-gray-100 text-gray-500`}>
                  {cat.icon && iconMap[cat.icon] ? (
                    <div className={'[&>svg]:text-gray-600'}>
                      {iconMap[cat.icon]}
                    </div>
                  ) : (
                    <Sparkles className="w-6 h-6 stroke-1" />
                  )}
                </div>
                <span className={`text-[12px] text-center leading-tight line-clamp-2 text-gray-600`}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Produk Rekomendasi Section */}
        <div>
          <div className="flex items-end justify-between mb-4 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Rekomendasi Terbaru</h2>
              <div className="w-12 h-1 bg-[#EE4D2D] rounded-full mt-1.5"></div>
            </div>
            <Link href="/search" className="text-sm font-medium text-[#EE4D2D] hover:underline">Lihat Semua</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {products.length > 0 ? products.map((product) => (
               <ProductCard key={product.id} product={product as any} />
            )) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-sm border border-gray-100 shadow-sm mt-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Produk</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">Saat ini belum ada produk yang tersedia. Silakan kembali lagi nanti.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      </div>
  );
}
