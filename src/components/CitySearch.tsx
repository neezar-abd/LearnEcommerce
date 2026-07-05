'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin } from 'lucide-react'

interface City {
  city_id: string
  type: string
  city_name: string
  province: string
  postal_code: string
}

interface CitySearchProps {
  name: string
  defaultValue?: string
  defaultLabel?: string
  placeholder?: string
  required?: boolean
}

export default function CitySearch({ name, defaultValue, defaultLabel, placeholder, required }: CitySearchProps) {
  const [query, setQuery] = useState(defaultLabel || '')
  const [results, setResults] = useState<City[]>([])
  const [selectedId, setSelectedId] = useState(defaultValue || '')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    setSelectedId('') // reset when typing
    setSelectedProvince('')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/shipping/cities?q=${encodeURIComponent(value)}`)
        const data: City[] = await res.json()
        setResults(data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  const handleSelect = (city: City) => {
    setSelectedId(city.city_id)
    setSelectedProvince(city.province)
    // city_name is already formatted as "Subdistrict, District, City" from our API
    setQuery(`${city.city_name}, ${city.province} ${city.postal_code}`)
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input that submits the actual city_id and province */}
      <input type="hidden" name={name} value={selectedId} />
      <input type="hidden" name={`${name}_province`} value={selectedProvince} />

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder || 'Cari nama kota...'}
          required={required && !selectedId}
          className="w-full border border-gray-300 rounded-sm px-3 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED]"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {selectedId && (
        <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
          <MapPin className="w-3 h-3" />
          <span>ID Kota: {selectedId} ✓</span>
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg max-h-52 overflow-y-auto text-sm">
          {results.map(city => (
            <li
              key={city.city_id}
              onClick={() => handleSelect(city)}
              className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <div className="font-medium text-gray-800">{city.city_name}</div>
              <div className="text-xs text-gray-400">{city.province} — Kode Pos: {city.postal_code}</div>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg px-3 py-3 text-sm text-gray-400">
          Kota tidak ditemukan. Coba kata kunci lain.
        </div>
      )}
    </div>
  )
}
