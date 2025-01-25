-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'developer', 'government_official');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Planned', 'InProgress', 'Completed');

-- CreateTable
CREATE TABLE "User" (
    "UserID" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Role" "UserRole" NOT NULL DEFAULT 'user',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "Developer" (
    "DeveloperID" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "ContactInfo" TEXT NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("DeveloperID")
);

-- CreateTable
CREATE TABLE "Project" (
    "ProjectID" UUID NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Status" "ProjectStatus" NOT NULL DEFAULT 'Planned',
    "ProgressPercentage" INTEGER NOT NULL DEFAULT 0,
    "EligibilityCriteria" JSONB NOT NULL,
    "MinCreditScore" INTEGER NOT NULL,
    "InterestRate" DOUBLE PRECISION NOT NULL,
    "DeveloperID" UUID NOT NULL,
    "StartDate" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("ProjectID")
);

-- CreateTable
CREATE TABLE "GISLocation" (
    "GISID" UUID NOT NULL,
    "ProjectID" UUID NOT NULL,
    "Latitude" DOUBLE PRECISION NOT NULL,
    "Longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GISLocation_pkey" PRIMARY KEY ("GISID")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "FeedbackID" UUID NOT NULL,
    "UserID" UUID NOT NULL,
    "ProjectID" UUID NOT NULL,
    "Comments" TEXT NOT NULL,
    "Rating" INTEGER NOT NULL,
    "DateSubmitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("FeedbackID")
);

-- CreateTable
CREATE TABLE "Mortgage" (
    "MortgageID" UUID NOT NULL,
    "UserID" UUID NOT NULL,
    "Income" DOUBLE PRECISION NOT NULL,
    "LoanAmount" DOUBLE PRECISION NOT NULL,
    "InterestRate" DOUBLE PRECISION NOT NULL,
    "LoanTermYears" INTEGER NOT NULL,
    "MonthlyPayment" DOUBLE PRECISION,
    "TotalPayment" DOUBLE PRECISION,
    "TotalInterest" DOUBLE PRECISION,
    "CreditScore" INTEGER NOT NULL,
    "IsEligible" BOOLEAN NOT NULL DEFAULT false,
    "Notes" TEXT,
    "CalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ProjectID" UUID NOT NULL,

    CONSTRAINT "Mortgage_pkey" PRIMARY KEY ("MortgageID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_DeveloperID_fkey" FOREIGN KEY ("DeveloperID") REFERENCES "Developer"("DeveloperID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GISLocation" ADD CONSTRAINT "GISLocation_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mortgage" ADD CONSTRAINT "Mortgage_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mortgage" ADD CONSTRAINT "Mortgage_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project"("ProjectID") ON DELETE RESTRICT ON UPDATE CASCADE;
