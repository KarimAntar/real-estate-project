// src/app/dashboard/profile/page.tsx
"use client";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute";
import ProfilePictureUpload from "../../components/ProfilePictureUpload";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase/firebaseConfig";
import { useState } from "react";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaShieldAlt, FaGoogle, FaAt } from "react-icons/fa";

export default function ProfilePage() {
  const { user, updateUserProfile, sendVerificationEmail } = useAuth();
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
      await updateUserProfile({ fullName });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getSignInMethodDisplay = () => {
    switch (user?.signInMethod) {
      case 'google.com':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <FaGoogle className="w-4 h-4" />
            <span>Google Sign-In</span>
          </div>
        );
      case 'email':
      default:
        return (
          <div className="flex items-center gap-2 text-blue-400">
            <FaAt className="w-4 h-4" />
            <span>Email & Password</span>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <ProtectedRoute requireVerifiedEmail>
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-8">Your Profile</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-center">Profile Picture</h3>
              <ProfilePictureUpload 
                size="lg" 
                showUploadButton={true}
                showImportButton={true}
                className="w-full"
              />
              
              {/* Profile Picture Tips */}
              <div className="mt-4 text-sm text-gray-400 space-y-1">
                <p>• Maximum 2MB file size</p>
                <p>• Supported: JPEG, PNG, WebP</p>
                {user?.signInMethod === 'google.com' && !user?.profilePicture && (
                  <p className="text-red-400">• Import your Google photo or upload a custom one</p>
                )}
              </div>
            </div>

            {/* Profile Information */}
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
                    placeholder="Enter your full name"
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
                      value={user?.email || ""}
                      className="w-full p-3 rounded-lg bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed"
                      readOnly
                    />
                    <div className="absolute right-3 top-3">
                      {user?.emailVerified ? (
                        <span className="text-green-400 text-sm">✓ Verified</span>
                      ) : (
                        <span className="text-red-400 text-sm">✗ Not Verified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sign-in Method */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FaShieldAlt className="w-4 h-4" />
                    Sign-in Method
                  </label>
                  <div className="p-3 rounded-lg bg-gray-700 border border-gray-600">
                    {getSignInMethodDisplay()}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FaShieldAlt className="w-4 h-4" />
                    Account Role
                  </label>
                  <div className="p-3 rounded-lg bg-gray-700 border border-gray-600">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                {/* Show resend verification button if email is not verified */}
                {!user?.emailVerified && user?.signInMethod === 'email' && (
                  <button
                    onClick={async () => {
                      try {
                        await sendVerificationEmail();
                        toast.success("Verification email sent!");
                      } catch (err: any) {
                        toast.error(err.message || "Failed to send verification email.");
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Profile Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <h4 className="text-lg font-semibold mb-2">Account Created</h4>
              <p className="text-gray-400">
                {user?.signInMethod === 'google.com' ? 'Via Google Sign-in' : 'Email Registration'}
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <h4 className="text-lg font-semibold mb-2">Email Status</h4>
              <p className={user?.emailVerified ? 'text-green-400' : 'text-red-400'}>
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <h4 className="text-lg font-semibold mb-2">Profile Picture</h4>
              <p className="text-gray-400">
                {user?.profilePicture ? 'Custom Upload' : 
                 user?.googlePhotoURL ? 'Google Photo' : 'Default Avatar'}
              </p>
            </div>
          </div>

          {/* Profile Tips */}
          <div className="mt-8 bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3 text-blue-200">Profile Tips</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li>• A complete profile helps build trust with potential buyers/sellers</li>
              <li>• Upload a clear profile picture to make your listings more personal</li>
              <li>• Keep your contact information up to date</li>
              {user?.signInMethod === 'google.com' && (
                <li>• You can import your Google profile photo or upload a custom one</li>
              )}
              {!user?.emailVerified && (
                <li className="text-yellow-200">• Please verify your email to access all features</li>
              )}
            </ul>
          </div>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
}