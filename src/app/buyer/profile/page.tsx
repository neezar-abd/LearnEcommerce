import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, MapPin, Plus, Star, Trash2, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import CitySearch from '@/components/CitySearch'
import { updateProfileAction, addAddressAction, deleteAddressAction, setPrimaryAddressAction } from './actions'

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

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-4 mt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-[#EE4D2D]">Beranda</a>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-medium">Akun Saya</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* --- LEFT SIDEBAR --- */}
          <aside className="w-full md:w-56 flex-shrink-0">
            {/* Profile Card */}
            <div className="bg-white rounded-sm shadow-sm p-4 mb-4 flex items-center gap-3 border border-gray-100">
              <div className="w-12 h-12 bg-[#EE4D2D] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {profile.avatarUrl
                  ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  : profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{profile.name}</p>
                <a href="#edit-profile" className="text-xs text-gray-400 hover:text-[#EE4D2D] transition flex items-center gap-1">
                  <User className="w-3 h-3" /> Edit Profil
                </a>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 text-sm divide-y divide-gray-50 flex md:block overflow-x-auto custom-scrollbar md:overflow-visible">
              <a href="/buyer/profile" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-[#EE4D2D] font-semibold bg-orange-50 md:rounded-t-sm border-b-2 border-[#EE4D2D] md:border-b-0">
                <User className="w-4 h-4 hidden md:block" /> Akun Saya
              </a>
              <a href="/buyer/profile#addresses" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-gray-600 hover:text-[#EE4D2D] hover:bg-gray-50 transition border-b-2 border-transparent md:border-b-0">
                <MapPin className="w-4 h-4 hidden md:block" /> Alamat Saya
              </a>
              <a href="/buyer/orders" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-gray-600 hover:text-[#EE4D2D] hover:bg-gray-50 transition border-b-2 border-transparent md:border-b-0">
                <Star className="w-4 h-4 hidden md:block" /> Pesanan Saya
              </a>
              <a href="/buyer/wishlist" className="flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-gray-600 hover:text-[#EE4D2D] hover:bg-gray-50 transition md:rounded-b-sm border-b-2 border-transparent md:border-b-0">
                <Star className="w-4 h-4 hidden md:block" /> Wishlist
              </a>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1 flex flex-col gap-6">

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-[#EE4D2D]">{profile.transactions.length}</div>
                <div className="text-xs text-gray-500 mt-1">Total Transaksi</div>
              </div>
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-[#EE4D2D]">{profile.addresses.length}</div>
                <div className="text-xs text-gray-500 mt-1">Alamat Tersimpan</div>
              </div>
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-sm font-bold text-[#EE4D2D] break-all">{formatRupiah(totalSpent)}</div>
                <div className="text-xs text-gray-500 mt-1">Total Belanja</div>
              </div>
            </div>

            {/* EDIT PROFILE */}
            <div id="edit-profile" className="bg-white rounded-sm shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-800">Profil Saya</h2>
                <p className="text-xs text-gray-400 mt-0.5">Kelola informasi profil untuk keamanan akunmu</p>
              </div>
              <form action={updateProfileAction} className="p-6 space-y-4">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm text-gray-500 text-right">Username</label>
                  <input
                    name="name"
                    defaultValue={profile.name}
                    required
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D] w-full max-w-sm"
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm text-gray-500 text-right">Email</label>
                  <input
                    value={user.email || ''}
                    readOnly
                    className="border border-gray-200 bg-gray-50 rounded-sm px-3 py-2 text-sm text-gray-400 cursor-not-allowed w-full max-w-sm"
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm text-gray-500 text-right">No. Handphone</label>
                  <input
                    name="phone"
                    defaultValue={profile.phone || ''}
                    placeholder="08xxxxxxxxxx"
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D] w-full max-w-sm"
                  />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <div></div>
                  <button type="submit" className="bg-[#EE4D2D] text-white px-8 py-2.5 rounded-sm text-sm font-medium hover:bg-[#D73510] transition w-fit">
                    Simpan
                  </button>
                </div>
              </form>
            </div>

            {/* ADDRESS MANAGEMENT */}
            <div id="addresses" className="bg-white rounded-sm shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Alamat Saya</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Kelola alamat pengirimanmu</p>
                </div>
              </div>

              {/* Existing Addresses */}
              {profile.addresses.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {profile.addresses.map(address => (
                    <div key={address.id} className="px-6 py-4 flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-800">{address.receiverName}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-sm text-gray-500">{address.phone}</span>
                          <span className="text-xs border border-gray-300 text-gray-500 px-1.5 py-0.5 rounded">{address.label}</span>
                          {address.isPrimary && (
                            <span className="text-xs border border-[#EE4D2D] text-[#EE4D2D] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Utama
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.fullAddress}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {address.postalCode && <span className="text-xs text-gray-400">Kode Pos: {address.postalCode}</span>}
                          {address.cityId
                            ? <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">✓ Kota ID: {address.cityId}</span>
                            : <span className="text-xs text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">⚠ Kota belum diset (ongkir tidak bisa dihitung)</span>
                          }
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {!address.isPrimary && (
                          <form action={setPrimaryAddressAction.bind(null, address.id)}>
                            <button type="submit" className="text-xs text-[#EE4D2D] border border-[#EE4D2D] px-2 py-1 rounded hover:bg-[#fff0ed] transition">
                              Jadikan Utama
                            </button>
                          </form>
                        )}
                        <form action={deleteAddressAction.bind(null, address.id)}>
                          <button type="submit" className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition">
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              <div className="px-6 py-4 bg-gray-50 border-t border-dashed border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#EE4D2D]" /> Tambah Alamat Baru
                </h3>
                <form action={addAddressAction} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Label Alamat *</label>
                      <input name="label" required placeholder="Rumah / Kantor" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Nama Penerima *</label>
                      <input name="receiverName" required defaultValue={profile.name} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">No. HP Penerima *</label>
                      <input name="phone" required defaultValue={profile.phone || ''} placeholder="08xxxxxxxxxx" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Kode Pos</label>
                      <input name="postalCode" placeholder="12345" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Kota / Kabupaten <span className="text-[#EE4D2D]">*</span> <span className="text-gray-400">(untuk perhitungan ongkos kirim)</span></label>
                    <CitySearch name="cityId" placeholder="Cari kota... (contoh: Jakarta, Surabaya)" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Alamat Lengkap *</label>
                    <textarea name="fullAddress" required rows={2} placeholder="Nama jalan, nomor, RT/RW, kelurahan, kecamatan, kota, provinsi" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#EE4D2D] resize-none" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" name="isPrimary" className="accent-[#EE4D2D] w-4 h-4" />
                      Jadikan sebagai alamat utama
                    </label>
                    <button type="submit" className="bg-[#EE4D2D] text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-[#D73510] transition">
                      Simpan Alamat
                    </button>
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
