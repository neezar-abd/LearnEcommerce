import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, MapPin, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import CitySearch from '@/components/CitySearch'
import { updateProfileAction, addAddressAction, deleteAddressAction, setPrimaryAddressAction } from './actions'
import LoadingButton from '@/components/LoadingButton'
import AddressCard from './AddressCard'
import { formatRupiah } from '@/lib/format'

export const revalidate = 0

export default async function BuyerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      addresses: { orderBy: { isPrimary: 'desc' } },
      transactions: {
        select: { id: true, paymentStatus: true, totalAmount: true, createdAt: true }
      }
    }
  })

  if (!profile) redirect('/login')

  const totalSpent = profile.transactions
    .filter(t => t.paymentStatus === 'PAID')
    .reduce((acc, t) => acc + Number(t.totalAmount), 0)

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-4 mt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-[#7C3AED]">Beranda</a>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-medium">Akun Saya</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* --- LEFT SIDEBAR --- */}
          <aside className="w-full md:w-56 flex-shrink-0">
            {/* Profile Card */}
            <div className="bg-white rounded-sm shadow-sm p-4 mb-4 flex items-center gap-3 border border-gray-100">
              <div className="w-12 h-12 bg-[#7C3AED] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                {profile.avatarUrl
                  ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{profile.name}</p>
                <a href="#edit-profile" className="text-xs text-gray-400 hover:text-[#7C3AED] transition flex items-center gap-1">
                  <User className="w-3 h-3" /> Edit Profil
                </a>
              </div>
            </div>

            {/* Nav Menu - Horizontal scroll on mobile */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 text-sm flex md:flex-col overflow-x-auto md:overflow-visible">
              <a href="/buyer/profile" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-[#7C3AED] font-semibold bg-teal-50 border-b-2 md:border-b-0 md:border-l-2 border-[#7C3AED] whitespace-nowrap">
                <User className="w-4 h-4 hidden md:block" /> Akun Saya
              </a>
              <a href="/buyer/profile#addresses" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-gray-600 hover:text-[#7C3AED] hover:bg-gray-50 transition whitespace-nowrap border-b-2 md:border-b-0 border-transparent">
                <MapPin className="w-4 h-4 hidden md:block" /> Alamat Saya
              </a>
              <a href="/buyer/orders" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-gray-600 hover:text-[#7C3AED] hover:bg-gray-50 transition whitespace-nowrap border-b-2 md:border-b-0 border-transparent">
                <Star className="w-4 h-4 hidden md:block" /> Pesanan Saya
              </a>
              <a href="/buyer/wishlist" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-gray-600 hover:text-[#7C3AED] hover:bg-gray-50 transition whitespace-nowrap border-b-2 md:border-b-0 border-transparent">
                <Star className="w-4 h-4 hidden md:block" /> Wishlist
              </a>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* STATS ROW */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-[#7C3AED]">{profile.transactions.length}</div>
                <div className="text-[10px] md:text-xs text-gray-500 mt-1">Total Transaksi</div>
              </div>
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold text-[#7C3AED]">{profile.addresses.length}</div>
                <div className="text-[10px] md:text-xs text-gray-500 mt-1">Alamat Tersimpan</div>
              </div>
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-3 md:p-4 text-center">
                <div className="text-xs md:text-sm font-bold text-[#7C3AED] break-all leading-tight">{formatRupiah(totalSpent)}</div>
                <div className="text-[10px] md:text-xs text-gray-500 mt-1">Total Belanja</div>
              </div>
            </div>

            {/* EDIT PROFILE */}
            <div id="edit-profile" className="bg-white rounded-sm shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 px-4 md:px-6 py-4">
                <h2 className="text-base font-semibold text-gray-800">Profil Saya</h2>
                <p className="text-xs text-gray-400 mt-0.5">Kelola informasi profil untuk keamanan akunmu</p>
              </div>
              <form action={updateProfileAction} className="p-4 md:p-6 space-y-4">
                {/* Mobile: stacked, Desktop: grid */}
                <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-4">
                  <label className="text-sm text-gray-500 md:text-right">Username</label>
                  <input
                    name="name"
                    defaultValue={profile.name}
                    required
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED] w-full md:max-w-sm"
                  />
                </div>
                <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-4">
                  <label className="text-sm text-gray-500 md:text-right">Email</label>
                  <input
                    value={user.email || ''}
                    readOnly
                    className="border border-gray-200 bg-gray-50 rounded-sm px-3 py-2 text-sm text-gray-400 cursor-not-allowed w-full md:max-w-sm"
                  />
                </div>
                <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-4">
                  <label className="text-sm text-gray-500 md:text-right">No. Handphone</label>
                  <input
                    name="phone"
                    defaultValue={profile.phone || ''}
                    placeholder="08xxxxxxxxxx"
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED] w-full md:max-w-sm"
                  />
                </div>
                <div className="flex flex-col md:grid md:grid-cols-[140px_1fr] md:items-center gap-1 md:gap-4">
                  <div className="hidden md:block"></div>
                  <LoadingButton
                    loadingText="Menyimpan..."
                    className="bg-[#7C3AED] text-white px-8 py-2.5 rounded-sm text-sm font-medium hover:bg-[#6D28D9] w-full md:w-fit"
                  >
                    Simpan
                  </LoadingButton>
                </div>
              </form>
            </div>

            {/* ADDRESS MANAGEMENT */}
            <div id="addresses" className="bg-white rounded-sm shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 px-4 md:px-6 py-4">
                <h2 className="text-base font-semibold text-gray-800">Alamat Saya</h2>
                <p className="text-xs text-gray-400 mt-0.5">Kelola alamat pengirimanmu</p>
              </div>

              {/* Existing Addresses */}
              {profile.addresses.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {profile.addresses.map(address => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      setPrimaryAction={setPrimaryAddressAction}
                      deleteAction={deleteAddressAction}
                    />
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-dashed border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  + Tambah Alamat Baru
                </h3>
                <form action={addAddressAction} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Label Alamat *</label>
                      <input name="label" required placeholder="Rumah / Kantor" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Nama Penerima *</label>
                      <input name="receiverName" required defaultValue={profile.name} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">No. HP Penerima *</label>
                      <input name="phone" required defaultValue={profile.phone || ''} placeholder="08xxxxxxxxxx" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Kode Pos</label>
                      <input name="postalCode" placeholder="12345" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Kota / Kabupaten <span className="text-[#7C3AED]">*</span> <span className="text-gray-400">(untuk perhitungan ongkos kirim)</span></label>
                    <CitySearch name="cityId" placeholder="Cari kota... (contoh: Jakarta, Surabaya)" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Alamat Lengkap *</label>
                    <textarea name="fullAddress" required rows={2} placeholder="Nama jalan, nomor, RT/RW, kelurahan, kecamatan, kota, provinsi" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C3AED] resize-none" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" name="isPrimary" className="accent-[#7C3AED] w-4 h-4" />
                      Jadikan sebagai alamat utama
                    </label>
                    <LoadingButton
                      loadingText="Menyimpan..."
                      className="bg-[#7C3AED] text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-[#6D28D9] w-full sm:w-auto"
                    >
                      Simpan Alamat
                    </LoadingButton>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
