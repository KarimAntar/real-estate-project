"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";
import { Bell, LogOut, LogIn, UserPlus } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  // Logout with Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Try again.");
    }
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  // If auth state is still loading, don't render navbar links yet
  if (authLoading) return null; 

  return (
    <nav className="bg-gray-900 p-4 shadow-lg relative z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/10365/10365152.png"
              alt="Real Estate Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-white">Real Estate</h1>
        </Link>

        {/* Links + Auth */}
        <div className="flex items-center gap-4 relative">
          <Link href="/" className="text-gray-200 hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/listings" className="text-gray-200 hover:text-blue-400 transition">
            Listings
          </Link>
          <Link href="/about" className="text-gray-200 hover:text-blue-400 transition">
            About
          </Link>
          <Link href="/contact" className="text-gray-200 hover:text-blue-400 transition">
            Contact
          </Link>

          {user ? (
            <>
              {/* Notifications */}
              <button
                onClick={toggleNotifications}
                className="relative p-2 rounded-full hover:bg-gray-800 transition"
              >
                <Bell className="w-5 h-5 text-gray-200" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 bg-gray-800 text-gray-200 rounded-lg shadow-lg w-64 p-4">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="p-2 rounded hover:bg-gray-700">📢 New listing created</li>
                    <li className="p-2 rounded hover:bg-gray-700">✅ Profile updated successfully</li>
                    <li className="p-2 rounded hover:bg-gray-700">💬 You have 2 new messages</li>
                  </ul>
                </div>
              )}

              <Link
                href="/dashboard"
                className="text-gray-200 hover:text-blue-400 font-medium transition"
              >
                Dashboard
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 rounded-lg bg-red-600 hover:bg-red-700 shadow-md hover:scale-105 transition text-sm font-medium"
              >
                <LogOut className="w-4 h-4 inline" />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/auth/login"
                className="flex items-center gap-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md hover:scale-105 transition text-sm font-medium"
              >
                <LogIn className="w-4 h-4 inline" />
                Login
              </Link>

              {/* Register */}
              <Link
                href="/auth/register"
                className="flex items-center gap-2 p-2 rounded-lg bg-green-600 hover:bg-green-700 shadow-md hover:scale-105 transition text-sm font-medium"
              >
                <UserPlus className="w-4 h-4 inline" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
