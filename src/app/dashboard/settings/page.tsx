// src/app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { 
  FaBell, 
  FaShieldAlt, 
  FaPalette, 
  FaGlobe, 
  FaDatabase,
  FaTrashAlt,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope
} from "react-icons/fa";
import { 
  updatePassword, 
  sendPasswordResetEmail, 
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";

// Define settings types
interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  listingAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
}

interface UserPreferences {
  theme: string;
  language: string;
  currency: string;
  timezone: string;
}

interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: UserPreferences;
}

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  
  // Settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    listingAlerts: true,
  });
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
  });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "dark",
    language: "en",
    currency: "USD",
    timezone: "UTC",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [saving, setSaving] = useState(false);

  // Load user preferences from Firestore
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        // Check if user has settings property (safely access)
        const userSettings = (user as any).settings as UserSettings | undefined;
        
        if (userSettings) {
          setNotifications(userSettings.notifications || notifications);
          setPrivacy(userSettings.privacy || privacy);
          setPreferences(userSettings.preferences || preferences);
        }
      } catch (error) {
        console.error("Failed to load user settings:", error);
      }
    };

    loadUserSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const settingsData: UserSettings = {
        notifications,
        privacy,
        preferences,
      };

      await updateUserProfile({
        settings: settingsData
      } as any); // Type assertion to handle the settings property
      
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!auth.currentUser || user?.signInMethod !== 'email') {
      toast.error("Password change is only available for email accounts");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      toast.success("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      if (error.code === 'auth/wrong-password') {
        toast.error("Current password is incorrect");
      } else {
        toast.error(error.message || "Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    }
  };

  const exportData = async () => {
    if (!user) return;
    
    try {
      // Collect user data with proper typing
      const userData: {
        profile: {
          fullName: string | undefined;
          email: string;
          role: string | undefined;
          signInMethod: string | undefined;
        };
        settings: UserSettings;
        exportDate: string;
        listings?: any[];
      } = {
        profile: {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          signInMethod: user.signInMethod,
        },
        settings: { notifications, privacy, preferences },
        exportDate: new Date().toISOString(),
      };

      // Get user's listings
      try {
        const listingsQuery = query(
          collection(db, "listings"),
          where("userId", "==", user.uid)
        );
        const listingsSnapshot = await getDocs(listingsQuery);
        const listings = listingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        userData.listings = listings;
      } catch (listingsError) {
        console.warn("Could not fetch listings:", listingsError);
        // Continue with export even if listings fetch fails
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `real-estate-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully!");
    } catch (error: any) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export data");
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    if (!auth.currentUser || !user) return;

    setDeleting(true);
    try {
      // Delete user's listings
      try {
        const listingsQuery = query(
          collection(db, "listings"),
          where("userId", "==", user.uid)
        );
        const listingsSnapshot = await getDocs(listingsQuery);
        const deletions = listingsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletions);
      } catch (listingsError) {
        console.warn("Could not delete listings:", listingsError);
      }

      // Delete user document
      try {
        await deleteDoc(doc(db, "users", user.uid));
      } catch (userDocError) {
        console.warn("Could not delete user document:", userDocError);
      }

      // Delete Firebase Auth account
      await deleteUser(auth.currentUser);
      
      toast.success("Account deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <ProtectedRoute requireVerifiedEmail>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Notifications Settings */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <FaBell className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                  <span className="text-gray-200 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <FaShieldAlt className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Privacy Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Profile Visibility</label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy(prev => ({
                    ...prev,
                    profileVisibility: e.target.value
                  }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts-only">Contacts Only</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                  <span className="text-gray-200">Show Email in Profile</span>
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={(e) => setPrivacy(prev => ({
                      ...prev,
                      showEmail: e.target.checked
                    }))}
                    className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                  <span className="text-gray-200">Show Phone in Profile</span>
                  <input
                    type="checkbox"
                    checked={privacy.showPhone}
                    onChange={(e) => setPrivacy(prev => ({
                      ...prev,
                      showPhone: e.target.checked
                    }))}
                    className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* General Preferences */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <FaPalette className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">General Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    theme: e.target.value
                  }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    currency: e.target.value
                  }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EGP">EGP (ج.م)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    timezone: e.target.value
                  }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Africa/Cairo">Cairo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password Settings */}
          {user?.signInMethod === 'email' && (
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <FaLock className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold">Password & Security</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          current: !prev.current
                        }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          new: !prev.new
                        }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          confirm: !prev.confirm
                        }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={changePassword}
                    disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                  
                  <button
                    onClick={sendPasswordReset}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FaEnvelope className="w-4 h-4" />
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <FaDatabase className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Data Management</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={exportData}
                className="flex items-center justify-center gap-3 p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-green-300"
              >
                <FaDownload className="w-5 h-5" />
                <span>Export My Data</span>
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-3 p-4 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors text-red-300"
              >
                <FaTrashAlt className="w-5 h-5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-red-500/30">
                <h3 className="text-xl font-bold text-red-400 mb-4">Delete Account</h3>
                <p className="text-gray-300 mb-4">
                  This action cannot be undone. All your data, listings, and account information will be permanently deleted.
                </p>
                <p className="text-gray-300 mb-4">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 mb-4"
                  placeholder="Type DELETE"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={deleting || deleteConfirmation !== "DELETE"}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}