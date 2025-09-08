// src/app/dashboard/profile/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { toast } from "react-toastify";

export default function AdminEditUserPage() {
  const params = useParams();
  const id = params?.id as string | undefined; // ✅ safe typing
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "user",
    suspended: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, "users", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setFormData(snapshot.data() as any);
        } else {
          toast.error("User not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchUser();
    }
  }, [id, user]);

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, type } = e.currentTarget;
  const value =
    type === "checkbox"
      ? (e.currentTarget as HTMLInputElement).checked
      : e.currentTarget.value;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};



  const handleSave = async () => {
    try {
      if (!id) return;
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, formData);
      toast.success("User updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

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
        <div className="p-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Edit User</h1>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-4 bg-gray-800 p-6 rounded-lg shadow">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                                <input
                type="checkbox"
                name="suspended"
                checked={formData.suspended}
                onChange={({ target }) =>
                    setFormData((prev) => ({
                    ...prev,
                    [target.name]: target.checked,
                    }))
                }
                />
                <label className="text-gray-300">Suspended</label>
              </div>

              <button
                onClick={handleSave}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
