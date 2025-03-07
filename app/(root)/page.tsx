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
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:gap-10">
      <section>
        <Chart used={totalSize * 100} />

        {/* Uploaded file type summaries */}
        <ul className="mt-6 grid grid-cols-1 gap-6 xl:mt-10 xl:grid-cols-2 xl:gap-10">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative space-y-5">
                {/* Floating Image */}
                <Image
                  src={summary.icon}
                  width={100}
                  height={100}
                  alt="uploaded image"
                  className="absolute -top-6 -left-4 z-10 w-40 object-contain"
                />

                {/* File Size */}
                <h4 className="relative z-20 text-right text-lg font-semibold text-gray-700">
                  {convertFileSize(summary.size) || 0}
                </h4>

                {/* Title */}
                <h5 className="relative z-20 text-center text-xl font-bold text-gray-900">
                  {summary.title}
                </h5>

                {/* Separator */}
                <Separator className="bg-gray-300" />

                {/* Date */}
                <FormattedDateTime
                  date={summary.latestDate}
                  className="block text-center text-sm text-gray-500"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="h-full rounded-[20px] bg-white p-5 xl:p-8">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.map((file: any) => (
              <Link
                href={getFileTypes(file.type)}
                target="_blank"
                className="flex items-center gap-3"
                key={file.id}
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="flex w-full flex-col xl:flex-row xl:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="flex w-full flex-col xl:flex-row xl:justify-between">
                      {file.name}
                    </p>
                    <FormattedDateTime
                      date={file.createdAt}
                      className="text-[12px] leading-[16px] font-normal"
                    />
                  </div>
                  <ActionDropdown file={file} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="body-1 mt-10 text-center text-light-200">
            No files uploaded
          </p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
