'use client'

import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SearchInput() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <input 
      type="text" 
      name="q"
      defaultValue={query}
      placeholder="Cari buku bekas, novel..." 
      className="w-full px-3 py-2 text-sm text-gray-800 outline-none"
    />
  )
}

export default function SearchBar() {
  return (
    <form action="/" method="GET" className="flex items-center w-full bg-white border border-gray-300 rounded-md overflow-hidden focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] focus-within:shadow-md transition-all duration-300">
      <div className="pl-3 text-gray-400">
        <Search className="w-5 h-5" />
      </div>
      <Suspense fallback={<input type="text" placeholder="Loading..." className="w-full px-3 py-2 text-sm text-gray-800 outline-none" disabled />}>
        <SearchInput />
      </Suspense>
    </form>
  )
}
