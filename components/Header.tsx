"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { logout } from "@/actions/logout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "./auth/logout-button";
import { UserButton } from "./auth/user-button";
import Bucket_files_deleter from "./Bucket_files_deleter";

const Header = () => {
  const user = useCurrentUser();

  return (
    <header className="hidden items-center justify-between gap-5 p-5 sm:flex lg:py-7 xl:gap-10">
      <Search />
      <div className="flex-center min-w-fit gap-4 flex">
        {user?.id && <FileUploader ownerId={user.id} />}
        <LogoutButton />
      </div>
    </header>
  );
};
export default Header;
