-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "network" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Sell" ADD COLUMN     "network" TEXT NOT NULL DEFAULT '';
