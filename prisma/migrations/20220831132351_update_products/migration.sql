/*
  Warnings:

  - Made the column `cost` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profit` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "profit" REAL NOT NULL,
    "isFractioned" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_products" ("code", "cost", "createdAt", "id", "isFractioned", "name", "price", "profit", "updatedAt") SELECT "code", "cost", "createdAt", "id", "isFractioned", "name", "price", "profit", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
