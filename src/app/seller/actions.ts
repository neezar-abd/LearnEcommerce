'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function createStoreAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    throw new Error("Profile not found")
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const cityId = formData.get('cityId') as string | null
  const province = formData.get('cityId_province') as string | null
  
  // Generate a unique domain slug from the store name
  const domain = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000)

  await prisma.store.create({
    data: {
      profileId: profile.id,
      name,
      description,
      domain,
      cityId: cityId || null,
      province: province || null
    }
  })

  revalidatePath('/seller')
  redirect('/seller')
}

export async function updateStoreCityAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cityId = formData.get('cityId') as string
  const province = formData.get('cityId_province') as string | null
  if (!cityId) return

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true }
  })
  if (!profile?.store) return

  await prisma.store.update({
    where: { id: profile.store.id },
    data: { cityId, province: province || null }
  })

  revalidatePath('/seller')
}

export async function addProductAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true }
  })

  if (!profile?.store) {
    throw new Error("Store not found")
  }

  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0
  const weight = parseInt(formData.get('weight') as string) || 1000
  
  // Proses Upload Gambar Asli ke Folder Local (/public/uploads)
  const image = formData.get('image') as File | null
  let imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' // Default / Fallback

  if (image && image.size > 0) {
    try {
      const buffer = Buffer.from(await image.arrayBuffer())
      // Bersihin nama file dari spasi dan karakter aneh biar aman
      const safeName = image.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
      const fileName = `${Date.now()}-${safeName}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      await mkdir(uploadDir, { recursive: true })
      await writeFile(path.join(uploadDir, fileName), buffer)
      
      imageUrl = `/uploads/${fileName}`
    } catch (err) {
      console.error("Gagal nyimpen gambar:", err)
    }
  }

  // Generate SLUG wajib untuk Prisma schema
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      categoryId,
      storeId: profile.store.id,
      weight,
      variants: {
        create: {
          name: "Default (Satu Ukuran/Warna)",
          price,
          stock
        }
      },
      images: {
        create: {
          url: imageUrl
        }
      }
    }
  })

  revalidatePath('/seller')
  revalidatePath('/') // Revalidate homepage biar produk baru nongol
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true }
  })

  // Prevent hacking: only allow if store owns the product
  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (product && profile?.store && product.storeId === profile.store.id) {
    await prisma.product.delete({
      where: { id: productId }
    })
  }

  revalidatePath('/seller')
  revalidatePath('/')
}

export async function updateProductAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true }
  })

  const productId = formData.get('productId') as string
  const variantId = formData.get('variantId') as string
  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0

  // Pastikan product ini milik seller yg sedang login
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.storeId !== profile?.store?.id) {
    throw new Error("Unauthorized to edit this product")
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      categoryId,
      description
    }
  })

  if (variantId) {
    await prisma.productVariant.updateMany({
      where: { id: variantId, productId: productId },
      data: { price, stock }
    })
  }

  revalidatePath('/seller')
  revalidatePath(`/product/${productId}`)
  revalidatePath('/')
  redirect('/seller')
}