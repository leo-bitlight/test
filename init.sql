-- CreateTable
CREATE TABLE "Sell" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "sellAmount" INTEGER NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Sell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "buy_psbt" TEXT NOT NULL,
    "buy_sign_psbt" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice" TEXT NOT NULL,
    "buyer_address" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

