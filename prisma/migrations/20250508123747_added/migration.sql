-- CreateEnum
CREATE TYPE "FilePermission" AS ENUM ('VIEW', 'EDIT', 'MANAGE');

-- CreateTable
CREATE TABLE "FileShare" (
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "FilePermission" NOT NULL DEFAULT 'VIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("fileId","userId")
);

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
