"use client";
import React from "react";

import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "./auth/logout-button";

const Header = () => {
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm sm:flex">
      <div className="flex-1 max-w-2xl">
        <Search />
      </div>

      <div className="flex items-center gap-4">
        {user?.id && (
          <FileUploader
            ownerId={user.id}
            className="rounded-lg  text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          />
        )}

        <LogoutButton className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" />
      </div>
    </header>
  );
};

export default Header;
