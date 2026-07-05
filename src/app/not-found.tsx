import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
          <Search className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-6xl font-bold text-[#7C3AED] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-8">
          Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#7C3AED] text-white px-8 py-3 rounded-sm text-sm font-medium hover:bg-[#6D28D9] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
