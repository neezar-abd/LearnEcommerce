import { getUser } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CheckoutClient from './CheckoutClient'
import Link from 'next/link'

export const revalidate = 0

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      addresses: { orderBy: { isPrimary: 'desc' } },
      cart: {
        include: {
          items: {
            where: { selected: true },
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      store: {
                        select: { id: true, name: true, cityId: true, province: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!profile) redirect('/login')

  // Redirect to cart if nothing selected
  if (!profile.cart?.items?.length) redirect('/cart')

  // Group items by store for the shipping calculator
  const itemsGroupedByStore = profile.cart.items.reduce(
    (acc, item) => {
      const store = item.variant.product.store
      
      // Clean up item payload to remove Decimal objects
      const cleanItem = {
        id: item.id,
        quantity: item.quantity,
        variantId: item.variant.id,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          price: Number(item.variant.price),
          product: {
            id: item.variant.product.id,
            name: item.variant.product.name,
            weight: item.variant.product.weight,
            store: {
              id: store.id,
              name: store.name,
              cityId: store.cityId,
              province: store.province ?? null
            }
          }
        }
      }

      const existing = acc.find(g => g.storeId === store.id)
      if (existing) {
        existing.items.push(cleanItem as any)
      } else {
        acc.push({
            storeId: store.id,
            storeName: store.name,
            storeCityId: store.cityId,
            storeProvince: store.province ?? null,
            items: [cleanItem as any]
          })
      }
      return acc
    },
    [] as { storeId: string; storeName: string; storeCityId: string | null; storeProvince: string | null; items: any[] }[]
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#7C3AED]">Beranda</Link>
          <span>&gt;</span>
          <Link href="/cart" className="hover:text-[#7C3AED]">Keranjang</Link>
          <span>&gt;</span>
          <span className="text-gray-800 font-medium">Checkout</span>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
          <span className="text-sm text-gray-400">
            {profile.cart.items.length} produk dipilih
          </span>
        </div>

        <CheckoutClient
          addresses={profile.addresses.map(a => ({
            id: a.id,
            label: a.label,
            receiverName: a.receiverName,
            phone: a.phone,
            fullAddress: a.fullAddress,
            isPrimary: a.isPrimary,
            cityId: a.cityId,
            province: (a as any).province ?? null
          }))}
          cartItemsByStore={itemsGroupedByStore}
        />
      </div>
    </div>
  )
}
