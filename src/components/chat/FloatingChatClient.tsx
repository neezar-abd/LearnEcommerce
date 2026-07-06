'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, ExternalLink, ChevronDown, Store, User, ChevronUp, Search } from 'lucide-react'
import { getConversations, startConversation } from '@/app/actions/chat'
import ChatBox from './ChatBox'
import Link from 'next/link'
import useSWR from 'swr'
import { usePathname } from 'next/navigation'

export default function FloatingChatClient({ currentProfileId }: { currentProfileId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  if (pathname.startsWith('/seller')) return null

  // Gunakan SWR untuk fetching & caching daftar chat secara otomatis
  const { data: conversations = [], mutate: mutateConversations } = useSWR(
    isOpen ? `conversations_${currentProfileId}` : null,
    getConversations,
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  // Listen for global custom event to open chat with a specific store
  useEffect(() => {
    const handleOpenChat = async (e: Event) => {
      const customEvent = e as CustomEvent
      const storeId = customEvent.detail
      
      setIsOpen(true)
      setIsLoading(true)
      
      // Start or get conversation with the store
      const result = await startConversation(storeId)
      if (result.conversationId) {
        setActiveConversationId(result.conversationId)
        mutateConversations() // Refresh daftar chat di background
      } else if (result.error) {
        alert(result.error)
      }
      setIsLoading(false)
    }

    window.addEventListener('open-chat', handleOpenChat)
    return () => window.removeEventListener('open-chat', handleOpenChat)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-0 right-4 md:right-10 bg-white border border-gray-200 text-[#7C3AED] px-4 md:px-6 py-2.5 rounded-t-md shadow-[0_-2px_10px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-all duration-300 z-50 flex items-center justify-center gap-2 font-medium"
      >
        <MessageSquare className="w-5 h-5 fill-[#7C3AED]" /> Chat
      </button>
    )
  }

  // Cari active conversation untuk header
  const activeConv = conversations.find((c: any) => c.id === activeConversationId)
  const activeName = activeConv ? (activeConv.store.profileId === currentProfileId ? activeConv.buyer.name : activeConv.store.name) : ''

  return (
    <div className="fixed bottom-0 right-0 md:right-10 w-full md:w-[700px] h-[85dvh] md:h-[500px] bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.15)] rounded-t-xl md:rounded-t-md z-50 flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 origin-bottom">
      
      {/* Top Header — Chat window expands from the floating button */}
      
      {/* Body: 2 Columns */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Conversation List */}
        <div className={`w-full md:w-[280px] border-r border-gray-200 bg-white flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header Left */}
          <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 bg-white">
            <div className="flex-1 flex items-center border border-gray-300 rounded-sm px-2 py-1.5 focus-within:border-[#7C3AED] transition-colors">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Cari nama" 
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center">
              <ChevronDown className="w-5 h-5" />
            </button>
            <button className="hidden md:flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-800 font-medium">
              Semua <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="p-4 text-xs text-gray-500 text-center mt-4">Belum ada obrolan</div>
            ) : (
              conversations.map((conv) => {
                // Determine if we are talking to a store (buyer view) or a buyer (seller view)
                const isMyStore = conv.store.profileId === currentProfileId
                const name = isMyStore ? conv.buyer.name : conv.store.name
                const lastMsg = conv.messages?.[0]?.content || 'Mulai obrolan'

                const timeObj = conv.messages?.[0]?.createdAt ? new Date(conv.messages[0].createdAt) : null
                const timeStr = timeObj ? timeObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full flex gap-3 p-3 text-left transition-colors relative ${activeConversationId === conv.id ? 'bg-[#f5f5f5]' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {isMyStore ? <User className="w-5 h-5 text-gray-500" /> : <Store className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[13px] font-medium text-gray-800 truncate pr-2">{name}</h4>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeStr}</span>
                      </div>
                      <p className="text-[12px] text-gray-500 truncate">{lastMsg}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat */}
        <div className={`flex-1 bg-[#f5f5f5] flex-col relative ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
               Memuat...
             </div>
          ) : activeConversationId ? (
            <>
              {/* Active Chat Header */}
              <div className="h-[44px] px-2 md:px-4 flex items-center justify-between bg-white border-b border-gray-200 flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={() => setActiveConversationId(null)} 
                    className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center"
                  >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                  </button>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-sm transition">
                    <h3 className="font-medium text-gray-800 text-[14px]">{activeName}</h3>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsOpen(false)} className="flex items-center gap-1 text-gray-500 hover:text-[#7C3AED] text-[13px] transition-colors">
                    Tutup <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden relative">
                <ChatBox conversationId={activeConversationId} currentProfileId={currentProfileId} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-center bg-gray-50/50 relative">
              <div className="absolute top-0 right-0 p-3">
                <button onClick={() => setIsOpen(false)} className="flex items-center gap-1 text-gray-500 hover:text-[#7C3AED] text-[13px] transition-colors">
                  Tutup <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Pesan Anda</h3>
              <p className="text-gray-500 text-xs max-w-[200px]">Pilih percakapan untuk mulai chat.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
