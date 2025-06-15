-- CreateEnum
CREATE TYPE "InterestCategory" AS ENUM ('PROGRAMMING', 'TESTING', 'ANALYTICS_DATA_SCIENCE', 'MANAGEMENT');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "interestId" TEXT;

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InterestCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
