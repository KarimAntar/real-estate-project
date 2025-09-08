// src/app/dashboard/profile/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../../components/dashboard/ProtectedRoute";
import ProfileImage from "../../../components/ProfileImage";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaShieldAlt, FaAt } from "react-icons/fa";
import Link from "next/link";

type Role = "user" | "admin";
type SignInMethod = "email" | "google.com";

interface AdminEditableUser {
  id: string;                 // Firestore doc id
  uid?: string;               // optional duplicate uid
  fullName: string;
  email: string;
  emailVerified?: boolean;
  role: Role;
  signInMethod?: SignInMethod;
  profilePicture?: string;
  googlePhotoURL?: string;
  suspended?: boolean;
}

export default function AdminEditUserPage() {
  const router = useRouter();
  const params = useParams();
  // Safely coerce to string
  const id = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.id;
    return Array.isArray(raw) ? raw[0] : raw || "";
  }, [params]);

  const { user: currentUser } = useAuth();

  const [target, setTarget] = useState<AdminEditableUser | null>(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "users", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast.error("User not found");
          router.push("/dashboard/users");
          return;
        }
        const data = snap.data() as Partial<AdminEditableUser>;
        const merged: AdminEditableUser = {
          id: snap.id,
          fullName: data.fullName || "",
          email: data.email || "",
          role: (data.role as Role) || "user",
          emailVerified: !!data.emailVerified,
          signInMethod: (data.signInMethod as SignInMethod) || "email",
          profilePicture: data.profilePicture,
          googlePhotoURL: data.googlePhotoURL,
          suspended: !!data.suspended,
          uid: (data as any)?.uid,
        };
        setTarget(merged);
        setFullName(merged.fullName);
        setRole(merged.role);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const saveChanges = async () => {
    if (!target) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", target.id);
      await updateDoc(ref, { fullName, role });
      setTarget({ ...target, fullName, role });
      toast.success("User updated successfully");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const toggleSuspend = async () => {
    if (!target) return;
    try {
      const ref = doc(db, "users", target.id);
      await updateDoc(ref, { suspended: !target.suspended });
      setTarget({ ...target, suspended: !target.suspended });
      toast.success(target.suspended ? "User unsuspended" : "User suspended");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  };

  // Admin-only guard (use your current ProtectedRoute and then check role here)
  const notAdmin =
    !!currentUser && currentUser.role !== "admin";

  return (
    <DashboardLayout>
      <ProtectedRoute>
        {loading ? (
          <div className="max-w-4xl mx-auto p-6 text-gray-400">Loading user...</div>
        ) : notAdmin ? (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-red-200">
              Access denied — Admins only.
            </div>
          </div>
        ) : !target ? (
          <div className="max-w-4xl mx-auto p-6 text-gray-400">User not found.</div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Manage User</h2>
              <Link
                href="/dashboard/users"
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
              >
                ← Back to Users
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Avatar Card (view only to avoid editing admin's own photo by mistake) */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-center">Profile Picture</h3>

                <div className="flex justify-center">
                  <ProfileImage
                    user={{
                      fullName: target.fullName,
                      profilePicture: target.profilePicture,
                      googlePhotoURL: target.googlePhotoURL,
                    }}
                    size={128}
                    className="border-4 border-gray-600"
                    alt="User Profile Picture"
                  />
                </div>

                <div className="mt-4 text-sm text-gray-400 space-y-1 text-center">
                  <p>{target.fullName || "Unnamed user"}</p>
                  <p className="text-xs">
                    (Profile picture edits are disabled here to avoid changing your own avatar.)
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-6">Profile Information</h3>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaUser className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaEnvelope className="w-4 h-4" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={target.email}
                        readOnly
                        className="w-full p-3 rounded-lg bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3">
                        {target.emailVerified ? (
                          <span className="text-green-400 text-sm">✓ Verified</span>
                        ) : (
                          <span className="text-red-400 text-sm">✗ Not Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaShieldAlt className="w-4 h-4" />
                      Account Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {/* Sign-in Method */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaAt className="w-4 h-4" />
                      Sign-in Method
                    </label>
                    <div className="p-3 rounded-lg bg-gray-700 border border-gray-600">
                      {target.signInMethod === "google.com" ? "Google Sign-In" : "Email & Password"}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors ${
                      saving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={toggleSuspend}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      target.suspended
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {target.suspended ? "Unsuspend User" : "Suspend User"}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats (matching style) */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <h4 className="text-lg font-semibold mb-2">Email Status</h4>
                <p className={target.emailVerified ? "text-green-400" : "text-red-400"}>
                  {target.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <h4 className="text-lg font-semibold mb-2">Role</h4>
                <p className="text-gray-300 capitalize">{target.role}</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <h4 className="text-lg font-semibold mb-2">Status</h4>
                <p className={target.suspended ? "text-red-400" : "text-green-400"}>
                  {target.suspended ? "Suspended" : "Active"}
                </p>
              </div>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </DashboardLayout>
  );
}
