import { getUser } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CartClient from './CartClient'

export const revalidate = 0

export default async function CartPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })
  if (!profile) return <div>Profil tidak valid</div>

  const cart = await prisma.cart.findUnique({
    where: { profileId: profile.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  store: { select: { id: true, name: true } },
                  images: { take: 1 }
                }
              }
            }
          }
        },
        orderBy: { variant: { product: { storeId: 'asc' } } }
      }
    }
  })

  const cartItems = (cart?.items || []).map(item => ({
    id: item.id,
    quantity: item.quantity,
    selected: item.selected,
    variant: {
      id: item.variant.id,
      name: item.variant.name,
      price: Number(item.variant.price),
      stock: item.variant.stock,
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        store: item.variant.product.store,
        images: item.variant.product.images
      }
    }
  }))

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-32">
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-lg font-semibold text-gray-800">Keranjang Belanja</h1>
          {cartItems.length > 0 && (
            <span className="text-sm text-gray-400">({cartItems.length} produk)</span>
          )}
        </div>
        <CartClient initialItems={cartItems} />
      </div>
    </div>
  )
}
