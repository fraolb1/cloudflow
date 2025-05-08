"use client";

import { logout } from "@/actions/logout";
import Image from "next/image";
import { Button } from "../ui/button";

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export const LogoutButton = ({ children, className }: LogoutButtonProps) => {
  const onClick = () => {
    logout();
  };

  return (
    <>
      <form action={onClick} className={className}>
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
