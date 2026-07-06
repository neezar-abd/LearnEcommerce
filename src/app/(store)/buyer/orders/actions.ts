'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function completeOrderAction(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })
  if (!profile) throw new Error('Profile not found')

  const order = await prisma.order.findUnique({
    where: { id: orderId, transaction: { profileId: profile.id } }
  })

  if (!order || order.status !== 'SHIPPED') {
    throw new Error('Order not found or cannot be completed yet')
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' }
    })

    // 2. Transfer funds to store wallet
    // Calculate earnings (subtotal minus platform fee)
    // Shipping is assumed cashless (paid to courier by platform)
    const earnings = Number(order.subtotal) - Number(order.platformFee)

    // Upsert wallet just in case store doesn't have one yet
    const wallet = await tx.storeWallet.upsert({
      where: { storeId: order.storeId },
      create: { storeId: order.storeId, balance: earnings },
      update: { balance: { increment: earnings } }
    })

    // 3. Create ledger entry
    await tx.walletLedger.create({
      data: {
        storeWalletId: wallet.id,
        amount: earnings,
        type: 'ORDER_COMPLETED',
        description: `Penjualan pesanan #${order.id.split('-')[0].toUpperCase()}`,
        referenceId: order.id
      }
    })
  })
  
  revalidatePath('/buyer/orders')
}

export async function submitReviewAction(orderItemId: string, productId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })
  if (!profile) throw new Error('Profile not found')

  const comment = formData.get('comment') as string
  const rating = Number(formData.get('rating')) || 5

  await prisma.productReview.create({
    data: {
      productId,
      profileId: profile.id,
      orderItemId,
      rating,
      comment
    }
  })

  revalidatePath('/buyer/orders')
  revalidatePath(`/product/${productId}`)
}

export async function simulatePaymentSuccessAction(transactionId: string) {
  // DEV ONLY: Simulates a successful midtrans payment
  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: { paymentStatus: 'PAID' }
    })
    
    await tx.order.updateMany({
      where: { transactionId },
      data: { status: 'PACKING' }
    })
  })

  revalidatePath('/buyer/orders')
}