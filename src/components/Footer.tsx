import { ShieldCheck, CreditCard, Wallet, Truck, HelpCircle, Lock } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* LokaBeli Info */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold text-[#7C3AED] tracking-tight">lokabeli.</h2>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Destinasi belanja online terpercaya dengan ribuan produk berkualitas. Nikmati pengalaman belanja yang aman, mudah, dan menguntungkan.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#7C3AED] hover:text-white transition cursor-pointer">
                <span className="font-bold text-xs">IG</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#7C3AED] hover:text-white transition cursor-pointer">
                <span className="font-bold text-xs">TW</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#7C3AED] hover:text-white transition cursor-pointer">
                <span className="font-bold text-xs">FB</span>
              </div>
            </div>
          </div>

          {/* Layanan Pelanggan */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-5">Layanan Pelanggan</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-[#7C3AED] transition">Bantuan & FAQ</Link></li>
              <li><Link href="#" className="hover:text-[#7C3AED] transition">Lacak Pesanan</Link></li>
              <li><Link href="#" className="hover:text-[#7C3AED] transition">Kebijakan Pengembalian</Link></li>
              <li><Link href="#" className="hover:text-[#7C3AED] transition">Garansi Produk</Link></li>
              <li><Link href="#" className="hover:text-[#7C3AED] transition">Hubungi Kami</Link></li>
            </ul>
          </div>

          {/* Pengiriman (Shipping) */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#7C3AED]" /> Dukungan Pengiriman
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-[#D0021B] bg-white flex items-center justify-center shadow-sm">
                JNE
              </div>
              <div className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-[#E5202B] bg-white flex items-center justify-center shadow-sm">
                J&T
              </div>
              <div className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-[#FF0000] bg-white flex items-center justify-center shadow-sm">
                SiCepat
              </div>
              <div className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-[#0064D2] bg-white flex items-center justify-center shadow-sm">
                Anteraja
              </div>
              <div className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-[#7C3AED] bg-white flex items-center justify-center shadow-sm">
                Gojek
              </div>
              <div className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-[#00B14F] bg-white flex items-center justify-center shadow-sm">
                Grab
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Didukung oleh sistem resi otomatis (AWB) terintegrasi untuk pelacakan yang akurat.
            </p>
          </div>

          {/* Pembayaran (Payment) */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#7C3AED]" /> Pembayaran Aman
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* QRIS */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-extrabold italic text-[#ED1C24] mr-0.5">Q</span>
                <span className="text-[11px] font-extrabold italic text-[#2E3192]">RIS</span>
              </div>
              {/* Gopay */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-bold text-[#00AED6]">gopay</span>
              </div>
              {/* OVO */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-bold text-[#4C3494]">OVO</span>
              </div>
              {/* ShopeePay */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-bold text-[#EE4D2D]">ShopeePay</span>
              </div>
              {/* BCA */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-black text-[#005DAA] italic">BCA</span>
              </div>
              {/* Mandiri */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-black text-[#003D79]">mandiri</span>
              </div>
              {/* Visa / Mastercard */}
              <div className="px-2 py-1.5 border border-gray-200 rounded bg-white flex items-center gap-1 shadow-sm">
                <CreditCard className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-600">Kartu Kredit</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <ShieldCheck className="w-6 h-6 text-[#7C3AED]" />
              <div>
                <p className="text-[10px] font-semibold text-gray-700 leading-tight">Secured by Midtrans</p>
                <p className="text-[9px] text-gray-500">PCI-DSS Compliant</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LokaBeli. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="#" className="hover:text-gray-600 transition">Syarat & Ketentuan</Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-600 transition">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
