import { PaymentMethod } from '../../constants/paymentMethods'
import BasicOrderItem from '../../types/BasicOrderItem'
import genId from '../../utils/genId'
import roundNumber from '../../utils/roundNumber'
import prisma from '../prisma'

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
        create: items.map((item) => ({
          id: genId(),
          amount: roundNumber(item.amount, 3),
          code: item.product.code,
          name: item.product.name,
          price: roundNumber(item.product.price),
          subtotal: roundNumber(item.subtotal),
          productId: item.product.id
        }))
      }
    }
  })

  return x
}
