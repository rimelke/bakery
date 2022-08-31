import { products as Product } from '@prisma/client'
import normalizeString from '../../utils/normalizeString'
import prisma from '../prisma'

export const getProducts = async () => {
  const products = await prisma.products.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30
  })

  return products
}

export const getProduct = async (search: string) => {
  if (!/\D/.test(search)) {
    const codeProduct = await prisma.products.findUnique({
      where: { code: search }
    })

    if (codeProduct) return codeProduct
  }

  const products = await prisma.$queryRaw<
    Product[]
  >`SELECT * FROM "products" WHERE "name" LIKE ${`%${normalizeString(
    search.toString()
  )
    .split('')
    .join('%')}%`} ORDER BY "code"`

  return products
}

export const deleteProduct = (id: string) =>
  prisma.products.delete({ where: { id } })
