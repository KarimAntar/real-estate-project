"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  LogOut, 
  LogIn, 
  UserPlus, 
  House, 
  List, 
  Info, 
  Mail, 
  User, 
  ChevronDown, 
  Settings,
  Menu,
  X,
  Search
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import ProfileImage from "./ProfileImage";
import NotificationBell from "./NotificationBell"; // Import NotificationBell

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [router]);

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

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowUserMenu(false);
  };

  // Navigation items
  const navItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/listings", label: "Properties", icon: List },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  if (!mounted || authLoading) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-gray-900"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gray-700 animate-pulse" />
              <div className="w-32 h-6 rounded-md bg-gray-700 animate-pulse" />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="w-20 h-8 rounded-lg bg-gray-700 animate-pulse" />
              ))}
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-700 animate-pulse md:hidden" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-gray-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Real Estate
              </h1>
              <p className="text-xs text-gray-400">Find Your Home</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 text-gray-300 hover:text-white group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Link
              href="/listings"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 hover:scale-105 hidden sm:flex"
            >
              <Search className="w-5 h-5 text-gray-300" />
            </Link>

            {user ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* Profile Picture */}
                <ProfileImage 
                  user={user}
                  size={32}
                  className="border-2 border-gray-600 hover:border-blue-400 transition-colors cursor-pointer"
                  alt="Profile Picture"
                />

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-left hidden lg:block">
                      <div className="text-sm font-medium text-gray-200 truncate max-w-24">
                        {user.fullName || 'User'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.role === 'admin' ? (
                          <span className="text-purple-400">Admin</span>
                        ) : (
                          <span>Member</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 text-gray-200 rounded-xl shadow-xl w-64 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <ProfileImage 
                            user={user}
                            size={40}
                            className="border border-gray-600"
                            alt="Profile"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.fullName || 'User'}</p>
                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {user.role === 'admin' && (
                                <span className="px-2 py-0.5 text-xs bg-purple-900/30 text-purple-300 border border-purple-700 rounded-full">
                                  Admin
                                </span>
                              )}
                              <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full">
                                {user.signInMethod === 'google.com' ? 'Google' : 'Email'}
                              </span>
                            </div>
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
                          My Properties
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            href="/dashboard/"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-purple-400"
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
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors w-full text-left text-red-400 hover:text-red-300"
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
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 hover:border-blue-500 transition-all duration-200 text-gray-300 hover:text-white"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Login</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden lg:inline">Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-gray-800 border-t border-gray-700"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {!user && (
                <>
                  <hr className="my-4 border-gray-700" />
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Register</span>
                  </Link>
                </>
              )}

              {user && (
                <>
                  <hr className="my-4 border-gray-700" />
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <ProfileImage 
                        user={user}
                        size={40}
                        className="border border-gray-600"
                        alt="Profile"
                      />
                      <div>
                        <p className="font-medium text-white">{user.fullName || 'User'}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <House className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/listings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <List className="w-5 h-5" />
                    <span>My Properties</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      href="/dashboard/"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-purple-400"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Manage Users</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full text-left text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}