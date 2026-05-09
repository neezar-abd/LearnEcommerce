'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string
  children: React.ReactNode
}

export default function LoadingButton({ loadingText, children, className, disabled, ...props }: LoadingButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || disabled}
      className={`${className} flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{loadingText || 'Menyimpan...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
