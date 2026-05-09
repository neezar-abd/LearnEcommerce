// RajaOngkir API wrapper by Komerce
// Docs: https://rajaongkir.komerce.id/

const KOMERCE_BASE = 'https://rajaongkir.komerce.id/api/v1'

export interface RajaOngkirCity {
  city_id: string
  province_id: string
  province: string
  type: string      // "Kota" | "Kabupaten" | "Kecamatan"
  city_name: string
  postal_code: string
}

export interface ShippingService {
  service: string         // e.g. "REG", "YES", "OKE"
  description: string     // e.g. "Layanan Reguler"
  cost: number            // in IDR
  etd: string             // e.g. "2-3 HARI"
}

export interface CourierResult {
  courier: string         // "jne" | "tiki" | "pos"
  services: ShippingService[]
}

// ─────────────────────────────────────────────
// Get list of cities/districts (with optional search)
// ─────────────────────────────────────────────
export async function getCities(query?: string): Promise<RajaOngkirCity[]> {
  const apiKey = process.env.RAJAONGKIR_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') return []

  const searchParam = query ? `?search=${encodeURIComponent(query)}` : '?search='

  try {
    const res = await fetch(`${KOMERCE_BASE}/destination/domestic-destination${searchParam}`, {
      headers: { key: apiKey }
    })

    if (!res.ok) {
      console.error('Komerce API error:', await res.text())
      return []
    }
    
    const resData = await res.json()
    const citiesData = resData.data || []

    return citiesData.map((c: any) => ({
      city_id: String(c.id),
      province_id: "",
      province: c.province_name,
      type: "Kecamatan",
      city_name: `${c.subdistrict_name}, ${c.district_name}, ${c.city_name}`,
      postal_code: c.zip_code
    }))
  } catch (err) {
    console.error('Failed to fetch cities:', err)
    return []
  }
}

// ─────────────────────────────────────────────
// Calculate shipping cost
// ─────────────────────────────────────────────
export async function calculateShipping(
  originCityId: string,
  destinationCityId: string,
  weightGrams: number,
  couriers: string[] = ['jne', 'tiki', 'pos']
): Promise<CourierResult[]> {
  const apiKey = process.env.RAJAONGKIR_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') {
    return getMockShipping() // fallback mock if no API key yet
  }

  const results: CourierResult[] = []

  await Promise.all(
    couriers.map(async (courier) => {
      try {
        const body = new URLSearchParams({
          origin: originCityId,
          destination: destinationCityId,
          weight: String(weightGrams),
          courier
        })

        const res = await fetch(`${KOMERCE_BASE}/calculate/domestic-cost`, {
          method: 'POST',
          headers: {
            key: apiKey,
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        })

        if (!res.ok) return

        const resData = await res.json()
        const servicesData = resData.data || []

        const services: ShippingService[] = servicesData.map((c: any) => ({
          service: c.service,
          description: c.description,
          cost: c.cost || 0,
          etd: c.etd || '-'
        }))

        if (services.length > 0) {
          results.push({ courier: courier.toUpperCase(), services })
        }
      } catch (err) {
        // Ignore individual courier errors
      }
    })
  )

  return results
}

// ─────────────────────────────────────────────
// Mock fallback (when API key not set yet)
// ─────────────────────────────────────────────
function getMockShipping(): CourierResult[] {
  return [
    {
      courier: 'JNE',
      services: [
        { service: 'REG', description: 'Layanan Reguler', cost: 15000, etd: '2-3 HARI' },
        { service: 'YES', description: 'Yakin Esok Sampai', cost: 35000, etd: '1 HARI' },
        { service: 'OKE', description: 'Ongkos Kirim Ekonomis', cost: 10000, etd: '4-5 HARI' },
      ]
    },
    {
      courier: 'TIKI',
      services: [
        { service: 'REG', description: 'Regular Service', cost: 13000, etd: '2-4 HARI' },
        { service: 'ONS', description: 'Over Night Service', cost: 30000, etd: '1 HARI' },
      ]
    },
    {
      courier: 'POS',
      services: [
        { service: 'Pos Kilat Khusus', description: 'Kilat Khusus', cost: 9000, etd: '3-5 HARI' },
      ]
    },
  ]
}
