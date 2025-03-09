"use server";
import { s3Client } from "@/lib/aws";
import { db } from "@/lib/db";
import { CopyObjectCommand, DeleteObjectCommand, S3 } from "@aws-sdk/client-s3";
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

  const expandedTypes = types
    ? types.flatMap((type) => {
        return typeMapping[type] || type;
      })
    : undefined;

  const files = await db.file.findMany({
    where: {
      ownerId: userId,

      name: searchText
        ? { contains: searchText, mode: "insensitive" }
        : undefined,
      type: expandedTypes ? { in: expandedTypes } : undefined,
      deleted: false,
    },
    include: {
      owner: true,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  return { documents: files };
};

export async function renameS3Object(
  bucketName: string,
  oldKey: string,
  newKey: string
) {
  try {
    const copy = await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`,
        Key: newKey,
      })
    );

    const deleted = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: oldKey,
      })
    );

    return { success: true, message: "Object renamed successfully" };
  } catch (error) {
    console.error("Error renaming object:", error);
    return { success: false, error: "Failed to rename object" };
  }
}

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}) => {
  const file = await db.file.findFirst({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    return "No File is Found";
  }

  const key = file.key.split("/");
  key.pop();
  key.push(`${name}`);

  const new_key = key.join("/");

  const change_Aws_name = await renameS3Object(
    process.env.AWS_S3_BUCKET || "",
    file.key,
    new_key.toString()
  );

  if (!change_Aws_name.success) {
    return "Unseccusseful";
  }
  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${new_key}`;
  return await db.file.update({
    where: {
      id: fileId,
    },
    data: {
      name: name,
      key: new_key,
      url: fileUrl,
    },
  });
};

export const updateFileUsers = async ({
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
