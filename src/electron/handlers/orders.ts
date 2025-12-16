import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'

import { PaymentMethod } from '../../constants/paymentMethods'
import { db } from '../../db'
import { orderItemSchema, orderSchema, productSchema } from '../../db/schema'
import BasicOrderItem from '../../types/BasicOrderItem'
import { OrderItem } from '../../types/order'
import genId from '../../utils/genId'
import roundNumber from '../../utils/roundNumber'

export const getOrder = async (id: string) =>
  db.query.orderSchema.findFirst({
    where: eq(orderSchema.id, id),
    with: {
      orderItems: {
        orderBy: asc(orderItemSchema.itemCode)
      }
    }
  })

export interface GetOrdersParams {
  startDate?: string
  endDate?: string
  paymentMethod?: PaymentMethod
}

export const getOrders = ({
  endDate,
  paymentMethod,
  startDate
}: GetOrdersParams = {}) =>
  db.query.orderSchema.findMany({
    where:
      paymentMethod || startDate || endDate
        ? and(
            paymentMethod
              ? eq(orderSchema.paymentMethod, paymentMethod)
              : undefined,
            startDate
              ? gte(orderSchema.createdAt, new Date(startDate))
              : undefined,
            endDate ? lte(orderSchema.createdAt, new Date(endDate)) : undefined
          )
        : undefined,
    limit: 30,
    orderBy: [desc(orderSchema.createdAt)]
  })

interface CreateOrderData {
  items: BasicOrderItem[]
  paymentMethod: PaymentMethod
  paymentTotal?: number
}

export const createOrder = async ({
  items,
  paymentMethod,
  paymentTotal
}: CreateOrderData) => {
  if (items.length < 1) throw new Error('Items must have at least 1 item')

  const lastOrder = await db.query.orderSchema.findFirst({
    orderBy: desc(orderSchema.code)
  })

  const code = lastOrder ? lastOrder.code + 1 : 1

  let total = 0
  let orderCost = 0
  let orderProfit = 0

  const orderItems: OrderItem[] = []

  const orderId = genId()

  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    total += item.subtotal

    const costTotal = roundNumber(item.product.cost * item.amount)
    orderCost += costTotal

    const profitTotal = roundNumber(item.product.profit * item.amount)
    orderProfit += profitTotal

    orderItems.push({
      id: genId(),
      itemCode: index + 1,
      amount: roundNumber(item.amount, 3),
      code: item.product.code,
      name: item.product.name,
      price: roundNumber(item.product.price),
      subtotal: roundNumber(item.subtotal),
      productId: item.product.id,
      cost: roundNumber(item.product.cost),
      costTotal,
      profit: roundNumber(item.product.profit),
      profitTotal,
      orderId
    })
  }

  const now = new Date()

  await Promise.all([
    db.insert(orderSchema).values({
      code,
      id: orderId,
      itemsAmount: items.length,
      paymentMethod,
      paymentTotal: roundNumber(paymentTotal || total),
      total: roundNumber(total),
      paymentOver: paymentTotal ? roundNumber(paymentTotal - total) : null,
      cost: roundNumber(orderCost),
      profit: roundNumber(orderProfit),
      createdAt: now,
      updatedAt: now
    }),
    db.insert(orderItemSchema).values(orderItems),
    ...items
      .filter((item) => !item.product.isFractioned)
      .map((item) =>
        db
          .update(productSchema)
          .set({
            inventory: sql`${productSchema.inventory} - ${item.amount}`
          })
          .where(eq(productSchema.id, item.product.id))
      )
  ])
}

export interface GetOrdersBalanceParams {
  startDate?: string
  endDate?: string
}

interface OrderBalanceItem {
  code: string
  name: string
  amount: number
}

export interface OrdersBalance {
  ordersAmount: number
  profitTotal: number
  ordersTotal: number
  items: OrderBalanceItem[]
}

export const getOrdersBalance = async ({
  endDate,
  startDate
}: GetOrdersBalanceParams): Promise<OrdersBalance> => {
  const whereClause =
    startDate || endDate
      ? and(
          startDate
            ? gte(orderSchema.createdAt, new Date(startDate))
            : undefined,
          endDate ? lte(orderSchema.createdAt, new Date(endDate)) : undefined
        )
      : undefined

  const ordersAggregate = db
    .select({
      ordersAmount: sql`count(*)`.mapWith(Number),
      profitTotal: sql`sum(${orderSchema.profit})`.mapWith(Number),
      ordersTotal: sql`sum(${orderSchema.total})`.mapWith(Number)
    })
    .from(orderSchema)
    .where(whereClause)

  const itemsQuery = db
    .select({
      amount: sql`sum(${orderItemSchema.amount})`.mapWith(Number),
      code: orderItemSchema.code,
      name: orderItemSchema.name
    })
    .from(orderItemSchema)
    .innerJoin(orderSchema, sql`${orderItemSchema.orderId} = ${orderSchema.id}`)
    .where(whereClause)
    .groupBy(orderItemSchema.code)
    .orderBy(sql`amount DESC`)

  const [[{ ordersAmount, profitTotal, ordersTotal }], items] =
    await Promise.all([ordersAggregate, itemsQuery])

  return {
    ordersAmount,
    profitTotal: profitTotal ?? 0,
    ordersTotal: ordersTotal ?? 0,
    items
  }
}
