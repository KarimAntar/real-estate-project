"use client";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function ProfilePage() {
  const { user, setUser, sendVerificationEmail } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    if (!auth.currentUser?.emailVerified) {
      toast.warning("Please verify your email before editing your profile.");
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }
      setUser({ ...user, fullName });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <ProtectedRoute requireVerifiedEmail>
        <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
          <div className="flex flex-col space-y-4">
            <label className="flex flex-col">
              Full Name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex flex-col">
              Email
              <input
                type="email"
                value={user?.email || ""}
                className="mt-1 p-2 rounded bg-gray-700 text-white cursor-not-allowed"
                readOnly
              />
            </label>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>

            {/* Show resend verification button if email is not verified */}
            {!user?.emailVerified && (
              <button
                onClick={async () => {
                  try {
                    await sendVerificationEmail();
                    toast.success("Verification email sent!");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to send verification email.");
                  }
                }}
                className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
}
