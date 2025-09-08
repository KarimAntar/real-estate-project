// src/app/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User, Building2, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const sidebarItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/listings", label: "My Listings", icon: Building2 },
  { href: "/dashboard/listings/add", label: "Add Listing", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname() ?? ""; // ✅ null-safe
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800">
      {/* Header / Branding */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Real Estate</h1>
        <p className="text-sm text-gray-400">Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map(({ href, label, icon: Icon }) => {
          let active = false;

          if (href === "/dashboard/listings") {
            // ✅ Highlight for /dashboard/listings and edit pages (/dashboard/listings/[id])
            active =
              pathname === "/dashboard/listings" ||
              (pathname.startsWith("/dashboard/listings/") &&
                !pathname.startsWith("/dashboard/listings/add"));
          } else {
            active = pathname === href;
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
