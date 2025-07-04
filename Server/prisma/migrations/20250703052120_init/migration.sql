/*
  Warnings:

  - You are about to drop the column `adminMessage` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `advocate` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `departmentSendTo` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `receivedDate` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Case` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Case" DROP COLUMN "adminMessage",
DROP COLUMN "advocate",
DROP COLUMN "date",
DROP COLUMN "departmentSendTo",
DROP COLUMN "receivedDate",
DROP COLUMN "stage";
