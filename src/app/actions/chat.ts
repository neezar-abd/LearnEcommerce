'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Start or get existing conversation
export async function startConversation(storeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Harap login terlebih dahulu' }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return { error: 'Profil tidak ditemukan' }

  // Check if conversation exists
  let conversation = await prisma.conversation.findUnique({
    where: {
      buyerId_storeId: {
        buyerId: profile.id,
        storeId: storeId
      }
    }
  })

  // If not, create
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        buyerId: profile.id,
        storeId: storeId
      }
    })
  }

  return { conversationId: conversation.id }
}

// 2. Get all conversations for current user (handles both buyer and seller)
export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const profile = await prisma.profile.findUnique({ 
    where: { userId: user.id },
    include: { store: true }
  })
  if (!profile) return []

  // Get conversations where user is buyer OR seller
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: profile.id },
        ...(profile.store ? [{ storeId: profile.store.id }] : [])
      ]
    },
    include: {
      store: true,
      buyer: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1 // For latest message preview
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return conversations
}

// 3. Get messages for a specific conversation
export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: true
    }
  })
  
  return messages
}

// 4. Send a message
export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Harap login' }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return { error: 'Profil tidak ditemukan' }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderProfileId: profile.id,
      content
    },
    include: {
      sender: true
    }
  })

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  })

  return { message }
}
