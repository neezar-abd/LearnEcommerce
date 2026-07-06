'use client'

import { deleteProductAction } from '@/app/seller/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProductTableActions({ productId }: { productId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan.')) {
      setIsDeleting(true)
      await deleteProductAction(productId)
      setIsDeleting(false)
      // Udah di revalidate dari server action sebenernya
    }
  }

  const handleEdit = () => {
    // Kita arahin ke form edit (nanti kita buat halamannya)
    router.push(`/seller/edit-product/${productId}`)
  }

  return (
    <div className="flex items-center justify-end md:justify-end gap-4 text-[#7C3AED] font-semibold text-xs md:pr-2">
      <button onClick={handleEdit} disabled={isDeleting} className="hover:underline bg-purple-50 px-3 py-1.5 rounded-full">
        Ubah
      </button>
      <button onClick={handleDelete} disabled={isDeleting} className="hover:underline text-red-600 bg-red-50 px-3 py-1.5 rounded-full disabled:opacity-50">
        {isDeleting ? 'Menghapus...' : 'Hapus'}
      </button>
    </div>
  )
}
