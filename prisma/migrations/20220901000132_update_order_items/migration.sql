/*
  Warnings:

  - Added the required column `itemCode` to the `orderItems` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orderItems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "itemCode" INTEGER NOT NULL,
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
INSERT INTO "new_orderItems" ("amount", "code", "cost", "costTotal", "id", "name", "orderId", "price", "productId", "profit", "profitTotal", "subtotal") SELECT "amount", "code", "cost", "costTotal", "id", "name", "orderId", "price", "productId", "profit", "profitTotal", "subtotal" FROM "orderItems";
DROP TABLE "orderItems";
ALTER TABLE "new_orderItems" RENAME TO "orderItems";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
