-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateOfApplication" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "addAt" TEXT NOT NULL,
    "receivedDate" TEXT NOT NULL,
    "departmentInOut" TEXT NOT NULL,
    "departmentSendTo" TEXT,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "adminMessage" TEXT,
    "advocate" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "stage" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
