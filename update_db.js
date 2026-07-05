const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Updating dummy stores to DKI Jakarta...')
  await prisma.store.updateMany({
    data: { province: 'DKI Jakarta' }
  })
  
  console.log('Updating dummy addresses to DKI Jakarta...')
  await prisma.address.updateMany({
    data: { province: 'DKI Jakarta' }
  })

  console.log('Done updating dummy data.')
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
