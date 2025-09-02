"use client";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";


export default function DashboardPage() {
  return (
    <ProtectedRoute requireVerifiedEmail>
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p>Select a menu item to get started.</p>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
