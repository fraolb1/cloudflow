import Image from "next/image";
import Link from "next/link";

import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/actions/files";
import { convertFileSize, getFileTypes, getUsageSummary } from "@/lib/utils";
import { auth } from "@/auth";

const Dashboard = async () => {
  const user = await auth();
  const [files, totalSpace] = await Promise.all([
    getFiles({ userId: user?.user.id ?? "" }),
    getTotalSpaceUsed(user?.user.id ?? ""),
  ]);

  const usageSummary = getUsageSummary(totalSpace);
  const totalSize = Object.values(totalSpace).reduce(
    (sum, category) => sum + category.size,
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's your storage overview.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column - Storage Overview */}
        <section className="space-y-8">
          {/* Storage Chart */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Storage Overview
            </h2>
            <Chart used={totalSize * 3000} />
          </div>

          {/* File Type Summaries */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              File Categories
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {usageSummary.map((summary) => (
                <Link
                  href={summary.url}
                  key={summary.title}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="relative z-10 flex h-full flex-col">
                    {/* Icon */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
                      <Image
                        src={summary.icon}
                        width={24}
                        height={24}
                        alt={summary.title}
                        className="h-6 w-6 text-indigo-600"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium text-gray-900">
                      {summary.title}
                    </h3>

                    {/* Size */}
                    <p className="mt-1 text-sm text-gray-500">
                      {convertFileSize(summary.size) || "0 MB"}
                    </p>

                    {/* Separator */}
                    <Separator className="my-3 bg-gray-100" />

                    {/* Date */}
                    <div className="mt-auto">
                      <FormattedDateTime
                        date={summary.latestDate}
                        className="text-xs text-gray-400"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column - Recent Files */}
        <section>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Files
              </h2>
              <Link
                href="/files"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>

            {files.documents.length > 0 ? (
              <ul className="mt-6 divide-y divide-gray-100">
                {files.documents.map((file: any) => (
                  <li key={file.id} className="py-4 first:pt-0 last:pb-0">
                    <Link
                      href={getFileTypes(file.type)}
                      target="_blank"
                      className="group flex items-center gap-3 transition-colors hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg"
                    >
                      <Thumbnail
                        type={file.type}
                        extension={file.extension}
                        url={file.url}
                        className="h-10 w-10 flex-shrink-0"
                      />

                      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                            {file.name}
                          </p>
                          <FormattedDateTime
                            date={file.createdAt}
                            className="text-xs text-gray-500"
                          />
                        </div>
                        <ActionDropdown file={file} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
                <Image
                  src="/icons/empty-folder.svg"
                  width={64}
                  height={64}
                  alt="No files"
                  className="h-16 w-16 text-gray-300"
                />
                <p className="mt-4 text-sm text-gray-500">
                  No files uploaded yet
                </p>
                <Link
                  href="/upload"
                  className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
                >
                  Upload Files
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
