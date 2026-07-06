import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatRupiah } from '@/lib/format'
import { Store, Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react'
import WithdrawalForm from './WithdrawalForm'
import SellerBottomNav from '../SellerBottomNav'
import Link from 'next/link'

export const revalidate = 0

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      store: {
        include: {
          wallet: {
            include: {
              ledgers: { orderBy: { createdAt: 'desc' } }
            }
          }
        }
      }
    }
  })

  if (!profile?.store) {
    redirect('/seller')
  }

  const store = profile.store
  const wallet = store.wallet
  const ledgers = wallet?.ledgers || []
  const currentBalance = Number(wallet?.balance || 0)

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans flex flex-col pb-20 md:pb-0">
      {/* SELLER HEADER TOPBAR */}
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6 sticky top-0 z-20">
        <Link href="/seller" className="flex items-center gap-2 text-[#7C3AED]">
          <Store className="w-6 h-6" />
          <span className="font-medium text-lg tracking-tight">LokaBeli Seller Centre</span>
        </Link>
      </header>

      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-8 max-w-[1000px] mx-auto w-full">
          
          <div className="flex items-center gap-2 mb-6">
            <Link href="/seller" className="text-gray-500 hover:text-[#7C3AED] text-sm font-medium">Dashboard</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 text-sm font-medium">Saldo Toko</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* KARTU SALDO */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h2 className="text-purple-200 font-medium mb-1">Total Saldo Aktif</h2>
                <div className="text-4xl font-bold mb-8">{formatRupiah(currentBalance)}</div>
                
                <div className="flex gap-4">
                  <WithdrawalForm maxAmount={currentBalance} />
                </div>
              </div>
            </div>

            {/* INFO BANK (DUMMY) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Rekening Pencairan</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700">
                  BCA
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">8392 1234 5678</div>
                  <div className="text-xs text-gray-500">{profile.name}</div>
                </div>
              </div>
              <button className="text-xs text-[#7C3AED] font-medium mt-3 text-left hover:underline">
                Ubah Rekening Bank
              </button>
            </div>
          </div>

          {/* RIWAYAT TRANSAKSI / LEDGER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Riwayat Transaksi (Ledger)</h3>
            </div>
            
            {ledgers.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Belum ada riwayat transaksi.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {ledgers.map(ledger => {
                  const isIncome = Number(ledger.amount) > 0;
                  return (
                    <div key={ledger.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{ledger.description || (isIncome ? 'Pemasukan' : 'Pengeluaran')}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(ledger.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            {ledger.referenceId && ` • Ref: ${ledger.referenceId.split('-')[0].toUpperCase()}`}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${isIncome ? 'text-green-600' : 'text-gray-800'}`}>
                        {isIncome ? '+' : ''}{formatRupiah(Number(ledger.amount))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      </div>
      <SellerBottomNav />
    </div>
  )
}
