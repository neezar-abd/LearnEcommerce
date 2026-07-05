# LokaBeli Project Status

*Dokumen ini berisi rangkuman status, arsitektur, dan pencapaian proyek LokaBeli untuk menjaga konteks pengembangan.*

## 1. Tech Stack
- **Framework:** Next.js 14/15 (App Router)
- **Styling:** TailwindCSS
- **Database ORM:** Prisma
- **Database Provider:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payment Gateway:** Midtrans (Snap API)
- **Shipping / Logistic:** Biteship API
- **Emails:** Resend & React Email

## 2. Core Domain & Arsitektur Database
Skema database (`prisma/schema.prisma`) dibagi menjadi beberapa domain utama:
- **User & Identity:** `Profile`, `Address`. Satu User Supabase terhubung ke satu `Profile`.
- **Store & Escrow:** `Store`, `StoreWallet`, `WalletLedger`. Toko dimiliki oleh satu `Profile`.
- **Product & Variants:** `Category`, `Product`, `ProductVariant`, `ProductImage`.
- **Transaction & Order:** 
  - `Transaction`: Transaksi level atas per pembayaran (Midtrans).
  - `Order`: Transaksi dipecah per Toko (Multi-vendor support).
  - `OrderItem`: Produk spesifik yang dibeli.
- **Messaging (Chat):** `Conversation`, `Message`.
- **Notifications:** `Notification` (Untuk sistem Real-time In-App).

## 3. Fitur Utama yang Sudah Diselesaikan
1. **Sistem Toko & Produk:** Penjual bisa membuat toko, menambah produk, dan manajemen stok.
2. **Multi-Vendor Checkout:** Pembeli bisa *checkout* dari beberapa toko sekaligus dalam satu pembayaran.
3. **Midtrans Integration:** Integrasi webhook Midtrans untuk mendeteksi pembayaran secara *real-time* dan otomatis mengubah status pesanan.
4. **Biteship Auto-Resi:** Otomatis memesan kurir (JNE, SiCepat, dll) dan menghasilkan nomor resi ketika pembayaran berhasil.
5. **Real-time In-App Notifications:** Lonceng notifikasi di Navbar yang otomatis bertambah angkanya (menggunakan Supabase Realtime) tanpa perlu *refresh* halaman.
6. **Transactional Emails:**
   - **Kwitansi Pembeli (Order Receipt):** Terkirim otomatis saat pembayaran lunas.
   - **Notifikasi Penjual (New Order Alert):** Terkirim ke email penjual bahwa ada pesanan baru.

## 4. Environment Variables Penting
Pastikan variabel berikut ada di dalam `.env.local` dan Vercel:
```env
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
BITESHIP_API_KEY=...
RESEND_API_KEY=...
```

## 5. Roadmap & Ide Fitur Selanjutnya
- [ ] **Pencairan Dana (Withdrawal):** Sistem bagi hasil dan penarikan uang ke rekening penjual.
- [ ] **Live Chat (Supabase Realtime):** Obrolan langsung antara pembeli dan penjual di halaman produk.
- [ ] **Ulasan & Rating Bintang 5:** Sistem ulasan produk berserta foto ulasan.
- [ ] **Admin Dashboard:** Halaman untuk Super-Admin melihat total transaksi platform (GMV).
- [ ] **Diskon & Voucher:** Mesin promo/diskon coret harga.
