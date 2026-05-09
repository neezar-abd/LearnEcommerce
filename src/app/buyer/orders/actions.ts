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

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' }
  })

  // We should also transfer funds to store wallet here in real apps!
  
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