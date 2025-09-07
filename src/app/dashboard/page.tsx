"use client";

import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import { FaRegSmile } from "react-icons/fa";
import { useAuth } from "@contexts/AuthContext"; // Adjust the import path as needed

export default function DashboardPage() {
  const { user } = useAuth(); // Assumes your AuthContext provides a user object

  // Fallback to "User" if user or user.name is not available
  const userName = user?.fullName || "User";

  return (
    <ProtectedRoute requireVerifiedEmail>
      <DashboardLayout>
        <div className="bg-gray-800 rounded-lg shadow p-8 max-w-2xl mx-auto mt-8">
          <div className="flex items-center mb-6">
            <FaRegSmile className="text-blue-500 text-4xl mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
              <p className="text-gray-500 mt-1">
                Your personalized real estate dashboard
              </p>
            </div>
          </div>
          <p className="text-lg mb-4">
            Get started by selecting a menu item on the left. Here you can manage
            your listings, and update your profile.
          </p>
          <ul className="list-disc list-inside text-white space-y-2">
            <li>View and edit your property listings.</li>
            <li>Update your account and preferences.</li>
          </ul>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
