import { products as Product } from '@prisma/client'

interface BasicOrderItem {
  code: string
  amount: number
  subtotal: number
  product: Product
}

export default BasicOrderItem
