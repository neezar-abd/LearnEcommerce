import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://lokabeli.my.id'

  // Fetch all products that are not deleted or hidden
  const products = await prisma.product.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    // We assume all products in the database are public for now
    // If you have a status field like isPublished, add it here:
    // where: { isPublished: true }
  })

  // Fetch all stores
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      updatedAt: true,
    }
  })

  // Format products for sitemap
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Format stores for sitemap
  const storeUrls: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${baseUrl}/store/${store.id}`,
    lastModified: store.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Return the complete sitemap
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1, // Homepage gets highest priority
    },
    ...productUrls,
    ...storeUrls,
  ]
}
