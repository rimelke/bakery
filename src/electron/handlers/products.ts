import { desc, eq, like, or } from 'drizzle-orm'

import { db } from '../../db'
import { productSchema } from '../../db/schema'
import { Product } from '../../types/product'
import genId from '../../utils/genId'
import normalizeString from '../../utils/normalizeString'
import roundNumber from '../../utils/roundNumber'

export const getProducts = async (search?: string) => {
  const products = await db
    .select()
    .from(productSchema)
    .where(
      search
        ? or(
            like(productSchema.code, `%${search}%`),
            like(productSchema.name, `%${search}%`)
          )
        : undefined
    )
    .orderBy(desc(productSchema.createdAt))
    .limit(30)

  return products
}

export const getProduct = async (search: string) => {
  if (!/\D/.test(search)) {
    const [codeProduct] = await db
      .select()
      .from(productSchema)
      .where(eq(productSchema.code, search))
      .limit(1)

    if (codeProduct) return codeProduct
  }

  const normalized = `%${normalizeString(search).split('').join('%')}%`

  const products = await db
    .select()
    .from(productSchema)
    .where(like(productSchema.name, normalized))
    .orderBy(productSchema.code)

  return products
}

export const deleteProduct = async (id: string) => {
  await db.delete(productSchema).where(eq(productSchema.id, id))
}

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

  const [product] = await db
    .insert(productSchema)
    .values({
      id: genId(),
      code: data.code.trim(),
      name: normalizeString(data.name),
      price: roundNumber(data.price),
      cost: roundNumber(data.cost),
      profit: roundNumber(data.price - data.cost),
      inventory: data.isFractioned ? null : data.inventory,
      isFractioned: (data.isFractioned ? 1 : 0).toString()
    })
    .returning()

  return product
}

export type UpdateProductData = Partial<CreateProductData>

export const updateProduct = async (id: string, data: UpdateProductData) => {
  const [product] = await db
    .select()
    .from(productSchema)
    .where(eq(productSchema.id, id))
    .limit(1)

  if (!product) throw new Error('product not found')

  const nextPrice = data.price ?? product.price
  const nextCost = data.cost ?? product.cost

  if (nextPrice < nextCost) throw new Error('invalid cost')

  const isFractioned = data.isFractioned ?? product.isFractioned

  const newInventory = data.inventory ?? product.inventory

  const updatedProduct: Product = {
    ...product,
    isFractioned: (isFractioned ? 1 : 0).toString(),
    cost: roundNumber(nextCost),
    price: roundNumber(nextPrice),
    name: data.name ? normalizeString(data.name) : product.name,
    code: data.code?.trim() ?? product.code,
    profit: roundNumber(nextPrice - nextCost),
    inventory: isFractioned ? null : newInventory
  }

  await db
    .update(productSchema)
    .set(updatedProduct)
    .where(eq(productSchema.id, id))

  return updatedProduct
}
