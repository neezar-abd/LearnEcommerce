import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Store, ArrowLeft } from 'lucide-react'
import { updateProductAction } from '../../actions'

export const revalidate = 0

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true }
  })
  if (!profile?.store) redirect('/seller')

  // Find existing product matching the user's store
  const product = await prisma.product.findFirst({
    where: { 
      id: params.id,
      storeId: profile.store.id
    },
    include: {
      variants: true,
      images: true,
      category: true
    }
  })

  // Security layer: Ensure product exists and belongs to the seller
  if (!product) {
    redirect('/seller')
  }

  const categories = await prisma.category.findMany()

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col">
      <header className="bg-white shadow-sm h-14 flex items-center px-6 sticky top-0 z-20 gap-4">
        <a href="/seller" className="text-gray-500 hover:text-[#EE4D2D] transition"><ArrowLeft className="w-5 h-5"/></a>
        <div className="flex items-center gap-2 text-[#EE4D2D]">
          <Store className="w-5 h-5" />
          <span className="font-medium text-lg tracking-tight">Seller Centre</span>
        </div>
        <span className="border-l pl-4 border-gray-300 text-gray-700 font-medium">Ubah Produk</span>
      </header>

      <div className="p-6 max-w-4xl mx-auto w-full mt-4">
        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Informasi Produk</h2>
          </div>
          
          <form action={updateProductAction} className="p-6 space-y-6">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="variantId" value={product.variants[0]?.id} />
            
            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-700 pt-2 text-right">Nama Produk</label>
              <input type="text" name="name" defaultValue={product.name} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white" />
            </div>

            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-700 pt-2 text-right">Kategori</label>
              <select name="categoryId" defaultValue={product.categoryId} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-700 pt-2 text-right">Harga</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">Rp</span>
                <input type="number" name="price" defaultValue={product.variants[0]?.price?.toString()} min={0} required className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-700 pt-2 text-right">Stok Produk</label>
              <input type="number" name="stock" defaultValue={product.variants[0]?.stock} min={0} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white" />
            </div>

            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-700 pt-2 text-right">Deskripsi</label>
              <textarea name="description" defaultValue={product.description} rows={5} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#EE4D2D] text-gray-900 bg-white resize-none" />
            </div>

            <div className="grid grid-cols-[200px_1fr] items-start gap-4 pb-6">
              <div></div>
              <div className="flex gap-4">
                 <button type="submit" className="bg-[#EE4D2D] px-8 py-2 text-white font-medium rounded-sm shadow hover:bg-[#D73510] transition">Simpan Perubahan</button>
                 <a href="/seller" className="px-8 py-2 text-gray-600 font-medium border border-gray-300 rounded-sm hover:bg-gray-50 transition">Batal</a>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
