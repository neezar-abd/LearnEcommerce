import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { getConversations } from '@/app/actions/chat'
import ChatBox from '@/components/chat/ChatBox'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, User } from 'lucide-react'

export const revalidate = 0

export default async function BuyerChatPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) redirect('/login')

  const conversations = await getConversations()
  const { id: activeConversationId } = await searchParams

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-gray-800 mb-6">Pesan Saya</h1>
      
      <div className="flex bg-white border border-gray-200 rounded-sm overflow-hidden h-[600px] shadow-sm">
        
        {/* Sidebar - List of Conversations */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-medium text-gray-700">Daftar Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center mt-10">
                Belum ada percakapan.
              </div>
            ) : (
              conversations.map((conv) => (
                <Link 
                  href={`/buyer/chat?id=${conv.id}`} 
                  key={conv.id}
                  className={`block p-4 border-b border-gray-100 hover:bg-teal-50 transition-colors ${activeConversationId === conv.id ? 'bg-teal-50' : 'bg-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-medium text-sm text-gray-800 truncate">{conv.store.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.messages && conv.messages.length > 0 
                          ? conv.messages[0].content 
                          : 'Belum ada pesan'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="w-2/3 bg-white">
          {activeConversationId ? (
            <ChatBox conversationId={activeConversationId} currentProfileId={profile.id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Store className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Pesan Anda</h3>
              <p className="text-gray-500 text-sm max-w-[250px]">Pilih percakapan di sebelah kiri untuk mulai mengirim pesan ke penjual.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
