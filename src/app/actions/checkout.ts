'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function processCheckout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Harap login terlebih dahulu' }
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        cart: {
          include: {
            items: {
              where: { selected: true }, // Ambil yang dicentang aja
              include: {
                variant: {
                  include: {
                    product: {
                      include: { store: true }
                    }
                  }
                }
              }
            }
          }
        },
        addresses: true
      }
    })

    if (!profile || !profile.cart || profile.cart.items.length === 0) {
      return { error: 'Keranjang belanja kosong' }
    }

    const items = profile.cart.items

    // 1. Cek Cukup Stok Dulu
    for (const item of items) {
      if (item.quantity > item.variant.stock) {
        return { error: `Stok tidak cukup untuk produk: ${item.variant.product.name} (Sisa: ${item.variant.stock})` }
      }
    }

    // 2. Siapkan Alamat Pengiriman (Buat Dummy jika belum punya karena schema wajib address)
    let defaultAddress = profile.addresses.find(a => a.isPrimary) || profile.addresses[0]
    if (!defaultAddress) {
      defaultAddress = await prisma.address.create({
        data: {
          profileId: profile.id,
          label: 'Rumah',
          receiverName: profile.name,
          phone: profile.phone || '0800000000',
          fullAddress: 'Jl. Dummy Order No. 1, Jakarta',
          isPrimary: true
        }
      })
    }

    // 3. Hitung Grand Total Transaksi
    const totalAmount = items.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0)

    // Gunakan transaksi database untuk memastikan semua sukses atau rollback barengan
    await prisma.$transaction(async (tx) => {
      // 4. Buat Transaction Data (Midtrans Parent)
      const transaction = await tx.transaction.create({
        data: {
          profileId: profile.id,
          totalAmount: totalAmount,
          paymentStatus: 'PAID', // Simulasi langsung bayar aja biar gampang liat flow nya
          paymentMethod: 'DUMMY_WALLET'
        }
      })

      // 5. Kelompokkan Items berdasarkan StoreID (Karena Order dibagi per toko)
      const groupedByStore = items.reduce((acc, item) => {
        const storeId = item.variant.product.storeId
        if (!acc[storeId]) acc[storeId] = []
        acc[storeId].push(item)
        return acc
      }, {} as Record<string, typeof items>)

      // 6. Buat Order & OrderItem untuk masing-masing Toko
      for (const storeId in groupedByStore) {
        const storeItems = groupedByStore[storeId]
        const storeSubtotal = storeItems.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0)

        const order = await tx.order.create({
          data: {
            transactionId: transaction.id,
            storeId: storeId,
            addressId: defaultAddress.id,
            subtotal: storeSubtotal,
            status: 'PACKING', // Langsung masuk status dikemas karena ceritanya langsung lunas
            shippingCost: 10000, // Ongkir dummy
            orderItems: {
              create: storeItems.map(item => ({
                variantId: item.variant.id,
                productName: item.variant.product.name,
                variantName: item.variant.name,
                price: item.variant.price,
                quantity: item.quantity
              }))
            }
          }
        })

        // 7. Potong Stok Varian
        for (const item of storeItems) {
          await tx.productVariant.update({
            where: { id: item.variant.id },
            data: { stock: { decrement: item.quantity } }
          })
        }
      }

      // 8. Hapus Cart Item yang sudah dicheckout
      await tx.cartItem.deleteMany({
        where: {
          id: { in: items.map(item => item.id) }
        }
      })
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return { error: 'Terjadi kesalahan sistem saat checkout' }
  }

  // Clear cache dan arahkan ke daftar pesanan
  revalidatePath('/cart')
  revalidatePath('/buyer/orders')
  redirect('/buyer/orders')
}
