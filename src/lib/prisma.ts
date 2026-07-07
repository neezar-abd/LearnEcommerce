import { PrismaClient } from '@prisma/client'

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || ''
  if (!url) return undefined

  try {
    const parsedUrl = new URL(url)
    parsedUrl.searchParams.set('pgbouncer', 'true')
    parsedUrl.searchParams.set('connection_limit', '5')
    parsedUrl.searchParams.set('pool_timeout', '20')
    return parsedUrl.toString()
  } catch (e) {
    const separator = url.includes('?') ? '&' : '?'
    let updatedUrl = url
    if (!updatedUrl.includes('pgbouncer=')) {
      updatedUrl = `${updatedUrl}${separator}pgbouncer=true`
    }
    if (!updatedUrl.includes('connection_limit=')) {
      const sep = updatedUrl.includes('?') ? '&' : '?'
      updatedUrl = `${updatedUrl}${sep}connection_limit=5`
    }
    if (!updatedUrl.includes('pool_timeout=')) {
      const sep = updatedUrl.includes('?') ? '&' : '?'
      updatedUrl = `${updatedUrl}${sep}pool_timeout=20`
    }
    return updatedUrl
  }
}

const prismaClientSingleton = () => {
  const url = getDatabaseUrl()
  return new PrismaClient(
    url
      ? {
          datasources: {
            db: {
              url,
            },
          },
        }
      : undefined
  )
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
