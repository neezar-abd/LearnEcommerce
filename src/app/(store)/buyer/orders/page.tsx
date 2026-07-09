import { getUser } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Package } from 'lucide-react'
import Link from 'next/link'
import OrderCard from './OrderCard'

export const revalidate = 0

export default async function BuyerOrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = 'ALL' } = await searchParams
  const user = await getUser()

  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        include: {
          orders: {
            include: {
              store: true,
              address: true,
              orderItems: {
                include: {
                  review: true,
                  variant: {
                    select: { productId: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!profile) return null

  // Serialize to plain JS objects to avoid passing Prisma Decimal objects to Client Component
  const transactions = JSON.parse(JSON.stringify(profile.transactions || []))

  let filteredTransactions = transactions
  if (tab === 'UNPAID') {
    filteredTransactions = transactions.filter((t: any) => t.paymentStatus === 'PENDING' || t.paymentStatus === 'UNPAID')
  } else if (tab === 'PACKING') {
    filteredTransactions = transactions.filter((t: any) => t.orders.some((o: any) => o.status === 'PACKING'))
  } else if (tab === 'SHIPPED') {
    filteredTransactions = transactions.filter((t: any) => t.orders.some((o: any) => o.status === 'SHIPPED'))
  } else if (tab === 'COMPLETED') {
    filteredTransactions = transactions.filter((t: any) => t.orders.some((o: any) => o.status === 'COMPLETED'))
  }

  const TABS = [
    { id: 'ALL', label: 'Semua' },
    { id: 'UNPAID', label: 'Belum Bayar' },
    { id: 'PACKING', label: 'Dikemas' },
    { id: 'SHIPPED', label: 'Dikirim' },
    { id: 'COMPLETED', label: 'Selesai' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <div className="max-w-[1000px] mx-auto px-4 mt-6">

        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-xl flex shadow-sm mb-4 text-xs md:text-sm font-medium text-gray-700 overflow-x-auto">
          {TABS.map(t => (
            <Link
              key={t.id}
              href={`/buyer/orders?tab=${t.id}`}
              className={`flex-none flex-1 min-w-[70px] py-3 md:py-4 text-center cursor-pointer hover:text-[#7C3AED] hover:bg-gray-50 whitespace-nowrap px-1 transition-all duration-200 ${
                tab === t.id ? 'border-b-2 border-[#7C3AED] text-[#7C3AED]' : 'border-b-2 border-transparent'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {filteredTransactions.length === 0 ? (
           <div className="bg-white rounded-xl shadow-sm p-16 text-center">
             <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h2 className="text-lg text-gray-800 font-medium">Belum Ada Pesanan</h2>
             <p className="text-gray-500 mt-2">Tidak ada pesanan di kategori ini.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((trx: any) => (
              <OrderCard key={trx.id} trx={trx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
