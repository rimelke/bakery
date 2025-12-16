import { Product } from './product'

interface BasicOrderItem {
  code: string
  amount: number
  subtotal: number
  product: Product
}

export default BasicOrderItem
