import prisma from '../prisma'

export const getProducts = async () => {
  const products = await prisma.products.findMany()

  return products
}
