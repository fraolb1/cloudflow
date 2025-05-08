"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";

const Sidebar = () => {
  const pathname = usePathname();
  const user = useCurrentUser();

  if (!user) return redirect("/sign-in");

  return (
    <aside className="hidden h-screen flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm sm:flex transition-all duration-300 ease-in-out w-24 lg:w-64 xl:w-72">
      {/* Logo Section */}
      <div className="px-6 py-5">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start"
        >
          <Image
            src="/assets/images/folder_logo.png"
            alt="logo"
            width={40}
            height={40}
            className="h-10 w-auto transition-transform duration-200 hover:scale-105"
          />
          <span className="ml-3 hidden text-xl font-semibold text-gray-800 lg:block">
            FileVault
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ url, name, icon }) => (
            <li key={name}>
              <Link
                href={url}
                className={cn(
                  "group flex items-center rounded-xl p-3 transition-all duration-300 ease-in-out",
                  pathname === url
                    ? "bg-indigo-100 text-indigo-600 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg shadow-inner",
                    pathname === url
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                  )}
                >
                  <Image
                    src={icon}
                    alt={name}
                    width={20}
                    height={20}
                    className={cn(
                      "w-5 h-5",
                      pathname === url ? "invert" : "invert"
                    )}
                  />
                </div>
                <span className="ml-4 hidden lg:block tracking-wide">
                  {name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Decorative Image */}
      <div className="px-4 pb-4 hidden lg:block">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
          <Image
            src="/assets/images/file-folder.jpg"
            alt="File organization"
            width={400}
            height={300}
            className="w-full rounded-lg object-cover shadow-inner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
          <div className="relative mt-3 text-center">
            <p className="text-sm font-medium text-indigo-600">
              Need more space?
            </p>
            <p className="text-xs text-gray-500">Upgrade your storage plan</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors duration-200">
          <Image
            src={user?.image || "/assets/images/default-avatar.png"}
            alt="User avatar"
            width={40}
            height={40}
            className="aspect-square w-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="hidden lg:block overflow-hidden">
            <p className="truncate font-medium text-gray-800 capitalize">
              {user?.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
