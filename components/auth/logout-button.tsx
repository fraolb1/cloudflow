"use client";

import { logout } from "@/actions/logout";
import Image from "next/image";
import { Button } from "../ui/button";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = () => {
    logout();
  };

  return (
    <>
      <form action={onClick}>
        <Button type="submit" className="sign-out-button">
          <Image
            src="/assets/icons/logout.svg"
            alt="logo"
            width={24}
            height={24}
            className="w-6"
          />
        </Button>
      </form>
    </>
  );
};
