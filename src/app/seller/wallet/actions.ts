'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function requestWithdrawalAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const amount = Number(formData.get('amount'))
  if (!amount || amount <= 0) throw new Error('Invalid amount')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: { include: { wallet: true } } }
  })

  if (!profile || !profile.store) throw new Error('Store not found')
  const wallet = profile.store.wallet

  if (!wallet || Number(wallet.balance) < amount) {
    throw new Error('Insufficient balance')
  }

  // Use a transaction to safely deduct the balance and log the ledger
  await prisma.$transaction(async (tx) => {
    // 1. Deduct balance
    await tx.storeWallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } }
    })

    // 2. Create ledger entry for WITHDRAWAL
    await tx.walletLedger.create({
      data: {
        storeWalletId: wallet.id,
        amount: -amount, // Negative amount for withdrawal
        type: 'WITHDRAWAL_REQUEST',
        description: 'Penarikan Dana ke Rekening Bank',
      }
    })
  })

  revalidatePath('/seller/wallet')
}
