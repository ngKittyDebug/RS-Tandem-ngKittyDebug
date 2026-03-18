-- CreateTable
CREATE TABLE "storages" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "storage" JSONB NOT NULL,

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "storages_key_key" ON "storages"("key");
