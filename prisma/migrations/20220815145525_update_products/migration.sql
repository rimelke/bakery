/*
  Warnings:

  - Added the required column `code` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isFractioned` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "isFractioned" BOOLEAN NOT NULL
);
INSERT INTO "new_products" ("id", "name") SELECT "id", "name" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
