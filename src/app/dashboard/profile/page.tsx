// src/app/dashboard/profile/page.tsx
"use client";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute";
import ProfilePictureUpload from "../../components/ProfilePictureUpload";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase/firebaseConfig";
import { useState } from "react";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaEnvelope, 
  FaShieldAlt, 
  FaGoogle, 
  FaAt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaUserCog,
  FaIdCard
} from "react-icons/fa";

export default function ProfilePage() {
  const { user, updateUserProfile, sendVerificationEmail } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      toast.warning("Please enter your full name");
      return;
    }

    if (!auth.currentUser?.emailVerified && user.signInMethod === 'email') {
      toast.warning("Please verify your email before editing your profile.");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({ fullName: fullName.trim() });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getSignInMethodDisplay = () => {
    const method = user?.signInMethod;
    
    if (method === 'google.com') {
      return (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <FaGoogle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-red-300 font-medium">Google Sign-In</p>
            <p className="text-red-400/80 text-sm">Signed in with Google account</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <FaAt className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-blue-300 font-medium">Email & Password</p>
            <p className="text-blue-400/80 text-sm">Registered with email address</p>
          </div>
        </div>
      );
    }
  };

  const getAccountCreationInfo = () => {
    if (user?.signInMethod === 'google.com') {
      return {
        method: 'Google Sign-in',
        description: 'Account created via Google authentication',
        icon: FaGoogle,
        color: 'text-red-400'
      };
    } else {
      return {
        method: 'Email Registration',
        description: 'Account created with email and password',
        icon: FaEnvelope,
        color: 'text-blue-400'
      };
    }
  };

  const accountInfo = getAccountCreationInfo();

  return (
    <DashboardLayout>
      <ProtectedRoute requireVerifiedEmail={user?.signInMethod === 'email'}>
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Your Profile
            </h1>
            <p className="text-gray-400">Manage your personal information and account settings</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FaCamera className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold">Profile Picture</h3>
                </div>
                
                <ProfilePictureUpload 
                  size="lg" 
                  showUploadButton={true}
                  showImportButton={true}
                  className="w-full"
                />
              </div>
              
              {/* Profile Picture Status */}
              <div className="space-y-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Picture Status:</span>
                    <span className={`text-sm font-medium ${user?.profilePicture ? 'text-green-400' : 'text-yellow-400'}`}>
                      {user?.profilePicture ? 'Custom Upload' : 
                       user?.googlePhotoURL ? 'Google Photo Available' : 'Default Avatar'}
                    </span>
                  </div>
                </div>
                
                {user?.signInMethod === 'google.com' && !user?.profilePicture && user?.googlePhotoURL && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-300 text-sm text-center">
                      💡 You can import your Google photo or upload a custom one
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <FaUserCog className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold">Basic Information</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                      <FaUser className="w-4 h-4 text-blue-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                      <FaEnvelope className="w-4 h-4 text-green-400" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ""}
                        className="w-full p-4 pr-32 rounded-xl bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed"
                        readOnly
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {user?.emailVerified ? (
                          <div className="flex items-center gap-1 text-green-400">
                            <FaCheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400">
                            <FaTimesCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Unverified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={loading || !fullName.trim() || fullName === user?.fullName}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : "Save Changes"}
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
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg"
                      >
                        Resend Verification Email
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details Card */}
              <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <FaIdCard className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-semibold">Account Details</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sign-in Method */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                      <FaShieldAlt className="w-4 h-4 text-purple-400" />
                      Sign-in Method
                    </label>
                    {getSignInMethodDisplay()}
                  </div>

                  {/* Account Role */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                      <FaShieldAlt className="w-4 h-4 text-green-400" />
                      Account Role
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                      {user?.role === 'admin' ? (
                        <>
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <FaShieldAlt className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-purple-300 font-medium">Administrator</p>
                            <p className="text-purple-400/80 text-sm">Full system access</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-blue-300 font-medium">Standard User</p>
                            <p className="text-blue-400/80 text-sm">Regular user access</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Statistics */}
          <div className="mt-8 grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaCalendarAlt className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Account Type</h4>
              <p className="text-gray-400 text-sm">
                {accountInfo.description}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                {user?.emailVerified ? (
                  <FaCheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <FaTimesCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <h4 className="text-lg font-semibold mb-2">Email Status</h4>
              <p className={`text-sm font-medium ${user?.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaCamera className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Profile Picture</h4>
              <p className="text-gray-400 text-sm">
                {user?.profilePicture ? 'Custom Upload' : 
                 user?.googlePhotoURL ? 'Google Photo' : 'Default Avatar'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaShieldAlt className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Security</h4>
              <p className="text-gray-400 text-sm">
                {user?.signInMethod === 'google.com' ? 'Google Protected' : 'Password Protected'}
              </p>
            </div>
          </div>

          {/* Profile Tips */}
          <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FaUser className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3 text-blue-200">Profile Tips</h4>
                <div className="grid md:grid-cols-2 gap-4 text-blue-100 text-sm">
                  <div className="space-y-2">
                    <p>• A complete profile helps build trust with potential buyers/sellers</p>
                    <p>• Upload a clear profile picture to make your listings more personal</p>
                    <p>• Keep your contact information up to date</p>
                  </div>
                  <div className="space-y-2">
                    {user?.signInMethod === 'google.com' && (
                      <p>• You can import your Google profile photo or upload a custom one</p>
                    )}
                    {!user?.emailVerified && user?.signInMethod === 'email' && (
                      <p className="text-yellow-200">• Please verify your email to access all features</p>
                    )}
                    <p>• Visit Settings to customize your preferences and privacy options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
}