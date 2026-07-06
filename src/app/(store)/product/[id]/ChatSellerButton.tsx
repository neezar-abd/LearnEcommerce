'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChatSellerButton({ storeId }: { storeId: string }) {
  const router = useRouter()
  
  const handleChat = async () => {
    // Memanggil event global yang ditangkap oleh FloatingChatClient
    window.dispatchEvent(new CustomEvent('open-chat', { detail: storeId }))
  }

  return (
    <button 
      onClick={handleChat}
      className="border border-[#7C3AED] text-[#7C3AED] px-3 py-1 rounded-sm text-xs bg-[#FFEEEE] flex items-center gap-1 hover:bg-[#FFDEDE] transition-colors"
    >
      <MessageSquare className="w-3 h-3" /> 
      Chat Penjual
    </button>
  )
}
