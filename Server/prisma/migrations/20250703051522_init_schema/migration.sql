/*
  Warnings:

  - Added the required column `phone` to the `Case` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "dateOfApplication" SET DATA TYPE TEXT,
ALTER COLUMN "addAt" DROP NOT NULL,
ALTER COLUMN "receivedDate" DROP NOT NULL,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "advocate" DROP NOT NULL,
ALTER COLUMN "caseType" DROP NOT NULL,
ALTER COLUMN "stage" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
