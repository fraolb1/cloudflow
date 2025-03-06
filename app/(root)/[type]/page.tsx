import React from "react";
import Sort from "@/components/Sort";
import { getFiles } from "@/actions/files";
import Card from "@/components/Card";
import { getFileTypesParams } from "@/lib/utils";
import { auth } from "@/auth";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];

  const user = await auth();
  const userId = user?.user.id ?? "";

  const files = await getFiles({ types, searchText, sort, userId });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 ">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="flex mt-2 flex-col justify-between sm:flex-row sm:items-center">
          <p className="body-1">
            Total: <span className="h5">0 MB</span>
          </p>

          <div className="mt-5 flex items-center sm:mt-0 sm:gap-3">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.documents.length > 0 ? (
        <section className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.documents.map((file: any) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;
