'use client'

import { useState, useTransition } from 'react'
import { resetPassword } from '../forgot-password/actions'

export default function ResetPasswordClient() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <form className="space-y-5">
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPass ? 'text' : 'password'}
          required
          minLength={8}
          className="block w-full rounded-sm border border-gray-300 px-3 py-3 text-sm placeholder-gray-400 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] pr-10"
          placeholder="Password baru (min. 8 karakter)"
        />
        <button
          type="button"
          onClick={() => setShowPass(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-gray-600"
        >
          {showPass ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>

      <div className="relative">
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          required
          minLength={8}
          className="block w-full rounded-sm border border-gray-300 px-3 py-3 text-sm placeholder-gray-400 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] pr-10"
          placeholder="Konfirmasi password baru"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-gray-600"
        >
          {showConfirm ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>

      <button
        formAction={resetPassword}
        disabled={isPending}
        className="w-full bg-[#7C3AED] py-3 px-4 text-sm font-medium text-white hover:bg-[#6D28D9] focus:outline-none transition-colors rounded-sm uppercase tracking-wider disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
      </button>
    </form>
  )
}
