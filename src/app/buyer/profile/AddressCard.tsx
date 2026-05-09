'use client'

import { useTransition } from 'react'
import { CheckCircle, Loader2, Trash2 } from 'lucide-react'

interface Address {
  id: string
  receiverName: string
  phone: string
  label: string
  isPrimary: boolean
  fullAddress: string
  postalCode: string | null
  cityId: string | null
}

interface AddressCardProps {
  address: Address
  setPrimaryAction: (id: string) => Promise<void>
  deleteAction: (id: string) => Promise<void>
}

export default function AddressCard({ address, setPrimaryAction, deleteAction }: AddressCardProps) {
  const [isPrimaryPending, startPrimaryTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()

  return (
    <div className={`px-4 md:px-6 py-4 transition-opacity ${isDeletePending ? 'opacity-40' : ''}`}>
      <div className="flex gap-3 md:gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="font-semibold text-sm text-gray-800">{address.receiverName}</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-500">{address.phone}</span>
            <span className="text-xs border border-gray-300 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">{address.label}</span>
            {address.isPrimary && (
              <span className="text-xs border border-[#EE4D2D] text-[#EE4D2D] px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                <CheckCircle className="w-3 h-3" /> Utama
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 break-words">{address.fullAddress}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {address.postalCode && <span className="text-xs text-gray-400">Kode Pos: {address.postalCode}</span>}
            {address.cityId
              ? <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">✓ Kota ID: {address.cityId}</span>
              : <span className="text-xs text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">⚠ Kota belum diset (ongkir tidak bisa dihitung)</span>
            }
          </div>
        </div>

        {/* Actions - stacked vertically, always visible */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
          {!address.isPrimary && (
            <button
              onClick={() => startPrimaryTransition(() => setPrimaryAction(address.id))}
              disabled={isPrimaryPending}
              className="text-xs text-[#EE4D2D] border border-[#EE4D2D] px-2 py-1 rounded hover:bg-[#fff0ed] transition flex items-center gap-1 whitespace-nowrap disabled:opacity-60"
            >
              {isPrimaryPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {isPrimaryPending ? 'Mengatur...' : 'Jadikan Utama'}
            </button>
          )}
          <button
            onClick={() => startDeleteTransition(() => deleteAction(address.id))}
            disabled={isDeletePending}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition disabled:opacity-60"
          >
            {isDeletePending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            {isDeletePending ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
