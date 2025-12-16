import { InferSelectModel } from 'drizzle-orm'

import { productSchema } from '../db/schema'

export type Product = InferSelectModel<typeof productSchema>
