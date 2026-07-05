const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Update orders to PACKING...')
  const result = await prisma.order.updateMany({
    where: { status: 'UNPAID' },
    data: { status: 'PACKING' }
  })
  console.log(`Updated ${result.count} orders to PACKING`)
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
