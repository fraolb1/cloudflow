import React from "react";
import Image from "next/image";
import { cn, getFileIcon, getFileTypes } from "@/lib/utils";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  const general_type = getFileTypes(type);
  const isImage = type === "images" && extension !== "svg";

  console.log(getFileTypes(type), url);

  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={getFileIcon(extension, general_type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};
export default Thumbnail;
