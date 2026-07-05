'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createBiteshipOrder, parseCourierString } from '@/lib/biteship'

// ─────────────────────────────────────────────
// Update status order (manual flow)
// ─────────────────────────────────────────────
export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const status = formData.get('status') as string
  const trackingNumber = formData.get('trackingNumber') as string | null

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { store: { select: { id: true } } }
  })

  if (!profile?.store) throw new Error('Store not found')

  const order = await prisma.order.findUnique({ where: { id: orderId } })

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

// ─────────────────────────────────────────────
// Generate Resi Otomatis via Biteship
// (Dipanggil seller dari halaman orders saat status PACKING)
// ─────────────────────────────────────────────
export async function generateResiAction(orderId: string): Promise<{ success?: boolean; awb?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Ambil data order + store + address buyer + items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      store: {
        include: { profile: true }
      },
      address: true,
      orderItems: true,
    }
  })

  if (!order) return { error: 'Order tidak ditemukan' }

  // Validasi kepemilikan
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { store: { select: { id: true } } }
  })
  if (!profile?.store || order.storeId !== profile.store.id) {
    return { error: 'Unauthorized' }
  }

  // Cek sudah ada resi belum
  if (order.trackingNumber) {
    return { error: 'Resi sudah dibuat: ' + order.trackingNumber }
  }

  // Validasi data seller
  if (!order.store.cityId) {
    return { error: 'Seller belum mengatur kota toko. Update di menu Pengaturan Toko.' }
  }
  if (!order.address.cityId) {
    return { error: 'Alamat pembeli tidak memiliki data kota untuk pengiriman.' }
  }
  if (!order.shippingCourier) {
    return { error: 'Data kurir tidak ditemukan di order ini.' }
  }

  try {
    const { company, type } = parseCourierString(order.shippingCourier)

    // Hitung total berat & nilai (ambil dari order items)
    const totalWeight = Math.max(1000, order.orderItems.length * 500) // default 500g per item, min 1kg
    const totalValue = Number(order.subtotal)

    const itemNames = order.orderItems.map(i => `${i.productName} x${i.quantity}`).join(', ')

    // Seller (origin) - pakai profile seller untuk nama & phone
    const sellerProfile = order.store.profile
    
    const biteshipResult = await createBiteshipOrder({
      // Origin = Seller
      originName: sellerProfile.name || order.store.name,
      originPhone: sellerProfile.phone || '08123456789',
      originAddress: `${order.store.name} - Harap hubungi seller untuk alamat lengkap`,
      originPostalCode: order.store.cityId, // Komerce city ID sebagai referensi
      
      // Destination = Buyer
      destName: order.address.receiverName,
      destPhone: order.address.phone,
      destAddress: order.address.fullAddress,
      destPostalCode: order.address.postalCode || order.address.cityId || '10000',
      
      // Courier
      courierCompany: company,
      courierType: type,
      courierInsurance: totalValue > 500000 ? totalValue : 0,
      
      // Parcel
      weightGrams: totalWeight,
      itemName: itemNames.substring(0, 100),
      itemQty: order.orderItems.reduce((acc, i) => acc + i.quantity, 0),
      itemValue: totalValue,
      
      referenceId: order.id,
    })

    // Simpan AWB + Biteship Order ID ke database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: biteshipResult.waybill_id,
        biteshipOrderId: biteshipResult.id,
        status: 'SHIPPED',
      }
    })

    revalidatePath('/seller/orders')
    return { success: true, awb: biteshipResult.waybill_id }

  } catch (err: any) {
    console.error('Biteship generate resi error:', err)
    return { error: err.message || 'Gagal membuat resi otomatis' }
  }
}