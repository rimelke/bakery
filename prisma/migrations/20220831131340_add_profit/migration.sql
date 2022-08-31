/*
  Warnings:

  - Added the required column `cost` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costTotal` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitTotal` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cost` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN "cost" REAL;
ALTER TABLE "products" ADD COLUMN "profit" REAL;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orderItems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "price" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "costTotal" REAL NOT NULL,
    "profit" REAL NOT NULL,
    "profitTotal" REAL NOT NULL,
    CONSTRAINT "orderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orderItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orderItems" ("amount", "code", "id", "name", "orderId", "price", "productId", "subtotal") SELECT "amount", "code", "id", "name", "orderId", "price", "productId", "subtotal" FROM "orderItems";
DROP TABLE "orderItems";
ALTER TABLE "new_orderItems" RENAME TO "orderItems";
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "itemsAmount" INTEGER NOT NULL,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentTotal" REAL NOT NULL,
    "paymentOver" REAL,
    "cost" REAL NOT NULL,
    "profit" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_orders" ("code", "createdAt", "id", "itemsAmount", "paymentMethod", "paymentOver", "paymentTotal", "total", "updatedAt") SELECT "code", "createdAt", "id", "itemsAmount", "paymentMethod", "paymentOver", "paymentTotal", "total", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
