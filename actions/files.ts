"use server";
import { s3Client } from "@/lib/aws";
import { db } from "@/lib/db";
import { CopyObjectCommand, DeleteObjectCommand, S3 } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

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
  take = 10,
}: {
  types?: any[];
  searchText?: string;
  sort?: string;
  userId: string;
  take?: number;
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
      extension: expandedTypes ? { in: expandedTypes } : undefined,
      deleted: false,
    },
    include: {
      owner: true,
    },
    take,
    orderBy: {
      createdAt: sort === "asc" ? "asc" : "desc",
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
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`,
        Key: newKey,
      })
    );

    await s3Client.send(
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
  try {
    const file = await db.file.findFirst({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      throw new Error("File not found");
    }

    const keyParts = file.key.split("/");
    keyParts.pop();
    const newKey = [...keyParts, `${name}.${extension}`].join("/");

    const changeAwsName = await renameS3Object(
      process.env.AWS_S3_BUCKET || "",
      file.key,
      newKey
    );

    if (!changeAwsName.success) {
      throw new Error("Failed to rename file in S3");
    }

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;

    const updatedFile = await db.file.update({
      where: {
        id: fileId,
      },
      data: {
        name: `${name}.${extension}`,
        key: newKey,
        url: fileUrl,
        extension,
      },
    });

    revalidatePath(path);
    return updatedFile;
  } catch (error) {
    console.error("Error renaming file:", error);
    throw error;
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: {
  fileId: string;
  emails: string[];
  path: string;
}) => {
  try {
    // First, verify the file exists
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Find users with the provided emails
    const users = await db.user.findMany({
      where: {
        email: { in: emails },
      },
    });

    // Create file shares for each user
    const fileShares = await Promise.all(
      users.map(async (user) => {
        return db.fileShare.upsert({
          where: {
            fileId_userId: {
              fileId,
              userId: user.id,
            },
          },
          create: {
            fileId,
            userId: user.id,
            permission: "VIEW",
          },
          update: {},
        });
      })
    );

    revalidatePath(path);
    return fileShares;
  } catch (error) {
    console.error("Error updating file users:", error);
    throw error;
  }
};

export const getTotalSpaceUsed = async (userId: string) => {
  const totalSpace = await db.file.groupBy({
    by: ["type"],
    where: {
      ownerId: userId,
      deleted: false,
    },
    _sum: {
      size: true,
    },
    _max: {
      updatedAt: true,
    },
  });

  const categoryMapping: Record<
    string,
    "documents" | "images" | "video" | "audio" | "others"
  > = {
    pdf: "documents",
    txt: "documents",
    doc: "documents",
    docx: "documents",
    csv: "documents",
    xls: "documents",
    xlsx: "documents",
    jpg: "images",
    jpeg: "images",
    png: "images",
    gif: "images",
    bmp: "images",
    svg: "images",
    mp4: "video",
    avi: "video",
    mov: "video",
    wmv: "video",
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
  folderId?: string | null;
}) {
  const extension = fileData.name.split(".").pop() || null;

  return await db.file.create({
    data: {
      ...fileData,
      extension,
      status: "COMPLETED",
    },
  });
}

export async function getUserFiles(userId: string, folderId?: string | null) {
  return await db.file.findMany({
    where: {
      ownerId: userId,
      deleted: false,
      folderId: folderId === undefined ? undefined : folderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteFile({
  fileId,
  path,
}: {
  fileId: string;
  path: string;
}) {
  try {
    const deletedFile = await db.file.update({
      where: { id: fileId },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    revalidatePath(path);
    return deletedFile;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFileById(fileId: string) {
  return await db.file.findUnique({
    where: { id: fileId },
  });
}

export async function getSharedFiles(userId: string) {
  return await db.fileShare.findMany({
    where: {
      userId,
    },
    include: {
      file: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function moveFile({
  fileId,
  folderId,
  path,
}: {
  fileId: string;
  folderId: string | null;
  path: string;
}) {
  try {
    const updatedFile = await db.file.update({
      where: { id: fileId },
      data: {
        folderId,
      },
    });

    revalidatePath(path);
    return updatedFile;
  } catch (error) {
    console.error("Error moving file:", error);
    throw error;
  }
}
