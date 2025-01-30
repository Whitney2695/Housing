/*
  Warnings:

  - A unique constraint covering the columns `[UserID]` on the table `Developer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "UserID" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Developer_UserID_key" ON "Developer"("UserID");

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;
