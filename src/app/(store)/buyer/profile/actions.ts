'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  await prisma.profile.update({
    where: { userId: user.id },
    data: { name, phone }
  })

  revalidatePath('/buyer/profile')
}

export async function addAddressAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return

  const label = formData.get('label') as string
  const receiverName = formData.get('receiverName') as string
  const phone = formData.get('phone') as string
  const fullAddress = formData.get('fullAddress') as string
  const postalCode = formData.get('postalCode') as string
  const cityId = formData.get('cityId') as string | null
  const province = formData.get('cityId_province') as string | null
  const isPrimary = formData.get('isPrimary') === 'on'

  // If this is set as primary, unset others first
  if (isPrimary) {
    await prisma.address.updateMany({
      where: { profileId: profile.id },
      data: { isPrimary: false }
    })
  }

  await prisma.address.create({
    data: {
      profileId: profile.id,
      label,
      receiverName,
      phone,
      fullAddress,
      postalCode,
      cityId: cityId || null,
      province: province || null,
      isPrimary: isPrimary || false
    }
  })

  revalidatePath('/buyer/profile')
}

export async function deleteAddressAction(addressId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return

  await prisma.address.deleteMany({
    where: { id: addressId, profileId: profile.id }
  })

  revalidatePath('/buyer/profile')
}

export async function setPrimaryAddressAction(addressId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return

  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: addressId, profileId: profile.id }
  })
  if (!address) return

  await prisma.address.updateMany({
    where: { profileId: profile.id },
    data: { isPrimary: false }
  })

  await prisma.address.update({
    where: { id: addressId },
    data: { isPrimary: true }
  })

  revalidatePath('/buyer/profile')
}
