import prisma from '../prisma'

export const getProducts = async () => {
  const products = await prisma.products.findMany()

  return products
}

export const getProduct = async (search: string | number) => {
  if (typeof search === 'number') {
    const codeProduct = await prisma.products.findUnique({
      where: { code: search }
    })

    if (codeProduct) return codeProduct
  }

  const products = await prisma.products.findMany({
    where: { name: { contains: search.toString() } }
  })

  return products
}
