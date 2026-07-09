import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import SearchFilterSidebar from './SearchFilterSidebar'
import SearchResultHeader from './SearchResultHeader'
import { Search } from 'lucide-react'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const ITEMS_PER_PAGE = 24

const getCachedCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ['all-categories-search'],
  { revalidate: 3600 }
)

const getCachedProvinces = unstable_cache(
  async () => {
    // Get unique provinces from stores
    const stores = await prisma.store.findMany({
      where: { province: { not: null } },
      select: { province: true },
      distinct: ['province']
    })
    return stores.map(s => s.province as string).filter(Boolean).sort()
  },
  ['all-provinces-search'],
  { revalidate: 3600 * 24 }
)

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, categoryId, minPrice, maxPrice, province, sort, page } = await searchParams;
  
  const query = typeof q === 'string' ? q : '';
  const currentCategory = typeof categoryId === 'string' ? categoryId : undefined;
  const currentProvince = typeof province === 'string' ? province : undefined;
  const currentSort = typeof sort === 'string' ? sort : 'terkait';
  const currentPage = typeof page === 'string' ? Math.max(1, parseInt(page)) : 1;
  
  const minPriceNum = typeof minPrice === 'string' && minPrice ? parseInt(minPrice) : undefined;
  const maxPriceNum = typeof maxPrice === 'string' && maxPrice ? parseInt(maxPrice) : undefined;

  // Build Prisma Where
  const whereFilter: any = { isActive: true };
  
  if (query) {
    whereFilter.name = { contains: query, mode: 'insensitive' };
  }
  
  if (currentCategory) {
    whereFilter.categoryId = currentCategory;
  }
  
  if (currentProvince) {
    whereFilter.store = {
      ...(whereFilter.store || {}),
      province: currentProvince
    }
  }

  if (minPriceNum !== undefined || maxPriceNum !== undefined) {
    whereFilter.variants = {
      some: {
        price: {
          ...(minPriceNum !== undefined ? { gte: minPriceNum } : {}),
          ...(maxPriceNum !== undefined ? { lte: maxPriceNum } : {}),
        }
      }
    }
  }

  // Build Prisma Order By
  let orderByQuery: any = {};
  if (currentSort === 'terbaru') {
    orderByQuery = { createdAt: 'desc' };
  } else if (currentSort === 'terlaris') {
    // Proxy for best selling since we don't have soldCount field directly on product.
    orderByQuery = { reviews: { _count: 'desc' } };
  } else {
    // Terkait (default)
    orderByQuery = { createdAt: 'desc' }; // fallback since full-text search sorting is complex
  }

  // Run Queries
  const [categories, provinces, totalCount, products, matchedStore] = await Promise.all([
    getCachedCategories(),
    getCachedProvinces(),
    prisma.product.count({ where: whereFilter }),
    prisma.product.findMany({
      where: whereFilter,
      include: { 
        store: { select: { name: true, province: true, cityId: true } },
        variants: { take: 1, orderBy: { price: 'asc' } },
        images: { take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } }
      },
      orderBy: orderByQuery,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
    }),
    // Match exact store name if query exists
    query ? prisma.store.findFirst({
      where: { name: { equals: query, mode: 'insensitive' } },
      select: { id: true, name: true, logoUrl: true, _count: { select: { products: true } } }
    }) : null
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Build pagination URL helper
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (currentCategory) params.set('categoryId', currentCategory)
    if (currentProvince) params.set('province', currentProvince)
    if (minPriceNum) params.set('minPrice', String(minPriceNum))
    if (maxPriceNum) params.set('maxPrice', String(maxPriceNum))
    if (currentSort !== 'terkait') params.set('sort', currentSort)
    params.set('page', String(p))
    return `/search?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-10 pt-4">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar (Left) */}
        <div className="w-full md:w-64 flex-shrink-0">
           <SearchFilterSidebar 
              categories={categories} 
              provinces={provinces}
           />
        </div>

        {/* Main Content (Right) */}
        <div className="flex-1 min-w-0">
          <SearchResultHeader 
            query={query} 
            totalCount={totalCount} 
            matchedStore={matchedStore} 
          />

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((product) => (
                   <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-2 pb-8">
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
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-sm border border-gray-100 shadow-sm mt-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">Maaf, tidak ada produk yang sesuai dengan filter atau kata kunci Anda.</p>
              <Link href="/" className="px-8 py-3 bg-[#7C3AED] text-white rounded-md font-medium hover:bg-[#6D28D9] shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                Kembali ke Beranda
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
