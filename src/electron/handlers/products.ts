import { desc, eq, like, or } from 'drizzle-orm'

import { db } from '../../db'
import { productSchema } from '../../db/schema'
import { Product } from '../../types/product'
import genId from '../../utils/genId'
import normalizeString from '../../utils/normalizeString'
import roundNumber from '../../utils/roundNumber'

export const getProducts = async (search?: string) => {
  const normalized =
    search && `%${normalizeString(search).split('').join('%')}%`

  const products = await db
    .select()
    .from(productSchema)
    .where(
      normalized
        ? or(
            like(productSchema.code, normalized),
            like(productSchema.name, normalized)
          )
        : undefined
    )
    .orderBy(desc(productSchema.createdAt))
    .limit(30)

  return products
}

export const getProduct = async (search: string) => {
  const [codeProduct] = await db
    .select()
    .from(productSchema)
    .where(eq(productSchema.code, search.toUpperCase().trim()))
    .limit(1)

  if (codeProduct) return codeProduct

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
  cost?: number
  isFractioned: boolean
  inventory: number
}

export const createProduct = async (data: CreateProductData) => {
  if (typeof data.cost === 'number' && data.price < data.cost)
    throw new Error('invalid cost')

  const now = new Date()

  const [product] = await db
    .insert(productSchema)
    .values({
      id: genId(),
      code: data.code.trim(),
      name: normalizeString(data.name),
      price: roundNumber(data.price),
      cost: typeof data.cost === 'number' ? roundNumber(data.cost) : null,
      profit:
        typeof data.cost === 'number'
          ? roundNumber(data.price - data.cost)
          : null,
      inventory: data.isFractioned ? null : data.inventory,
      isFractioned: data.isFractioned,
      createdAt: now,
      updatedAt: now
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

  if (typeof data.cost === 'number' && nextPrice < data.cost)
    throw new Error('invalid cost')

  const isFractioned = data.isFractioned ?? product.isFractioned

  const newInventory = data.inventory ?? product.inventory

  const updatedProduct: Product = {
    ...product,
    updatedAt: new Date(),
    isFractioned,
    cost: typeof data.cost === 'number' ? roundNumber(data.cost) : null,
    price: roundNumber(nextPrice),
    name: data.name ? normalizeString(data.name) : product.name,
    code: data.code?.trim() ?? product.code,
    profit:
      typeof data.cost === 'number' ? roundNumber(nextPrice - data.cost) : null,
    inventory: isFractioned ? null : newInventory
  }

  await db
    .update(productSchema)
    .set(updatedProduct)
    .where(eq(productSchema.id, id))

  return updatedProduct
}
