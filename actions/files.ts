import { files } from "@/data/dummy";
import { db } from "@/lib/db";

// types/file.ts
export type File = {
  id: string;
  name: string;
  key: string;
  url: string;
  size: number;
  type: string;
  extension: string | null;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  path: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  folderId: string | null;
  deleted: boolean;
  deletedAt: Date | null;
};

export const getFiles = (type: any[], limit: number) => {
  return files;
};

export const getTotalSpaceUsed = () => {
  return "";
};

// Create a file record
export async function createFileRecord(fileData: {
  name: string;
  key: string;
  url: string;
  size: number;
  type: string;
  ownerId: string;
}) {
  return await db.file.create({
    data: {
      ...fileData,
      extension: fileData.name.split(".").pop() || null,
    },
  });
}

// Get user's files
async function getUserFiles(userId: string) {
  return await db.file.findMany({
    where: {
      ownerId: userId,
      deleted: false,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Soft delete a file
async function deleteFile(fileId: string) {
  return await db.file.update({
    where: { id: fileId },
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });
}

async function getFolderFiles(folderId: string) {
  return await db.file.findMany({
    where: {
      folderId,
      deleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Search files
async function searchFiles(userId: string, searchTerm: string) {
  return await db.file.findMany({
    where: {
      ownerId: userId,
      deleted: false,
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { type: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
  });
}
