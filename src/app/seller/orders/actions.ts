'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const status = formData.get('status') as string
  const trackingNumber = formData.get('trackingNumber') as string | null

  // Ensure this user owns the store
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { store: { select: { id: true } } }
  })

  if (!profile?.store) throw new Error('Store not found')

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order || order.storeId !== profile.store.id) {
    throw new Error('Order not found or unauthorized')
  }

  const updateData: any = { status }
  if (trackingNumber) {
    updateData.trackingNumber = trackingNumber
  }

  await prisma.order.update({
    where: { id: orderId },
    data: updateData
  })

  revalidatePath('/seller/orders')
}