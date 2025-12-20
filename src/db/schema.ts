import { relations } from 'drizzle-orm'
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

export const orderSchema = sqliteTable(
  'orders',
  {
    id: text().primaryKey().notNull(),
    code: integer().notNull(),
    itemsAmount: integer().notNull(),
    total: real().notNull(),
    paymentMethod: text().notNull(),
    paymentTotal: real().notNull(),
    paymentOver: real(),
    cost: real().notNull(),
    profit: real().notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer({ mode: 'timestamp_ms' }).notNull(),
    deletedAt: integer({ mode: 'timestamp_ms' })
  },
  (table) => [uniqueIndex('orders_code_key').on(table.code)]
)

export const productSchema = sqliteTable(
  'products',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    price: real().notNull(),
    cost: real(),
    profit: real(),
    isFractioned: integer({ mode: 'boolean' }).notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer({ mode: 'timestamp_ms' }).notNull(),
    inventory: integer()
  },
  (table) => [uniqueIndex('products_code_key').on(table.code)]
)

export const orderItemSchema = sqliteTable('orderItems', {
  id: text().primaryKey().notNull(),
  orderId: text()
    .notNull()
    .references(() => orderSchema.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  productId: text().references(() => productSchema.id, {
    onDelete: 'set null',
    onUpdate: 'cascade'
  }),
  itemCode: integer().notNull(),
  code: text().notNull(),
  name: text().notNull(),
  amount: real().notNull(),
  price: real().notNull(),
  subtotal: real().notNull(),
  cost: real(),
  costTotal: real(),
  profit: real(),
  profitTotal: real()
})

export const orderItemsRelations = relations(orderItemSchema, ({ one }) => ({
  product: one(productSchema, {
    fields: [orderItemSchema.productId],
    references: [productSchema.id]
  }),
  order: one(orderSchema, {
    fields: [orderItemSchema.orderId],
    references: [orderSchema.id]
  })
}))

export const productsRelations = relations(productSchema, ({ many }) => ({
  orderItems: many(orderItemSchema)
}))

export const ordersRelations = relations(orderSchema, ({ many }) => ({
  orderItems: many(orderItemSchema)
}))
