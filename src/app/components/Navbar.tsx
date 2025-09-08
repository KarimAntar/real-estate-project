// src/app/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfilePicture } from "../services/profileService";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { Bell, LogOut, LogIn, UserPlus, House, List, Info, Mail, User, ChevronDown, Settings } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import ProfileImage from "./ProfileImage";

// Define notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Fetch notifications in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, "id">),
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const markAsRead = async (notifId: string) => {
    if (!user) return;
    const notifRef = doc(db, "users", user.uid, "notifications", notifId);
    await updateDoc(notifRef, { read: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.read) {
        const notifRef = doc(db, "users", user.uid, "notifications", n.id);
        batch.update(notifRef, { read: true });
      }
    });
    await batch.commit();
  };

  if (!mounted || authLoading) {
    return (
      <nav className="bg-gray-900 p-4 shadow-lg relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
            </div>
            <div className="w-32 h-6 rounded-md bg-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-16 h-8 rounded-lg bg-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
                </div>
              ))}
          </div>
        </div>
      </nav>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const userProfilePicture = getUserProfilePicture(user);

  return (
    <nav className="bg-gray-900 p-4 shadow-lg relative z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
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
          <Link
            href="/"
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition text-sm font-medium text-gray-200"
          >
            <House className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/listings"
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition text-sm font-medium text-gray-200"
          >
            <List className="w-4 h-4" />
            Listings
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition text-sm font-medium text-gray-200"
          >
            <Info className="w-4 h-4" />
            About
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition text-sm font-medium text-gray-200"
          >
            <Mail className="w-4 h-4" />
            Contact
          </Link>

          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition"
                >
                  <Bell className="w-5 h-5 text-gray-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 bg-gray-800 text-gray-200 rounded-lg shadow-lg w-80 p-4 z-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li className="p-2 text-gray-400">No notifications</li>
                      ) : (
                        notifications.map((n) => (
                          <li
                            key={n.id}
                            className={`p-2 rounded hover:bg-gray-700 cursor-pointer ${
                              !n.read ? "bg-gray-700" : ""
                            }`}
                            onClick={() => markAsRead(n.id)}
                          >
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                            <small className="text-gray-400 text-xs">
                              {new Date(n.createdAt.seconds * 1000).toLocaleString()}
                            </small>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Profile Picture - Now in the header */}
              <ProfileImage 
                user={user}
                size={40}
                className="border-2 border-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
                alt="Profile Picture"
              />

              {/* User Info & Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition"
                >
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-200">
                      {user.fullName || 'User'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.role === 'admin' && (
                        <span className="text-purple-400 font-medium">Admin</span>
                      )}
                      {user.role !== 'admin' && (
                        <span>
                          {user.signInMethod === 'google.com' ? 'Google Account' : 'Email Account'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 bg-gray-800 text-gray-200 rounded-lg shadow-lg w-64 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="text-left">
                        <p className="font-medium">{user.fullName || 'User'}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {user.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-700">
                              Admin
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                            {user.signInMethod === 'google.com' ? 'Google' : 'Email'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <House className="w-4 h-4" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>

                      <Link
                        href="/dashboard/listings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <List className="w-4 h-4" />
                        My Listings
                      </Link>

                      {/* Admin-only link */}
                      {user.role === "admin" && (
                        <Link
                          href="/dashboard/users"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-blue-400"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Manage Users
                        </Link>
                      )}

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      <hr className="my-2 border-gray-700" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors w-full text-left text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md hover:scale-105 transition text-sm font-medium"
              >
                <LogIn className="w-4 h-4 inline" />
                Login
              </Link>
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