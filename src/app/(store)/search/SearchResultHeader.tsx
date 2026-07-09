'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Info, Store as StoreIcon } from 'lucide-react'
import Link from 'next/link'

interface SearchResultHeaderProps {
  query: string
  totalCount: number
  matchedStore?: { id: string, name: string, logoUrl?: string | null, _count: { products: number } } | null
}

export default function SearchResultHeader({ query, totalCount, matchedStore }: SearchResultHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'terkait'

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === 'terkait') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    params.delete('page') // reset page
    router.push(`/search?${params.toString()}`)
  }

  const TABS = [
    { id: 'terkait', label: 'Terkait' },
    { id: 'terbaru', label: 'Terbaru' },
    { id: 'terlaris', label: 'Terlaris' },
  ]

  return (
    <div className="mb-4">
      {/* Toko Berkaitan */}
      {matchedStore && (
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              {matchedStore.logoUrl ? (
                <img src={matchedStore.logoUrl} alt={matchedStore.name} className="w-full h-full object-cover" />
              ) : (
                <StoreIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Toko berkaitan dengan "{query}"</div>
              <h2 className="text-lg font-bold text-gray-800">{matchedStore.name}</h2>
              <div className="text-sm text-gray-500">{matchedStore._count.products} Produk</div>
            </div>
          </div>
          <Link href={`/store/${matchedStore.id}`} className="px-6 py-2 bg-white border border-[#EE4D2D] text-[#EE4D2D] hover:bg-red-50 rounded-sm font-medium transition-colors">
            Kunjungi Toko
          </Link>
        </div>
      )}

      {/* Query Header */}
      {query && (
        <div className="flex items-center gap-2 mb-4 text-gray-700 text-lg">
          <Info className="w-5 h-5 text-gray-400" />
          <span>Hasil pencarian untuk '<strong className="text-[#EE4D2D] font-medium">{query}</strong>'</span>
        </div>
      )}

      {/* Sorting Tabs */}
      <div className="bg-gray-100 rounded-sm p-3 flex flex-wrap items-center gap-4 text-sm mt-4">
        <span className="text-gray-600 mr-2 hidden md:block">Urutkan</span>
        <div className="flex items-center bg-white rounded-sm overflow-hidden shadow-sm flex-1 md:flex-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => updateSort(tab.id)}
              className={`px-6 py-2 border-r border-gray-100 last:border-0 flex-1 md:flex-none transition-colors ${
                currentSort === tab.id
                  ? 'bg-[#EE4D2D] text-white font-medium'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Total info on the right */}
        <div className="ml-auto text-gray-500 text-sm hidden md:block">
          <span className="text-[#EE4D2D] font-medium">{totalCount}</span> produk ditemukan
        </div>
      </div>
    </div>
  )
}
