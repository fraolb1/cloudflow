"use server";

import { files } from "@/data/dummy";
import { User } from "next-auth";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  //  todo
};

const createQueries = (
  currentUser: User,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  //   todo
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  return files;
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  //   todo
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  //   todo
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  //
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  //   todo
}
