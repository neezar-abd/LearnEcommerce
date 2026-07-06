import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { getConversations } from '@/app/actions/chat'
import ChatBox from '@/components/chat/ChatBox'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Store, Bell } from 'lucide-react'
import SellerBottomNav from '../SellerBottomNav'

export const revalidate = 0

export default async function SellerChatPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ 
    where: { userId: user.id },
    include: { store: true }
  })
  
  if (!profile || !profile.store) {
    redirect('/seller/register') // Redirect if they don't have a store
  }

  const conversations = await getConversations()
  const { id: activeConversationId } = await searchParams

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col pb-20 md:pb-0">
      {/* SELLER HEADER TOPBAR */}
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <a href="/seller" className="text-gray-600 hover:text-[#7C3AED]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </a>
          <h1 className="font-semibold text-gray-800">Pesan Pelanggan</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6 text-gray-500 flex-shrink-0">
          <Bell className="w-5 h-5 cursor-pointer hover:text-[#7C3AED]" />
        </div>
      </header>

      <div className="max-w-[1200px] w-full mx-auto px-4 py-4 md:py-8 flex-1 flex flex-col">
      
      <div className="flex bg-white border border-gray-200 rounded-sm overflow-hidden h-[600px] shadow-sm">
        
        {/* Sidebar - List of Conversations */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-medium text-gray-700">Daftar Chat Pelanggan</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center mt-10">
                Belum ada percakapan dengan pembeli.
              </div>
            ) : (
              conversations.map((conv) => (
                <Link 
                  href={`/seller/chat?id=${conv.id}`} 
                  key={conv.id}
                  className={`block p-4 border-b border-gray-100 hover:bg-teal-50 transition-colors ${activeConversationId === conv.id ? 'bg-teal-50' : 'bg-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-medium text-sm text-gray-800 truncate">{conv.buyer.name}</h3>
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
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Pesan Pelanggan</h3>
              <p className="text-gray-500 text-sm max-w-[250px]">Pilih percakapan di sebelah kiri untuk mulai membalas pesan pelanggan.</p>
            </div>
          )}
        </div>
      </div>
      </div>
      <SellerBottomNav />
    </div>
  )
}
