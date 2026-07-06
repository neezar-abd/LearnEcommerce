'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ClipboardList, Wallet } from 'lucide-react'

export default function SellerBottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
    { name: 'Pesanan', href: '/seller/orders', icon: ClipboardList },
    { name: 'Dompet', href: '/seller/wallet', icon: Wallet },
    // Maybe add a chat or settings here later
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 px-2 pb-safe">
      {tabs.map(tab => {
        const isActive = pathname === tab.href || (tab.href !== '/seller' && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
            <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#7C3AED]' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${isActive ? 'text-[#7C3AED]' : 'text-gray-500'}`}>{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
