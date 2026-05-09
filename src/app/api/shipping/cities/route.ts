import { NextRequest, NextResponse } from 'next/server'
import { getCities } from '@/lib/rajaongkir'

// GET /api/shipping/cities?q=jakarta
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  const cities = await getCities(q || undefined)
  return NextResponse.json(cities.slice(0, 30)) // max 30 results
}
