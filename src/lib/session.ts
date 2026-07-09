/**
 * session.ts — Shared session helpers using React.cache()
 *
 * React.cache() deduplicates calls within the same render tree.
 * If 5 Server Components call getSession() during one page render,
 * the actual async function only executes ONCE. The other 4 calls
 * get the same cached Promise immediately.
 *
 * This eliminates the redundant getUser() + profile.findUnique()
 * calls that were happening in NavbarUserSection, FloatingChatWrapper,
 * and each page component simultaneously.
 */

import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

/**
 * Returns the authenticated Supabase user for the current request.
 * Deduplicated via React.cache() — only one network call per render.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/**
 * Returns the Prisma profile for the current user.
 * Deduplicated via React.cache() — only one DB query per render.
 */
export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  return prisma.profile.findUnique({
    where: { userId: user.id },
  })
})

/**
 * Returns the Prisma profile including the store relation.
 * Used in seller pages and FloatingChatWrapper.
 */
export const getProfileWithStore = cache(async () => {
  const user = await getUser()
  if (!user) return null

  return prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true },
  })
})

/**
 * Returns cart item count for current user. Deduplicated.
 */
export const getCartItemCount = cache(async () => {
  const profile = await getProfile()
  if (!profile) return 0

  const cart = await prisma.cart.findUnique({
    where: { profileId: profile.id },
    select: {
      items: {
        select: { quantity: true }
      }
    },
  })

  return cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0
})
