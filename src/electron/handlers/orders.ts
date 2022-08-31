import { PaymentMethod } from '../../constants/paymentMethods'
import BasicOrderItem from '../../types/BasicOrderItem'
import genId from '../../utils/genId'
import roundNumber from '../../utils/roundNumber'
import prisma from '../prisma'

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

  const x = await prisma.orders.create({
    data: {
      code,
      id: genId(),
      itemsAmount: items.length,
      paymentMethod,
      paymentTotal: roundNumber(paymentTotal || total),
      total: roundNumber(total),
      paymentOver: paymentTotal ? roundNumber(paymentTotal - total) : null,
      orderItems: {
        create: items.map((item) => {
          const costTotal = roundNumber(item.product.cost * item.amount)
          orderCost += costTotal

          const profitTotal = roundNumber(item.product.profit * item.amount)
          orderProfit += profitTotal

          return {
            id: genId(),
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
  })

  return x
}
