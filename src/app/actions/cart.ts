'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Silakan login terlebih dahulu' }
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return { error: 'Profil tidak ditemukan' }
    }

    // 1. Cari atau Buat Keranjang Belanja untuk user ini
    let cart = await prisma.cart.findUnique({
      where: { profileId: profile.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { profileId: profile.id }
      })
    }

    // 2. Cek apakah barang (varian spesifik) udah ada di keranjang
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: variantId
      }
    })

    if (existingItem) {
      // Kalau udah ada, tambahin aja jumlahnya (quantity)
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      // Kalau belum ada, buat item baru di keranjang
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variantId,
          quantity: quantity
        }
      })
    }

    // Revalidate data di frontend
    revalidatePath('/product/[id]')
    revalidatePath('/cart')
    
    return { success: true }
  } catch (error) {
    console.error('Add to Cart Error:', error)
    return { error: 'Terjadi kesalahan saat menambahkan ke keranjang' }
  }
}
