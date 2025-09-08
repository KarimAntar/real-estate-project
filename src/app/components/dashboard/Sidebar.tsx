// src/app/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  PlusCircle, 
  User, 
  Building2, 
  LogOut, 
  Users, 
  Settings,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ProfileImage from "../ProfileImage";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/listings", label: "My Listings", icon: Building2 },
  { href: "/dashboard/listings/add", label: "Add Listing", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { user, logout } = useAuth();

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 flex flex-col border-r border-gray-700/50 shadow-2xl">
      {/* Header / User Profile Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-4 mb-4">
          <ProfileImage 
            user={user}
            size={48}
            className="ring-2 ring-blue-500/30"
            alt="User Profile"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {user?.fullName || "User"}
            </h2>
            <p className="text-sm text-gray-400 truncate">
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-center">
          <h1 className="text-lg font-bold text-white">Real Estate</h1>
          <p className="text-sm text-blue-100 opacity-90">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(({ href, label, icon: Icon }) => {
          let active = false;

          if (href === "/dashboard/listings") {
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
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-300 hover:bg-gray-800/60 hover:text-white hover:transform hover:scale-[1.01]"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1">{label}</span>
              {active && (
                <ChevronRight className="w-4 h-4 opacity-60" />
              )}
            </Link>
          );
        })}

        {/* Admin-only link */}
        {user?.role === "admin" && (
          <div className="pt-4 border-t border-gray-700/50">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-4">
              Administration
            </div>
            <Link
              href="/dashboard/users"
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname.startsWith("/dashboard/users")
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-300 hover:bg-gray-800/60 hover:text-white hover:transform hover:scale-[1.01]"
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1">Manage Users</span>
              {pathname.startsWith("/dashboard/users") && (
                <ChevronRight className="w-4 h-4 opacity-60" />
              )}
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium transition-all duration-200 hover:transform hover:scale-[1.02] shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}