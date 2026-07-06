'use client'

import { useTransition, useState } from 'react'
import { requestWithdrawalAction } from './actions'
import { Loader2, ArrowRight } from 'lucide-react'

export default function WithdrawalForm({ maxAmount }: { maxAmount: number }) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await requestWithdrawalAction(fd)
        setIsOpen(false)
        alert('Permintaan penarikan dana berhasil diproses!')
      } catch (err: any) {
        alert(err.message || 'Gagal menarik dana')
      }
    })
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        disabled={maxAmount <= 0}
        className="bg-white text-[#7C3AED] px-6 py-2.5 rounded-full font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
      >
        Tarik Dana <ArrowRight className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-purple-200 mb-1 block">Jumlah Penarikan (Rp)</label>
          <input 
            type="number" 
            name="amount" 
            max={maxAmount} 
            min={10000}
            required 
            defaultValue={maxAmount}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:outline-none focus:bg-white/30"
          />
          <p className="text-[10px] text-purple-200 mt-1">Minimal penarikan Rp 10.000</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-transparent border border-white/40 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={isPending}
            className="flex-1 bg-white text-[#7C3AED] py-2 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors flex items-center justify-center"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proses'}
          </button>
        </div>
      </form>
    </div>
  )
}
