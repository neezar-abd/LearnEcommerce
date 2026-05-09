import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Menghapus data lama (karena beda struktur)...')
  await prisma.product.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.profile.deleteMany({});

  console.log('Seeding complex database with variants and images...')

  // 1. Buat Dummy Profile & Store
  const profile = await prisma.profile.create({
    data: {
      userId: 'dummy-user-id-1234',
      name: 'Neezar Ahnaf',
      phone: '+6281234567890',
      store: {
        create: {
          name: 'Uchinaga Official Store',
          domain: 'uchinaga_official',
          description: 'Toko Elektronik Terpercaya Se-Indonesia'
        }
      },
      addresses: {
        create: [
          {
            label: 'Rumah',
            receiverName: 'Neezar',
            phone: '08123456789',
            fullAddress: 'Jl. Merdeka No. 1, Jakarta',
            isPrimary: true
          }
        ]
      }
    },
    include: { store: true }
  });

  const storeId = profile.store!.id;

  // 2. Kategori
  const categories = [
    { name: 'Elektronik', slug: 'elektronik', icon: 'Tv' },
    { name: 'Komputer & Aksesoris', slug: 'komputer-aksesoris', icon: 'Laptop' },
    { name: 'Handphone', slug: 'handphone', icon: 'Smartphone' },
    { name: 'Pakaian Pria', slug: 'pakaian-pria', icon: 'Shirt' },
    { name: 'Sepatu Pria', slug: 'sepatu-pria', icon: 'Footprints' },
    { name: 'Tas Pria', slug: 'tas-pria', icon: 'Briefcase' },
    { name: 'Aksesoris Fashion', slug: 'aksesoris-fashion', icon: 'Glasses' },
    { name: 'Jam Tangan', slug: 'jam-tangan', icon: 'Watch' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const elektronikCat = await prisma.category.findUnique({ where: { slug: 'elektronik' } })
  const komputerCat = await prisma.category.findUnique({ where: { slug: 'komputer-aksesoris' } })

  // 3. Produk, Varian, Gambar
  const products = [
    { catId: elektronikCat!.id, name: 'Minimalist Desk Lamp LED', slug: 'minimalist-desk-lamp-led', price: 150000, stock: 100, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80', description: 'Lampu belajar minimalis dengan teknologi LED hemat energi.' },
    { catId: komputerCat!.id, name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', price: 1200000, stock: 50, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80', description: 'Kursi kantor ergonomis dengan bahan mesh yang sejuk.' },
    { catId: komputerCat!.id, name: 'Mechanical Keyboard RGB', slug: 'mechanical-keyboard-rgb', price: 850000, stock: 30, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', description: 'Keyboard mekanikal RGB.' },
    { catId: komputerCat!.id, name: 'Wireless Mouse Silent', slug: 'wireless-mouse-silent', price: 150000, stock: 200, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80', description: 'Mouse tanpa suara.' },
    { catId: elektronikCat!.id, name: 'TWS Earbuds Bluetooth', slug: 'tws-earbuds', price: 250000, stock: 350, image: 'https://images.unsplash.com/photo-1572569433602-273574c8df23?w=500&q=80', description: 'TWS anti delay.' },
    { catId: elektronikCat!.id, name: 'Smartwatch AMOLED', slug: 'smartwatch-amoled', price: 450000, stock: 120, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80', description: 'Layar super jernih.' }
  ]

  for (const p of products) {
    await prisma.product.create({
      data: {
        storeId,
        categoryId: p.catId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        variants: {
          create: [{
            name: 'Default',
            price: p.price,
            stock: p.stock
          }]
        },
        images: {
          create: [{
            url: p.image,
            isPrimary: true
          }]
        }
      }
    });
  }

  console.log('? Semua Produk Variant & Gambar berhasil di-insert ke V2 Schema Database!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
