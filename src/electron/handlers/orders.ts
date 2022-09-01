import { PaymentMethod } from '../../constants/paymentMethods'
import BasicOrderItem from '../../types/BasicOrderItem'
import genId from '../../utils/genId'
import roundNumber from '../../utils/roundNumber'
import prisma from '../prisma'
import { Prisma } from '@prisma/client'

export const getOrder = async (id: string) =>
  prisma.orders.findUnique({
    where: { id },
    include: { orderItems: { orderBy: { itemCode: 'asc' } } }
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
  prisma.orders.findMany({
    where: {
      paymentMethod,
      createdAt: {
        lte: endDate && new Date(endDate),
        gte: startDate && new Date(startDate)
      }
    },
    take: 30,
    orderBy: { createdAt: 'desc' }
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

  const lastOrder = await prisma.orders.findFirst({ orderBy: { code: 'desc' } })

  const code = lastOrder ? lastOrder.code + 1 : 1
  const total = items.reduce((acc, item) => acc + item.subtotal, 0)

  let orderCost = 0
  let orderProfit = 0

  await prisma.$transaction([
    prisma.orders.create({
      data: {
        code,
        id: genId(),
        itemsAmount: items.length,
        paymentMethod,
        paymentTotal: roundNumber(paymentTotal || total),
        total: roundNumber(total),
        paymentOver: paymentTotal ? roundNumber(paymentTotal - total) : null,
        orderItems: {
          create: items.map((item, index) => {
            const costTotal = roundNumber(item.product.cost * item.amount)
            orderCost += costTotal

            const profitTotal = roundNumber(item.product.profit * item.amount)
            orderProfit += profitTotal

            return {
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
              profitTotal
            }
          })
        },
        cost: roundNumber(orderCost),
        profit: roundNumber(orderProfit)
      }
    }),
    ...items
      .filter((item) => !item.product.isFractioned)
      .map((item) =>
        prisma.products.update({
          where: { id: item.product.id },
          data: { inventory: { decrement: item.amount } }
        })
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
  const [
    {
      _count: ordersAmount,
      _sum: { profit: profitTotal, total: ordersTotal }
    },
    items
  ] = await Promise.all([
    prisma.orders.aggregate({
      _count: true,
      _sum: { total: true, profit: true },
      where: {
        createdAt: {
          lte: endDate ? new Date(endDate) : undefined,
          gte: startDate ? new Date(startDate) : undefined
        }
      }
    }),
    prisma.$queryRaw<
      OrderBalanceItem[]
    >`SELECT Sum(i.amount) AS amount, i.code, i.name FROM  orderitems i JOIN orders o ON i.orderId = o.id ${
      startDate || endDate ? Prisma.sql`WHERE` : Prisma.empty
    }  ${
      startDate
        ? Prisma.sql`o.createdAt >= ${new Date(startDate).getTime()}`
        : Prisma.empty
    } ${startDate && endDate ? Prisma.sql`AND` : Prisma.empty} ${
      endDate
        ? Prisma.sql`o.createdAt <= ${new Date(endDate).getTime()}`
        : Prisma.empty
    } GROUP  BY i.code ORDER  BY amount DESC`
  ])

  return {
    ordersAmount,
    profitTotal: profitTotal ?? 0,
    ordersTotal: ordersTotal ?? 0,
    items
  }
}
