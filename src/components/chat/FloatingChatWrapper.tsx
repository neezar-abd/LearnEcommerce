import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import FloatingChatClient from './FloatingChatClient'

export default async function FloatingChatWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { store: true }
  })

  if (!profile) return null

  return <FloatingChatClient currentProfileId={profile.id} />
}
