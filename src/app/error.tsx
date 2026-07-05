'use client'

import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#7C3AED]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-[#7C3AED] text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-[#6D28D9] transition-colors"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  )
}
