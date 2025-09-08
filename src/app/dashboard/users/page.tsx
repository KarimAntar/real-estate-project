// src/app/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { toast } from "react-toastify";
import Link from "next/link";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  suspended?: boolean;
}

export default function ManageUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
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
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, updates);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
      );
      toast.success("User updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 font-semibold p-6">
          Access Denied – Admins Only
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Manage Users</h1>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <p className="text-gray-400">Loading users...</p>
          ) : (
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">{u.fullName}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">{u.role}</td>
                      <td className="px-6 py-4">
                        {u.suspended ? (
                          <span className="text-red-400 font-medium">
                            Suspended
                          </span>
                        ) : (
                          <span className="text-green-400 font-medium">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Edit User Button */}
                        <Link
                          href={`/dashboard/profile/${u.id}`}
                          className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            updateUser(u.id, {
                              role: u.role === "admin" ? "user" : "admin",
                            })
                          }
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          {u.role === "admin" ? "Demote" : "Promote"}
                        </button>
                        <button
                          onClick={() =>
                            updateUser(u.id, { suspended: !u.suspended })
                          }
                          className={`px-3 py-1 rounded text-xs ${
                            u.suspended
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          } text-white`}
                        >
                          {u.suspended ? "Unsuspend" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
