"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  className?: string;
}

const FileUploader = ({ ownerId, className }: Props) => {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
    const documentTypes = ["pdf", "doc", "docx", "txt"];

    let type = "other";
    if (imageTypes.includes(extension)) type = "image";
    if (documentTypes.includes(extension)) type = "document";

    return { type, extension };
  };

  const uploadToS3 = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);
      formData.append("ownerId", ownerId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      return response.json();
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);

    for (const file of selectedFiles) {
      setUploading((prev) => ({ ...prev, [file.name]: true }));
      try {
        await uploadToS3(file);
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      } finally {
        setUploading((prev) => ({ ...prev, [file.name]: false }));
      }
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  return (
    <div className="flex flex-col gap-4">
      <label className={`inline-flex cursor-pointer ${className}`}>
        <button
          className="px-4 py-2 bg-slate-700 text-white  rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          onClick={() => document.getElementById("file-input")?.click()}
          type="button"
        >
          <Image
            src="/assets/icons/upload.svg"
            alt="upload"
            width={20}
            height={20}
            className=""
          />
          Upload
        </button>
        <input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
      </label>

      {files.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <h4 className="text-sm font-semibold mb-2">
            Uploading {files.length} file(s)
          </h4>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => {
              const { type, extension } = getFileType(file.name);
              return (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded">
                      {type === "image" ? (
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          width={32}
                          height={32}
                          className="object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs uppercase">{extension}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{file.name}</p>
                      {uploading[file.name] && (
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-blue-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.name)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <Image
                      src="/assets/icons/remove.svg"
                      width={16}
                      height={16}
                      alt="Remove"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
