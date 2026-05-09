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
    <div className="col-span-2 flex items-center justify-end gap-3 text-[#2673dd] font-medium text-xs pr-2">
      <button onClick={handleEdit} disabled={isDeleting} className="hover:underline">
        Ubah
      </button>
      <button onClick={handleDelete} disabled={isDeleting} className="hover:underline hover:text-red-600 disabled:opacity-50">
        {isDeleting ? 'Menghapus...' : 'Hapus'}
      </button>
    </div>
  )
}
