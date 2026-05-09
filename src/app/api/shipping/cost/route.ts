import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/rajaongkir'

// POST /api/shipping/cost
// Body: { originCityId, destinationCityId, weightGrams }
export async function POST(request: NextRequest) {
  try {
    const { originCityId, destinationCityId, weightGrams } = await request.json()

    if (!originCityId || !destinationCityId) {
      return NextResponse.json(
        { error: 'originCityId dan destinationCityId wajib diisi' },
        { status: 400 }
      )
    }

    const weight = Math.max(1, weightGrams || 1000) // min 1 gram

    const results = await calculateShipping(
      String(originCityId),
      String(destinationCityId),
      weight,
      ['jne', 'tiki', 'pos', 'sicepat', 'anteraja', 'wahana', 'jnt']
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Shipping cost error:', error)
    return NextResponse.json({ error: 'Gagal menghitung ongkos kirim' }, { status: 500 })
  }
}
