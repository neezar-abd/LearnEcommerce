'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Kirim email reset password
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/forgot-password?success=1')
}

// Update password baru
export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirmPassword') as string

  if (password !== confirm) {
    redirect('/reset-password?error=Password+tidak+cocok')
  }

  if (password.length < 8) {
    redirect('/reset-password?error=Password+minimal+8+karakter')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/login?success=Password+berhasil+diperbarui!+Silakan+login.')
}
