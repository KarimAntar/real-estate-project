"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { Bell, LogOut, LogIn, UserPlus } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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

  const toggleNotifications = () => setShowNotifications(!showNotifications);

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
          <Link href="/" className="text-gray-200 hover:text-blue-400 transition">Home</Link>
          <Link href="/listings" className="text-gray-200 hover:text-blue-400 transition">Listings</Link>
          <Link href="/about" className="text-gray-200 hover:text-blue-400 transition">About</Link>
          <Link href="/contact" className="text-gray-200 hover:text-blue-400 transition">Contact</Link>

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

              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 shadow-md hover:scale-105 transition text-sm font-medium text-gray-200"
              >
                Dashboard
              </Link>

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
