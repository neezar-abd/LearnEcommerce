import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CheckoutClient from './CheckoutClient'

export const revalidate = 0

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
                        select: { id: true, name: true, cityId: true }
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
              cityId: store.cityId
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
          items: [cleanItem as any]
        })
      }
      return acc
    },
    [] as { storeId: string; storeName: string; storeCityId: string | null; items: any[] }[]
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-[#EE4D2D]">Beranda</a>
          <span>&gt;</span>
          <a href="/cart" className="hover:text-[#EE4D2D]">Keranjang</a>
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
            cityId: a.cityId
          }))}
          cartItemsByStore={itemsGroupedByStore}
        />
      </div>
    </div>
  )
}
