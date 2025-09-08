// src/app/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { toast } from "react-toastify";
import { getAllUsers, updateUser, suspendUser } from "@services/userService";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err: any) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await updateUser(id, updates);
      toast.success("User updated successfully");
      loadUsers();
    } catch (err: any) {
      toast.error("Update failed");
    }
  };

  const handleSuspend = async (id: string, suspend: boolean) => {
    try {
      await suspendUser(id, suspend);
      toast.success(suspend ? "User suspended" : "User reactivated");
      loadUsers();
    } catch (err: any) {
      toast.error("Action failed");
    }
  };

  if (loading) return <p className="text-gray-600">Loading users...</p>;
  if (user?.role !== "admin") return <p className="text-red-500">Access denied</p>;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <table className="min-w-full border border-gray-300 bg-white rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-3">{u.suspended ? "Suspended" : "Active"}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleSuspend(u.id, !u.suspended)}
                    className={`px-3 py-1 rounded ${
                      u.suspended
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {u.suspended ? "Activate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
