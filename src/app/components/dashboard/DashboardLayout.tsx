// src/app/components/dashboard/DashboardLayout.tsx
"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-900">{children}</main>
      </div>
    </div>
  );
}
