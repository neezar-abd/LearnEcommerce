// /api/payment/webhook/route.ts
// Handler untuk Midtrans Payment Notification Webhook

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { createBiteshipOrder, parseCourierString } from '@/lib/biteship'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body

    // ─────────────────────────────────────────────
    // 1. Verifikasi signature Midtrans (keamanan)
    // ─────────────────────────────────────────────
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`
    const expectedSignature = crypto.createHash('sha512').update(rawString).digest('hex')

    if (signature_key !== expectedSignature) {
      console.error('Invalid Midtrans signature!')
      return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
    }

    // ─────────────────────────────────────────────
    // 2. Tentukan status berdasarkan response Midtrans
    // ─────────────────────────────────────────────
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept')

    const isPending = transaction_status === 'pending'
    const isFailed =
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'

    // ─────────────────────────────────────────────
    // 3. Update Transaction di database
    // ─────────────────────────────────────────────
    const transaction = await prisma.transaction.findUnique({
      where: { id: order_id },
      include: { orders: { include: { store: true } } }
    })

    if (!transaction) {
      console.error('Transaction not found:', order_id)
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    if (isSuccess) {
      // Update transaction status
      await prisma.transaction.update({
        where: { id: order_id },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: payment_type || 'UNKNOWN',
        }
      })

      // Update semua order di dalam transaksi ini → PACKING (siap diproses seller)
      await prisma.order.updateMany({
        where: { transactionId: order_id },
        data: { status: 'PACKING' }
      })

      console.log(`✅ Payment PAID for transaction: ${order_id}`)
      
      // Auto-create shipment via Biteship
      const ordersToShip = await prisma.order.findMany({
        where: { transactionId: order_id },
        include: {
          store: { include: { profile: true } },
          address: true,
          orderItems: true
        }
      })

      for (const order of ordersToShip) {
        if (!order.store.cityId || !order.address.cityId || !order.shippingCourier) {
          console.warn(`Skipping auto-resi for order ${order.id}: Missing cityId or courier data`)
          continue
        }

        try {
          const { company, type } = parseCourierString(order.shippingCourier)
          const totalWeight = Math.max(1000, order.orderItems.length * 500)
          const totalValue = Number(order.subtotal)
          const itemNames = order.orderItems.map(i => `${i.productName} x${i.quantity}`).join(', ')
          const sellerProfile = order.store.profile

          const biteshipResult = await createBiteshipOrder({
            originName: sellerProfile.name || order.store.name,
            originPhone: sellerProfile.phone || '08123456789',
            originAddress: `${order.store.name} - Harap hubungi seller untuk alamat lengkap`,
            originPostalCode: order.store.cityId,
            destName: order.address.receiverName,
            destPhone: order.address.phone,
            destAddress: order.address.fullAddress,
            destPostalCode: order.address.postalCode || order.address.cityId || '10000',
            courierCompany: company,
            courierType: type,
            itemValue: totalValue,
            weightGrams: totalWeight,
            itemName: itemNames.substring(0, 100),
            itemQty: order.orderItems.reduce((acc, i) => acc + i.quantity, 0),
            referenceId: order.id,
          })

          await prisma.order.update({
            where: { id: order.id },
            data: {
              trackingNumber: biteshipResult.waybill_id,
              biteshipOrderId: biteshipResult.id,
              status: 'SHIPPED',
            }
          })
          console.log(`✅ Auto-resi generated for order ${order.id}: ${biteshipResult.waybill_id}`)
        } catch (err: any) {
          console.error(`Failed to auto-generate resi for order ${order.id}:`, err.message)
          // Status remains PACKING, seller can generate manually
        }
      }

    } else if (isFailed) {
      await prisma.transaction.update({
        where: { id: order_id },
        data: { paymentStatus: 'FAILED' }
      })
      
      await prisma.order.updateMany({
        where: { transactionId: order_id },
        data: { status: 'CANCELLED' }
      })

      // Kembalikan stok produk
      const orders = await prisma.order.findMany({
        where: { transactionId: order_id },
        include: { orderItems: { include: { variant: true } } }
      })

      for (const order of orders) {
        for (const item of order.orderItems) {
          if (item.variantId) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } }
            })
          }
        }
      }

      console.log(`❌ Payment FAILED for transaction: ${order_id}`)
    }

    return NextResponse.json({ message: 'OK' })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
