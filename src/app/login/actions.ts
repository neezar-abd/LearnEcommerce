'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Note: By default Supabase expects email confirmation if enabled on the dashboard.
  // We'll proceed assuming default or auto-confirm.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + error.message)
  }

  // If signUp succeeds and user object exists, insert them into Prisma Profile
  if (data.user) {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: data.user.id },
    })

    if (!existingProfile) {
      // Split email to get a temporary name, e.g., "user@email.com" -> "User"
      const name = email.split('@')[0]
      
      await prisma.profile.create({
        data: {
          userId: data.user.id,
          name: name.charAt(0).toUpperCase() + name.slice(1),
        },
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}