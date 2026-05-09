import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  if (!ids) return NextResponse.json([])

  const idList = ids.split(',').filter(Boolean).slice(0, 50) // max 50 items

  const products = await prisma.product.findMany({
    where: { id: { in: idList } },
    include: {
      images: { take: 1 },
      variants: { take: 1 },
      store: { select: { name: true } }
    }
  })

  const result = products.map(p => ({
    id: p.id,
    name: p.name,
    imageUrl: p.images[0]?.url || null,
    price: Number(p.variants[0]?.price) || 0,
    storeName: p.store.name
  }))

  return NextResponse.json(result)
}
