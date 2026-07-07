'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { calculateShippingPromo, FREE_SHIPPING_CONFIG } from '@/lib/shipping-promo'

// Called from the checkout page form submission
// shippingData: JSON string of { storeId: { courier: "JNE REG", cost: 15000 } }
export async function placeOrderAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Harap login terlebih dahulu' }

  const addressId = formData.get('addressId') as string
  const shippingDataRaw = formData.get('shippingData') as string

  if (!addressId) return { error: 'Pilih alamat pengiriman terlebih dahulu' }
  if (!shippingDataRaw) return { error: 'Pilih kurir untuk setiap toko terlebih dahulu' }

  let shippingData: Record<string, { courier: string; cost: number }> = {}
  try {
    shippingData = JSON.parse(shippingDataRaw)
  } catch {
    return { error: 'Data pengiriman tidak valid' }
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        cart: {
          include: {
            items: {
              where: { selected: true },
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
        addresses: { where: { id: addressId } }
      }
    })

    if (!profile?.cart?.items?.length) return { error: 'Keranjang belanja kosong' }
    if (!profile.addresses.length) return { error: 'Alamat tidak valid' }

    const address = profile.addresses[0]
    const items = profile.cart.items

    // Group items by store
    const groupedByStore = items.reduce((acc, item) => {
      const storeId = item.variant.product.storeId
      if (!acc[storeId]) acc[storeId] = []
      acc[storeId].push(item)
      return acc
    }, {} as Record<string, typeof items>)

    // Validate all stores have shipping selected
    for (const storeId of Object.keys(groupedByStore)) {
      if (!shippingData[storeId]) {
        return { error: 'Pilih kurir pengiriman untuk semua toko' }
      }
    }

    // Check stock for all items
    for (const item of items) {
      if (item.quantity > item.variant.stock) {
        return { error: `Stok tidak cukup: ${item.variant.product.name} (tersisa ${item.variant.stock})` }
      }
    }

    // Calculate total
    const productTotal = items.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0)
    
    // Hitung promo gratis ongkir per toko
    const subsidyByStore: Record<string, number> = {}
    let totalSubsidy = 0

    for (const storeId of Object.keys(groupedByStore)) {
      const storeItems = groupedByStore[storeId]
      const storeSubtotal = storeItems.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0)
      const shipping = shippingData[storeId]
      const store = storeItems[0]?.variant.product.store
      const buyerAddress = address as any

      if (shipping && store) {
        const promo = calculateShippingPromo({
          subtotal: storeSubtotal,
          shippingCost: shipping.cost,
          buyerProvince: buyerAddress.province || '',
          sellerProvince: store.province || '',
        })
        subsidyByStore[storeId] = promo.subsidyAmount
        totalSubsidy += promo.subsidyAmount
        // Override shipping cost: buyer hanya bayar sisa
        shippingData[storeId] = { ...shipping, cost: promo.buyerPays }
      }
    }

    const shippingTotal = Object.values(shippingData).reduce((acc, s) => acc + s.cost, 0)
    const totalAmount = productTotal + shippingTotal

    let createdTransactionId = ''
    let snapToken = ''

    await prisma.$transaction(async (tx) => {
      // Create Transaction (parent)
      const transaction = await tx.transaction.create({
        data: {
          profileId: profile.id,
          totalAmount,
          paymentStatus: 'PENDING',
          paymentMethod: 'PENDING'
        }
      })
      createdTransactionId = transaction.id

      // Create Order per store
      for (const storeId of Object.keys(groupedByStore)) {
        const storeItems = groupedByStore[storeId]
        const storeSubtotal = storeItems.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0)
        const shipping = shippingData[storeId]
        const platformFee = Math.round(storeSubtotal * FREE_SHIPPING_CONFIG.PLATFORM_COMMISSION)
        const subsidy = subsidyByStore[storeId] || 0

        await tx.order.create({
          data: {
            transactionId: transaction.id,
            storeId,
            addressId: address.id,
            subtotal: storeSubtotal,
            shippingCourier: shipping.courier,
            shippingCost: shipping.cost,
            shippingSubsidy: subsidy,
            platformFee: platformFee,
            status: 'UNPAID',
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

        // Decrement stock safely
        for (const item of storeItems) {
          const updatedVariant = await tx.productVariant.update({
            where: { id: item.variant.id },
            data: { stock: { decrement: item.quantity } }
          })
          
          if (updatedVariant.stock < 0) {
            throw new Error(`Stok produk "${item.variant.product.name}" habis terjual saat proses pembayaran. Silakan coba lagi.`)
          }
        }
      }

      // Clear checked-out cart items
      await tx.cartItem.deleteMany({
        where: { id: { in: items.map(i => i.id) } }
      })
    })

    // Request Snap Token from Midtrans
    const parameter = {
      transaction_details: {
        order_id: createdTransactionId,
        gross_amount: totalAmount
      },
      customer_details: {
        first_name: profile.name,
        email: profile.id + '@user.com', // fallback email if not retrieved
        phone: profile.phone || '08123456789'
      }
    }

    try {
      const { snap } = await import('@/lib/midtrans')
      const midtransResponse = await snap.createTransaction(parameter)
      snapToken = midtransResponse.token

      // Save token to db
      await prisma.transaction.update({
        where: { id: createdTransactionId },
        data: { paymentToken: snapToken }
      })

    } catch (midtransError: any) {
      console.error('Midtrans Error:', midtransError)
      return { error: 'Gagal membuat token pembayaran: ' + midtransError.message }
    }

    revalidatePath('/cart')
    return { success: true, token: snapToken }

  } catch (error: any) {
    console.error('Place order error:', error)
    return { error: 'Terjadi kesalahan saat membuat pesanan: ' + error.message }
  }
}
