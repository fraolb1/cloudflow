import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { logout } from "@/actions/logout";

function LogoutForm() {
  return (
    <>
      <form
        action={async () => {
          "use server";

          await logout();
        }}
      >
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
}

export default LogoutForm;
