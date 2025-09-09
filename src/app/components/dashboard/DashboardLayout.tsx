// src/app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import ProfileImage from "@components/ProfileImage";
import ListingStatusBadge from "@/app/components/ListingStatusBadge";
import { useAuth } from "@contexts/AuthContext";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { getAllListingsWithUsers } from "@services/userService";
import { ListingWithStatus } from "@/types/notification";
import { toast } from "react-toastify";
import Link from "next/link";
import { 
  FaUsers, 
  FaHome, 
  FaChartBar, 
  FaUserShield,
  FaUserTimes,
  FaEdit,
  FaEnvelope,
  FaGoogle,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaUser,
  FaEye,
  FaClock,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown
} from "react-icons/fa";

// Enhanced spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 border-solid rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 border-solid rounded-full animate-spin animate-reverse"></div>
      </div>
    </div>
  </div>
);

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  suspended?: boolean;
  emailVerified?: boolean;
  signInMethod?: string;
  profilePicture?: string;
  googlePhotoURL?: string;
  createdAt?: any;
}

type SortField = 'fullName' | 'email' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type ActiveTab = 'overview' | 'users' | 'listings';

export default function AdminPanelPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Listings state
  const [listings, setListings] = useState<ListingWithStatus[]>([]);
  const [fetchingListings, setFetchingListings] = useState(false);
  const [listingStatusFilter, setListingStatusFilter] = useState<"all" | "pending" | "approved" | "declined">("all");

  // Fetch users
  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setFetchingUsers(false);
    }
  };

  // Fetch listings
  const fetchListings = async () => {
    setFetchingListings(true);
    try {
      const data = await getAllListingsWithUsers();
      setListings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch listings");
    } finally {
      setFetchingListings(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchListings();
    }
  }, [user]);

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, updates);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
      );
      
      const action = updates.role ? 
        (updates.role === 'admin' ? 'promoted to admin' : 'demoted to user') :
        (updates.suspended ? 'suspended' : 'unsuspended');
      
      toast.success(`User ${action} successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 opacity-40" />;
    return sortOrder === 'asc' ? 
      <FaSortUp className="w-3 h-3 text-blue-400" /> : 
      <FaSortDown className="w-3 h-3 text-blue-400" />;
  };

  const filteredAndSortedUsers = users
    .filter((u) => {
      const matchesSearch = 
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && !u.suspended) ||
        (statusFilter === "suspended" && u.suspended) ||
        (statusFilter === "verified" && u.emailVerified) ||
        (statusFilter === "unverified" && !u.emailVerified);
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = a.createdAt?.toDate?.() || new Date(0);
        bVal = b.createdAt?.toDate?.() || new Date(0);
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Filter listings based on status
  const filteredListings = listingStatusFilter === "all" 
    ? listings 
    : listings.filter(listing => listing.status === listingStatusFilter);

  // Statistics
  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    suspended: users.filter(u => u.suspended).length,
    verified: users.filter(u => u.emailVerified).length,
  };

  const listingStats = {
    total: listings.length,
    pending: listings.filter(l => l.status === "pending").length,
    approved: listings.filter(l => l.status === "approved").length,
    declined: listings.filter(l => l.status === "declined").length,
  };

  // Don't show anything until auth finishes loading
  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  // Handle non-admin users after auth is ready
  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md border border-gray-700/50">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserTimes className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Access Restricted
            </h1>
            <p className="text-gray-300 mb-6">
              You don&#39;t have permission to view this page. Only administrators
              can access the admin panel.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-400">Manage users, listings, and platform settings</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "overview", label: "Overview", icon: FaChartBar },
                  { key: "users", label: "User Management", icon: FaUsers },
                  { key: "listings", label: "Listings", icon: FaHome },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as ActiveTab)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* User Statistics */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">User Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FaUser className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{userStats.total}</p>
                        <p className="text-blue-200 text-sm">Total Users</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <FaCrown className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{userStats.admins}</p>
                        <p className="text-purple-200 text-sm">Administrators</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FaCheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{userStats.verified}</p>
                        <p className="text-green-200 text-sm">Verified</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <FaUserTimes className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{userStats.suspended}</p>
                        <p className="text-red-200 text-sm">Suspended</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Statistics */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Listing Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-gray-600/20 to-gray-500/20 border border-gray-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                        <FaEye className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{listingStats.total}</p>
                        <p className="text-gray-200 text-sm">Total Listings</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <FaClock className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{listingStats.pending}</p>
                        <p className="text-yellow-200 text-sm">Pending Review</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FaCheck className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{listingStats.approved}</p>
                        <p className="text-green-200 text-sm">Approved</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <FaTimes className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{listingStats.declined}</p>
                        <p className="text-red-200 text-sm">Declined</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700/50 transition-colors text-left"
                  >
                    <FaUsers className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Manage Users</h3>
                    <p className="text-gray-400 text-sm">View and manage user accounts</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('listings')}
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700/50 transition-colors text-left"
                  >
                    <FaHome className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Review Listings</h3>
                    <p className="text-gray-400 text-sm">Approve or decline property listings</p>
                  </button>

                  <Link
                    href="/dashboard/settings"
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700/50 transition-colors text-left block"
                  >
                    <FaChartBar className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Platform Settings</h3>
                    <p className="text-gray-400 text-sm">Configure platform settings</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              {/* User Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.total}</p>
                      <p className="text-blue-200 text-sm">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FaCrown className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.admins}</p>
                      <p className="text-purple-200 text-sm">Administrators</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FaCheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.verified}</p>
                      <p className="text-green-200 text-sm">Verified</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FaUserTimes className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{userStats.suspended}</p>
                      <p className="text-red-200 text-sm">Suspended</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Filters */}
              <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <FaFilter className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Users</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  <div className="relative">
                    <FaFilter className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>

                  <div className="text-gray-300 flex items-center justify-end">
                    <span className="text-sm">
                      Showing {filteredAndSortedUsers.length} of {users.length} users
                    </span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              {fetchingUsers ? (
                <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700/50">
                  <Spinner />
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50 border-b border-gray-700/50">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort('fullName')}
                              className="flex items-center gap-2 text-gray-200 hover:text-white font-medium transition-colors"
                            >
                              User
                              {getSortIcon('fullName')}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort('email')}
                              className="flex items-center gap-2 text-gray-200 hover:text-white font-medium transition-colors"
                            >
                              Contact
                              {getSortIcon('email')}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleSort('role')}
                              className="flex items-center gap-2 text-gray-200 hover:text-white font-medium transition-colors"
                            >
                              Role
                              {getSortIcon('role')}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left text-gray-200 font-medium">Status</th>
                          <th className="px-6 py-4 text-right text-gray-200 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {filteredAndSortedUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <ProfileImage
                                  user={u}
                                  size={40}
                                  className="ring-2 ring-gray-600"
                                />
                                <div>
                                  <p className="text-white font-medium">{u.fullName}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    {u.signInMethod === 'google.com' ? (
                                      <>
                                        <FaGoogle className="w-3 h-3 text-red-400" />
                                        Google
                                      </>
                                    ) : (
                                      <>
                                        <FaEnvelope className="w-3 h-3 text-blue-400" />
                                        Email
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-gray-300">{u.email}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {u.emailVerified ? (
                                    <>
                                      <FaCheckCircle className="w-3 h-3 text-green-400" />
                                      <span className="text-xs text-green-400">Verified</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaTimesCircle className="w-3 h-3 text-red-400" />
                                      <span className="text-xs text-red-400">Unverified</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {u.role === 'admin' ? (
                                  <>
                                    <FaCrown className="w-4 h-4 text-purple-400" />
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      Administrator
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <FaUser className="w-4 h-4 text-blue-400" />
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      User
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {u.suspended ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Link
                                  href={`/dashboard/profile/${u.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white text-xs font-medium transition-colors border border-gray-600/50"
                                >
                                  <FaEdit className="w-3 h-3" />
                                  Edit
                                </Link>
                                
                                <button
                                  onClick={() =>
                                    updateUser(u.id, {
                                      role: u.role === "admin" ? "user" : "admin",
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                    u.role === 'admin' 
                                      ? 'bg-blue-600/50 hover:bg-blue-600 text-blue-300 hover:text-white border-blue-600/50'
                                      : 'bg-purple-600/50 hover:bg-purple-600 text-purple-300 hover:text-white border-purple-600/50'
                                  }`}
                                >
                                  <FaUserShield className="w-3 h-3" />
                                  {u.role === "admin" ? "Demote" : "Promote"}
                                </button>
                                
                                <button
                                  onClick={() =>
                                    updateUser(u.id, { suspended: !u.suspended })
                                  }
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                    u.suspended
                                      ? "bg-green-600/50 hover:bg-green-600 text-green-300 hover:text-white border-green-600/50"
                                      : "bg-red-600/50 hover:bg-red-600 text-red-300 hover:text-white border-red-600/50"
                                  }`}
                                >
                                  {u.suspended ? (
                                    <>
                                      <FaCheckCircle className="w-3 h-3" />
                                      Unsuspend
                                    </>
                                  ) : (
                                    <>
                                      <FaUserTimes className="w-3 h-3" />
                                      Suspend
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredAndSortedUsers.length === 0 && (
                      <div className="text-center py-12">
                        <FaUser className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No users found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Listings Management Tab */}
          {activeTab === 'listings' && (
            <div className="space-y-8">
              {/* Listing Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-gray-600/20 to-gray-500/20 border border-gray-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <FaEye className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{listingStats.total}</p>
                      <p className="text-gray-200 text-sm">Total Listings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <FaClock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{listingStats.pending}</p>
                      <p className="text-yellow-200 text-sm">Pending Review</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FaCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{listingStats.approved}</p>
                      <p className="text-green-200 text-sm">Approved</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FaTimes className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{listingStats.declined}</p>
                      <p className="text-red-200 text-sm">Declined</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Status Filter */}
              <div className="mb-6">
                <div className="border-b border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { key: "all", label: "All", icon: FaEye, count: listingStats.total },
                      { key: "pending", label: "Pending", icon: FaClock, count: listingStats.pending },
                      { key: "approved", label: "Approved", icon: FaCheck, count: listingStats.approved },
                      { key: "declined", label: "Declined", icon: FaTimes, count: listingStats.declined },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setListingStatusFilter(tab.key as any)}
                          className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            listingStatusFilter === tab.key
                              ? "border-blue-500 text-blue-400"
                              : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                          {tab.count > 0 && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              listingStatusFilter === tab.key
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Listings Grid */}
              {fetchingListings ? (
                <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700/50">
                  <Spinner />
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center mt-20">
                  <div className="text-gray-400 text-lg mb-4">
                    {listingStatusFilter === "all" 
                      ? "No listings found." 
                      : `No ${listingStatusFilter} listings found.`
                    }
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700/50 hover:scale-105 hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Image */}
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={
                            listing.images?.[0] ||
                            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
                          {listing.type}
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <ListingStatusBadge 
                            status={listing.status || "pending"} 
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors text-white">
                          {listing.title}
                        </h3>

                        <div className="flex items-center text-gray-400 mb-3">
                          <svg className="w-4 h-4 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{listing.city}</span>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                          {listing.description}
                        </p>

                        <div className="text-xl font-bold text-blue-400 mb-4">
                          ${listing.price}
                        </div>

                        {/* User info */}
                        <p className="text-sm text-blue-400 mb-3">
                          Listed by: {listing.userName} ({listing.userEmail})
                        </p>

                        {/* Admin note for declined listings */}
                        {listing.status === "declined" && listing.adminNote && (
                          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                            <p className="text-sm text-red-300">
                              <strong>Admin Feedback:</strong> {listing.adminNote}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 mt-auto">
                          <Link
                            href={`/dashboard/listings/${listing.id}`}
                            className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md transition hover:scale-105 text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}