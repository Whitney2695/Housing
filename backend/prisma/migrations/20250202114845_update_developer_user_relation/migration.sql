/*
  Warnings:

  - Made the column `UserID` on table `Developer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Developer" DROP CONSTRAINT "Developer_UserID_fkey";

-- AlterTable
ALTER TABLE "Developer" ALTER COLUMN "UserID" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
