import { auth } from "@/auth";
import { files } from "@/data/dummy";
import { db } from "@/lib/db";
import { useSession } from "next-auth/react";

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

export const getFiles = async ({
  types,
  searchText,
  sort,
  userId,
}: {
  types?: FileType[];
  searchText?: string;
  sort?: string;
  userId: string;
}) => {
  const typeMapping: Record<string, string[]> = {
    document: ["pdf", "txt", "json", "csv", "doc", "docx", "xls", "xlsx"],
    images: ["jpg", "jpeg", "png", "gif", "bmp", "svg"],
    media: ["mp4", "avi", "mov", "wmv", "mp3", "wav"],
    others: ["zip", "rar", "exe", "iso"],
  };

  // Convert category names into actual file extensions
  const expandedTypes = types
    ? types.flatMap((type) => {
        console.log(type);
        return typeMapping[type] || type;
      })
    : undefined;

  const aws_files = await db.file.findMany({
    where: {
      ownerId: userId,
      name: searchText
        ? { contains: searchText, mode: "insensitive" }
        : undefined,
      type: expandedTypes ? { in: expandedTypes } : undefined,
      deleted: false,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(aws_files);

  return { documents: aws_files };
};

export const renameFile = ({
  fileId,
  name,
  extension,
  path,
}: {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}) => {};
export const updateFileUsers = ({
  fileId,
  emails,
  path,
}: {
  fileId: string;
  emails: string[];
  path: string;
}) => {};

export const getTotalSpaceUsed = async (userId: string) => {
  const totalSpace = await db.file.groupBy({
    by: ["type"],
    where: {
      ownerId: userId,
    },
    _sum: {
      size: true,
    },
    _max: {
      updatedAt: true,
    },
  });

  console.log(totalSpace);

  // Mapping file types to categories
  const categoryMapping: Record<
    string,
    "documents" | "images" | "video" | "audio" | "others"
  > = {
    pdf: "documents",
    txt: "documents",
    doc: "documents",
    csv: "documents",
    xlsx: "documents",
    jpg: "images",
    jpeg: "images",
    png: "images",
    gif: "images",
    mp4: "video",
    avi: "video",
    mov: "video",
    mkv: "video",
    mp3: "audio",
    wav: "audio",
    flac: "audio",
    aac: "audio",
  };

  const spaceByCategory: Record<
    "documents" | "images" | "video" | "audio" | "others",
    { size: number; latestDate: Date | null }
  > = {
    documents: { size: 0, latestDate: null },
    images: { size: 0, latestDate: null },
    video: { size: 0, latestDate: null },
    audio: { size: 0, latestDate: null },
    others: { size: 0, latestDate: null },
  };

  totalSpace.forEach((item) => {
    const category = categoryMapping[item.type] || "others";
    spaceByCategory[category].size += item._sum.size || 0;

    if (
      !spaceByCategory[category].latestDate ||
      (item._max.updatedAt &&
        item._max.updatedAt > spaceByCategory[category].latestDate!)
    ) {
      spaceByCategory[category].latestDate = item._max.updatedAt;
    }
  });

  return spaceByCategory;
};

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
export async function getUserFiles(userId: string) {
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

export async function deleteFile({
  fileId,
  bucketFileId,
  path,
}: {
  fileId: string;
  bucketFileId: string;
  path: string;
}) {
  return await db.file.update({
    where: { id: fileId },
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });
}

export async function searchFiles(userId: string, searchTerm: string) {
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
