'use client'

import { useState } from 'react'
import { generateResiAction } from './actions'
import { Zap, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react'

interface GenerateResiButtonProps {
  orderId: string
}

export default function GenerateResiButton({ orderId }: GenerateResiButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; awb?: string; error?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!confirm('Buat resi otomatis via Biteship? Order akan langsung berubah status DIKIRIM.')) return
    setLoading(true)
    setResult(null)
    try {
      const res = await generateResiAction(orderId)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result?.success && result.awb) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
        <div className="text-sm">
          <span className="text-green-700 font-medium">Resi: </span>
          <span className="text-green-800 font-bold">{result.awb}</span>
        </div>
        <button
          onClick={() => handleCopy(result.awb!)}
          className="ml-1 text-green-600 hover:text-green-800 transition"
          title="Copy resi"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    )
  }

  if (result?.error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{result.error}</span>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-50 border border-orange-200 text-orange-700 rounded hover:bg-orange-100 transition"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Membuat Resi...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4" />
          Buat Resi Otomatis
        </>
      )}
    </button>
  )
}
