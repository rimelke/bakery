import { InferSelectModel } from 'drizzle-orm'

import { orderItemSchema, orderSchema } from '../db/schema'

export type OrderItem = InferSelectModel<typeof orderItemSchema>

export type Order = InferSelectModel<typeof orderSchema>
