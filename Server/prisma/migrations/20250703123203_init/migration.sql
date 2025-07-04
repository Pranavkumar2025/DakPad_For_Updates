/*
  Warnings:

  - The primary key for the `Case` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Case` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Timeline` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `dateOfApplication` on the `Case` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `addAt` on table `Case` required. This step will fail if there are existing NULL values in that column.
  - Made the column `caseType` on table `Case` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_caseId_fkey";

-- DropForeignKey
ALTER TABLE "Timeline" DROP CONSTRAINT "Timeline_caseId_fkey";

-- AlterTable
ALTER TABLE "Case" DROP CONSTRAINT "Case_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "dateOfApplication",
ADD COLUMN     "dateOfApplication" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "addAt" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Pending',
ALTER COLUMN "caseType" SET NOT NULL,
ADD CONSTRAINT "Case_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Timeline";
