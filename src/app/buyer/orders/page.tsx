import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import OrderCard from './OrderCard'

export const revalidate = 0

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const transactions = profile.transactions || []

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-4 mt-6">

        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-sm flex shadow-sm mb-4 text-xs md:text-sm font-medium text-gray-700 overflow-x-auto">
          <div className="flex-none flex-1 min-w-[70px] py-3 md:py-4 text-center border-b-2 border-[#EE4D2D] text-[#EE4D2D] cursor-pointer">Semua</div>
          <div className="flex-none flex-1 min-w-[80px] py-3 md:py-4 text-center cursor-pointer hover:text-[#EE4D2D] whitespace-nowrap px-1">Belum Bayar</div>
          <div className="flex-none flex-1 min-w-[70px] py-3 md:py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Dikemas</div>
          <div className="flex-none flex-1 min-w-[70px] py-3 md:py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Dikirim</div>
          <div className="flex-none flex-1 min-w-[70px] py-3 md:py-4 text-center cursor-pointer hover:text-[#EE4D2D]">Selesai</div>
        </div>

        {transactions.length === 0 ? (
           <div className="bg-white rounded-sm shadow-sm p-16 text-center">
             <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h2 className="text-lg text-gray-800 font-medium">Belum Ada Pesanan</h2>
             <p className="text-gray-500 mt-2">Daftar pesananmu masih kosong nih.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(trx => (
              <OrderCard key={trx.id} trx={trx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
