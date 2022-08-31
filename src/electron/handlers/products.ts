import { products as Product } from '@prisma/client'
import genId from '../../utils/genId'
import normalizeString from '../../utils/normalizeString'
import roundNumber from '../../utils/roundNumber'
import prisma from '../prisma'

export const getProducts = async (search?: string) => {
  const products = await prisma.products.findMany({
    where: search
      ? {
          OR: [
            {
              code: { contains: search }
            },
            { name: { contains: search } }
          ]
        }
      : {},
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

export interface CreateProductData {
  code: string
  name: string
  price: number
  cost: number
  isFractioned: boolean
  inventory: number
}

export const createProduct = async (data: CreateProductData) => {
  if (data.price < data.cost) throw new Error('invalid cost')

  const product = await prisma.products.create({
    data: {
      code: data.code.trim(),
      cost: roundNumber(data.cost),
      isFractioned: data.isFractioned,
      name: normalizeString(data.name),
      price: roundNumber(data.price),
      id: genId(),
      profit: roundNumber(data.price - data.cost),
      inventory: data.isFractioned ? null : data.inventory
    }
  })

  return product
}

export type UpdateProductData = Partial<CreateProductData>

export const updateProduct = async (id: string, data: UpdateProductData) => {
  const product = await prisma.products.findUniqueOrThrow({ where: { id } })

  if ((data.price ?? product.price) < (data.cost ?? product.cost))
    throw new Error('invalid cost')

  const updatedProduct = await prisma.products.update({
    where: { id },
    data: {
      isFractioned: data.isFractioned,
      cost: data.cost && roundNumber(data.cost),
      price: data.price && roundNumber(data.price),
      name: data.name && normalizeString(data.name),
      code: data.code?.trim(),
      profit: roundNumber(
        (data.price ?? product.price) - (data.cost ?? product.cost)
      ),
      inventory:
        data.isFractioned ?? product.isFractioned ? null : data.inventory
    }
  })

  return updatedProduct
}
