-- CreateTable
CREATE TABLE "Sell" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "sellAmount" DOUBLE PRECISION NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Sell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "sellAmount" DOUBLE PRECISION NOT NULL,
    "buy_psbt" TEXT NOT NULL,
    "buy_sign_psbt" TEXT,
    "sell_psbt" TEXT,
    "sell_sign_psbt" TEXT,
    "payment_id" TEXT,
    "invoice" TEXT NOT NULL,
    "buyer_address" TEXT NOT NULL,
    "sell_address" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
