// Biteship API wrapper for marketplace auto-resi & pickup
// Docs: https://biteship.com/id/docs
// Each seller has their own pickup address (origin) — passed dynamically per order

const BITESHIP_BASE = 'https://api.biteship.com/v1'

function getHeaders() {
  const apiKey = process.env.BITESHIP_API_KEY
  if (!apiKey) throw new Error('BITESHIP_API_KEY is not set')
  return {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
  }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface BiteshipOrder {
  id: string
  waybill_id: string       // AWB / Resi
  status: string
  courier: {
    company: string
    name: string
    phone: string
  }
  origin: { contact_name: string; contact_phone: string; address: string }
  destination: { contact_name: string; contact_phone: string; address: string }
  created_at: string
}

export interface CreateBiteshipOrderParams {
  // Origin = Seller
  originName: string
  originPhone: string
  originAddress: string
  originNote?: string
  originPostalCode: string

  // Destination = Buyer
  destName: string
  destPhone: string
  destAddress: string
  destNote?: string
  destPostalCode: string

  // Courier (e.g. "jne" + "reg")
  courierCompany: string     // e.g. "jne"
  courierType: string        // e.g. "reg"

  // Parcel
  weightGrams: number
  itemName: string
  itemQty: number
  itemValue: number

  // Our order ref
  referenceId: string
}

// ─────────────────────────────────────────────
// Create Order (generates AWB automatically)
// Uses Biteship v1 flat-body format
// ─────────────────────────────────────────────
export async function createBiteshipOrder(params: CreateBiteshipOrderParams): Promise<BiteshipOrder> {
  const body = {
    shipper_contact_name: params.originName,
    shipper_contact_phone: params.originPhone,
    shipper_contact_email: 'noreply@lokabeli.com',
    shipper_organization: 'LokaBeli Store',
    origin_contact_name: params.originName,
    origin_contact_phone: params.originPhone,
    origin_address: params.originAddress,
    origin_note: params.originNote || '',
    origin_postal_code: parseInt(params.originPostalCode) || 10000,
    destination_contact_name: params.destName,
    destination_contact_phone: params.destPhone,
    destination_address: params.destAddress,
    destination_note: params.destNote || '',
    destination_postal_code: parseInt(params.destPostalCode) || 10000,
    courier_company: params.courierCompany,
    courier_type: params.courierType,
    delivery_type: 'now',
    reference_id: params.referenceId,
    items: [
      {
        name: params.itemName.substring(0, 100),
        description: params.itemName.substring(0, 100),
        value: Math.round(params.itemValue),
        length: 10,
        width: 10,
        height: 10,
        weight: params.weightGrams,
        quantity: params.itemQty,
      }
    ]
  }

  console.log('[Biteship] Creating order with courier:', body.courier_company, '/', body.courier_type)

  const res = await fetch(`${BITESHIP_BASE}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  const data = await res.json()
  if (!res.ok) {
    console.error('[Biteship] Error response:', JSON.stringify(data))
    throw new Error(data.error || data.message || JSON.stringify(data) || 'Biteship order creation failed')
  }

  return data
}

// ─────────────────────────────────────────────
// Get Order Detail (track status & AWB)
// ─────────────────────────────────────────────
export async function getBiteshipOrder(biteshipOrderId: string): Promise<BiteshipOrder> {
  const res = await fetch(`${BITESHIP_BASE}/orders/${biteshipOrderId}`, {
    headers: getHeaders(),
    cache: 'no-store'
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch Biteship order')
  }
  return data
}

// ─────────────────────────────────────────────
// Parse courier string from our DB to Biteship codes
//
// DB stores display strings like:
//   "JNE REG", "TIKI ONS", "POS Pos Kilat Khusus", "SICEPAT REG"
//
// Biteship expects:
//   courier_company: "jne", courier_type: "reg"
//   courier_company: "pos", courier_type: "pos_kilat_khusus"
// ─────────────────────────────────────────────

// Mapping: lowercase display string → { company, type }
const COURIER_MAP: Record<string, { company: string; type: string }> = {
  // JNE
  'jne reg':   { company: 'jne', type: 'reg' },
  'jne yes':   { company: 'jne', type: 'yes' },
  'jne oke':   { company: 'jne', type: 'oke' },
  'jne jtr':   { company: 'jne', type: 'jtr' },
  // TIKI
  'tiki reg':  { company: 'tiki', type: 'reg' },
  'tiki ons':  { company: 'tiki', type: 'ons' },
  'tiki eco':  { company: 'tiki', type: 'eco' },
  // POS Indonesia
  'pos pos kilat khusus': { company: 'pos', type: 'pos_kilat_khusus' },
  'pos kilat khusus':     { company: 'pos', type: 'pos_kilat_khusus' },
  'pos pos reguler':      { company: 'pos', type: 'pos_reguler' },
  'pos reguler':          { company: 'pos', type: 'pos_reguler' },
  // SiCepat
  'sicepat reg':  { company: 'sicepat', type: 'reg' },
  'sicepat best': { company: 'sicepat', type: 'best' },
  'sicepat halu': { company: 'sicepat', type: 'halu' },
  // J&T
  'jnt ez':    { company: 'jnt', type: 'ez' },
  'jnt jnt':   { company: 'jnt', type: 'jnt' },
  'j&t ez':    { company: 'jnt', type: 'ez' },
  // AnterAja
  'anteraja reg':      { company: 'anteraja', type: 'reg' },
  'anteraja same day': { company: 'anteraja', type: 'same_day' },
  // Wahana
  'wahana reg': { company: 'wahana', type: 'reg' },
}

export function parseCourierString(courierStr: string): { company: string; type: string } {
  const lower = courierStr.trim().toLowerCase()

  // Direct map lookup
  if (COURIER_MAP[lower]) return COURIER_MAP[lower]

  // Partial match: cari key yang ada di dalam string
  for (const [key, val] of Object.entries(COURIER_MAP)) {
    if (lower.includes(key)) return val
  }

  // Fallback: first word = company, rest joined with _ = type
  const parts = courierStr.trim().split(/\s+/)
  const company = parts[0].toLowerCase()
  const type = parts.slice(1).join('_').toLowerCase() || 'reg'

  console.warn(`[Biteship] Unknown courier: "${courierStr}" → fallback: ${company}/${type}`)
  return { company, type }
}
