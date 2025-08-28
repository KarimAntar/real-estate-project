// src/app/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User } from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/listings", label: "My Listings", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col">
      {/* Removed "Real Estate" header */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Removed footer */}
    </aside>
  );
}
