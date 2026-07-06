'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Grid, Store, MessageCircle, User } from 'lucide-react'

export default function BuyerBottomNav() {
  const pathname = usePathname()

  // Sembunyikan navigasi bawah pembeli jika sedang berada di halaman seller, login, atau reset-password
  if (
    pathname.startsWith('/seller') || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth')
  ) {
    return null
  }

  const tabs = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Kategori', href: '/#kategori', icon: Grid },
    { name: 'Toko', href: '/seller', icon: Store },
    { name: 'Pesan', href: '/messages', icon: MessageCircle },
    { name: 'Profil', href: '/buyer/profile', icon: User },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 px-2 pb-safe shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
      {tabs.map(tab => {
        const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        if (tab.name === 'Pesan') {
          return (
            <button 
              key={tab.name} 
              onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: null }))}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#7C3AED]' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#7C3AED]' : 'text-gray-500'}`}>{tab.name}</span>
            </button>
          )
        }

        return (
          <Link key={tab.name} href={tab.href} className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
            <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#7C3AED]' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${isActive ? 'text-[#7C3AED]' : 'text-gray-500'}`}>{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
