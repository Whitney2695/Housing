/*
  Warnings:

  - You are about to drop the column `ProjectID` on the `Mortgage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mortgage" DROP CONSTRAINT "Mortgage_ProjectID_fkey";

-- AlterTable
ALTER TABLE "Mortgage" DROP COLUMN "ProjectID",
ADD COLUMN     "projectId" UUID;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ResetCode" TEXT,
ADD COLUMN     "ResetCodeExpiry" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Mortgage" ADD CONSTRAINT "Mortgage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("ProjectID") ON DELETE SET NULL ON UPDATE CASCADE;
