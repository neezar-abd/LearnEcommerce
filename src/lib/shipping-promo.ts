// src/lib/shipping-promo.ts
// Logic untuk promo gratis ongkir sesama pulau LokaBeli

// ─────────────────────────────────────────────
// Konfigurasi Promo
// ─────────────────────────────────────────────
export const FREE_SHIPPING_CONFIG = {
  MIN_PURCHASE: 75000,       // Minimum subtotal untuk eligible gratis ongkir
  MAX_SUBSIDY: 15000,        // Maksimum subsidi ongkir dari platform
  PLATFORM_COMMISSION: 0.03, // Komisi platform 3%
}

// ─────────────────────────────────────────────
// Mapping Provinsi → Pulau
// ─────────────────────────────────────────────
const ISLAND_MAP: Record<string, string[]> = {
  Jawa: [
    'DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah',
    'DI Yogyakarta', 'D.I. Yogyakarta', 'Jawa Timur'
  ],
  Sumatera: [
    'Aceh', 'Nanggroe Aceh Darussalam', 'Sumatera Utara', 'Sumatera Barat',
    'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan',
    'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Bangka Belitung'
  ],
  Kalimantan: [
    'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan',
    'Kalimantan Timur', 'Kalimantan Utara'
  ],
  Sulawesi: [
    'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat',
    'Sulawesi Selatan', 'Sulawesi Tenggara'
  ],
  Bali_Nusra: [
    'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur'
  ],
  Maluku: ['Maluku', 'Maluku Utara'],
  Papua: [
    'Papua', 'Papua Barat', 'Papua Barat Daya',
    'Papua Pegunungan', 'Papua Selatan', 'Papua Tengah'
  ],
}

/**
 * Mendapatkan nama pulau dari nama provinsi
 */
export function getIslandFromProvince(province: string): string | null {
  if (!province) return null
  const normalized = province.trim()
  for (const [island, provinces] of Object.entries(ISLAND_MAP)) {
    if (provinces.some(p => normalized.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(normalized.toLowerCase()))) {
      return island
    }
  }
  return null
}

/**
 * Cek apakah dua provinsi berada di pulau yang sama
 */
export function isSameIsland(provinceA: string, provinceB: string): boolean {
  const islandA = getIslandFromProvince(provinceA)
  const islandB = getIslandFromProvince(provinceB)
  if (!islandA || !islandB) return false
  return islandA === islandB
}

/**
 * Hitung subsidi ongkir dari platform
 * Returns: { eligible, subsidyAmount, buyerPays, discount }
 */
export function calculateShippingPromo({
  subtotal,
  shippingCost,
  buyerProvince,
  sellerProvince,
}: {
  subtotal: number
  shippingCost: number
  buyerProvince: string
  sellerProvince: string
}): {
  eligible: boolean
  reason?: string
  subsidyAmount: number
  buyerPays: number
  discount: number
} {
  // Cek minimum pembelian
  if (subtotal < FREE_SHIPPING_CONFIG.MIN_PURCHASE) {
    return {
      eligible: false,
      reason: `Belanja min. Rp${FREE_SHIPPING_CONFIG.MIN_PURCHASE.toLocaleString('id-ID')} untuk gratis ongkir`,
      subsidyAmount: 0,
      buyerPays: shippingCost,
      discount: 0,
    }
  }

  // Cek sesama pulau
  if (!isSameIsland(buyerProvince, sellerProvince)) {
    return {
      eligible: false,
      reason: 'Gratis ongkir hanya untuk pengiriman sesama pulau',
      subsidyAmount: 0,
      buyerPays: shippingCost,
      discount: 0,
    }
  }

  // Eligible! Hitung subsidi
  const subsidyAmount = Math.min(shippingCost, FREE_SHIPPING_CONFIG.MAX_SUBSIDY)
  const buyerPays = Math.max(0, shippingCost - subsidyAmount)

  return {
    eligible: true,
    subsidyAmount,
    buyerPays,
    discount: subsidyAmount,
  }
}
