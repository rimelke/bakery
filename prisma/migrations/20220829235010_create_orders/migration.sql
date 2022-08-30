-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "itemsAmount" INTEGER NOT NULL,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentTotal" REAL NOT NULL,
    "paymentOver" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "isFractioned" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_products" ("code", "id", "isFractioned", "name", "price") SELECT "code", "id", "isFractioned", "name", "price" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");
