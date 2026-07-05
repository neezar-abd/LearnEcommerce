import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-[#7C3AED] rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
          <span className="text-sm">Memuat halaman...</span>
        </div>
      </div>
    </div>
  )
}
