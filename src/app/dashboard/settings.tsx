// /app/dashboard/settings.tsx
"use client";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p>Manage your account settings and preferences.</p>
    </DashboardLayout>
  );
}
