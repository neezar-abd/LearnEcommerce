'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateCartItemQty(itemId: string, newQty: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (newQty < 1) {
    await deleteCartItem(itemId)
    return
  }

  // Verify ownership
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, include: { cart: true } })
  if (!profile?.cart) return

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: profile.cart.id } })
  if (!item) return

  // Check stock
  const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } })
  if (!variant || newQty > variant.stock) return

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: newQty } })
  revalidatePath('/cart')
}

export async function deleteCartItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, include: { cart: true } })
  if (!profile?.cart) return

  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: profile.cart.id } })
  revalidatePath('/cart')
}

export async function toggleCartItemSelected(itemId: string, selected: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, include: { cart: true } })
  if (!profile?.cart) return

  await prisma.cartItem.updateMany({ where: { id: itemId, cartId: profile.cart.id }, data: { selected } })
  revalidatePath('/cart')
}

export async function selectAllCartItems(selected: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, include: { cart: true } })
  if (!profile?.cart) return

  await prisma.cartItem.updateMany({ where: { cartId: profile.cart.id }, data: { selected } })
  revalidatePath('/cart')
}
