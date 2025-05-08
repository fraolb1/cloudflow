"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/actions/files";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { useDebounce } from "use-debounce";
import { useCurrentUser } from "@/hooks/use-current-user";

import { SearchIcon, XIcon, Loader2 } from "lucide-react";

const Search = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [debouncedQuery] = useDebounce(query, 500);
  const user = useCurrentUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchFiles = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const files = await getFiles({
          types: [],
          searchText: debouncedQuery,
          userId: user?.id ?? "",
        });
        setResults(files.documents);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [debouncedQuery, user?.id]);

  // Clear search when route changes
  useEffect(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }, [pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value === "") {
      setResults([]);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const navigateToFile = (file: any) => {
    setIsOpen(false);
    router.push(
      `/${file.type === "image" ? "images" : file.type + "s"}?id=${file.$id}`
    );
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchContainerRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <SearchIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <Input
          value={query}
          placeholder="Search files..."
          className="pl-10 pr-10 py-6 rounded-full border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          onChange={handleSearchChange}
          onFocus={() => query && setIsOpen(true)}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-auto py-1">
              {results.map((file) => (
                <li
                  key={file.$id}
                  className="cursor-pointer px-4 py-3 hover:bg-gray-50"
                  onClick={() => navigateToFile(file)}
                >
                  <div className="flex items-center gap-3">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="h-10 w-10 flex-shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{convertFileSize(file.size)}</span>
                        <span>•</span>
                        <FormattedDateTime
                          date={file.$createdAt}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">
                {isLoading ? "Searching..." : "No files found"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function convertFileSize(bytes: number): string {
  // Your existing implementation
  return "";
}

export default Search;
