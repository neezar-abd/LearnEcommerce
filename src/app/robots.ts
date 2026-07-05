import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Blokir bot agar tidak merayapi halaman pribadi pengguna atau API
      disallow: [
        '/buyer/', 
        '/seller/', 
        '/api/', 
        '/login', 
        '/register',
        '/admin/'
      ],
    },
    sitemap: 'https://lokabeli.my.id/sitemap.xml',
  }
}
