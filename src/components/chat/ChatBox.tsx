'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getMessages, sendMessage } from '@/app/actions/chat'
import { Send, User, CheckCheck, Smile, Image as ImageIcon, PlaySquare, Paperclip } from 'lucide-react'
import useSWR from 'swr'

interface Profile {
  id: string
  name: string
  avatarUrl: string | null
}

interface Message {
  id: string
  conversationId: string
  senderProfileId: string
  content: string
  isRead: boolean
  createdAt: Date
  sender?: Profile
}

export default function ChatBox({ conversationId, currentProfileId }: { conversationId: string, currentProfileId: string }) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const { data: messages = [], isLoading, mutate } = useSWR<Message[]>(
    `messages_${conversationId}`,
    () => getMessages(conversationId) as Promise<any>,
    { 
      revalidateOnFocus: false, // Hemat resource server, update via Realtime
      revalidateIfStale: false 
    }
  )

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message
          
          // Only append if it's not our own message (we optimistically append ours)
          if (newMsg.senderProfileId !== currentProfileId) {
            // Need to fetch sender details or just append it without sender name 
            // (since it's from the other party, we know who it is based on the conversation)
            mutate((prev) => [...(prev || []), newMsg], false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentProfileId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const content = newMessage
    setNewMessage('')
    setIsSending(true)

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: Math.random().toString(),
      conversationId,
      senderProfileId: currentProfileId,
      content,
      isRead: false,
      createdAt: new Date(),
    }
    // Update local cache optimistically without refetching from server
    mutate((prev) => [...(prev || []), optimisticMsg], false)

    // Actual send
    const result = await sendMessage(conversationId, content)
    setIsSending(false)
    
    if (result.error) {
      alert(result.error)
      // Rollback optimistic update
      mutate((prev) => (prev || []).filter((m) => m.id !== optimisticMsg.id), false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            Memuat pesan...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">Belum ada pesan. Mulai percakapan sekarang!</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderProfileId === currentProfileId

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Bubble */}
                  <div className={`px-3 py-2 rounded-lg shadow-sm flex flex-col ${isMe ? 'bg-teal-50 text-gray-800 rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                    <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center gap-1 text-[10px] mt-1 ${isMe ? 'text-gray-500 justify-end' : 'text-gray-400 justify-end'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <CheckCheck className="w-[14px] h-[14px] text-[#7C3AED]" />}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 flex flex-col z-20">
        {/* Toolbars */}
        <div className="flex items-center gap-4 px-4 py-3 text-gray-400 bg-gray-50 border-b border-gray-100">
           <Smile className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" />
           <ImageIcon className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" />
           <PlaySquare className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" />
           <Paperclip className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 bg-white relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan"
            className="flex-1 resize-none h-10 border-none outline-none text-[14px] placeholder-gray-400 bg-transparent custom-scrollbar py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="self-end mb-1 text-gray-400 hover:text-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Kirim"
          >
            {/* Menggunakan Send arrow miring agar mirip airplane */}
            <Send className="w-6 h-6 transform rotate-0" />
          </button>
        </form>
      </div>
    </div>
  )
}
