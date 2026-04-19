DO $$ BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'MIXED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';

ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "Seller"
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS "locationVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "trustScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "trustBadge" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "listingCoherenceScore" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "listingCoherenceStatus" TEXT NOT NULL DEFAULT 'needs_review';

CREATE TABLE IF NOT EXISTS "Shipment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "sellerId" TEXT,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
  "transportMode" TEXT NOT NULL DEFAULT 'moto',
  "estimatedMinHours" INTEGER NOT NULL DEFAULT 2,
  "estimatedMaxHours" INTEGER NOT NULL DEFAULT 6,
  "reliability" INTEGER NOT NULL DEFAULT 75,
  "estimatedDeliveryAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_orderId_key" ON "Shipment"("orderId");

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ShipmentEvent" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "status" "ShipmentStatus" NOT NULL,
  "note" TEXT,
  "location" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShipmentEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ShipmentEvent_shipmentId_createdAt_idx" ON "ShipmentEvent"("shipmentId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

