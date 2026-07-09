'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, MapPin, Tag } from 'lucide-react'

interface SearchFilterSidebarProps {
  categories: { id: string; name: string }[]
  provinces: string[]
}

export default function SearchFilterSidebar({ categories, provinces }: SearchFilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get('categoryId') || ''
  const currentProvince = searchParams.get('province') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  
  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page to 1 when filters change
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')
    
    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')
    
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm h-fit sticky top-24 hidden md:block border border-gray-100">
      <div className="flex items-center gap-2 font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100 uppercase text-sm">
        <Filter className="w-4 h-4" />
        Filter
      </div>

      {/* Lokasi */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3 text-sm flex items-center gap-2">
           Lokasi
        </h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
          {provinces.map(prov => (
            <label key={prov} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={currentProvince === prov}
                onChange={() => updateFilters('province', currentProvince === prov ? '' : prov)}
                className="w-4 h-4 text-[#7C3AED] border-gray-300 rounded focus:ring-[#7C3AED] cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-[#7C3AED] transition-colors">{prov}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Kategori */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3 text-sm flex items-center gap-2">
           Kategori
        </h3>
        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={currentCategory === cat.id}
                onChange={() => updateFilters('categoryId', currentCategory === cat.id ? '' : cat.id)}
                className="w-4 h-4 text-[#7C3AED] border-gray-300 rounded focus:ring-[#7C3AED] cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-[#7C3AED] transition-colors line-clamp-1">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rentang Harga */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 mb-3 text-sm flex items-center gap-2">
           Rentang Harga
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" 
            placeholder="Rp MIN" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-sm outline-none focus:border-[#7C3AED] hide-arrows"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Rp MAKS" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-sm outline-none focus:border-[#7C3AED] hide-arrows"
          />
        </div>
        <button 
          onClick={handlePriceApply}
          className="w-full py-2 bg-[#7C3AED] text-white text-xs font-semibold rounded-sm hover:bg-[#6D28D9] transition-colors uppercase"
        >
          Terapkan
        </button>
      </div>
      
    </div>
  )
}
