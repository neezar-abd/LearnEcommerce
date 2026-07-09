import { getProfileWithStore } from '@/lib/session'
import FloatingChatClient from './FloatingChatClient'

export default async function FloatingChatWrapper() {
  // Uses React.cache() — no duplicate getUser/profile call if other components already fetched
  const profile = await getProfileWithStore()
  if (!profile) return null

  return <FloatingChatClient currentProfileId={profile.id} />
}
