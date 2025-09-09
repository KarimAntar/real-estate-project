// src/app/dashboard/admin/page.tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/app/components/dashboard/ProtectedRoute";
import ListingApproval from "@/app/components/admin/ListingApproval";
import NotificationSender from "@/app/components/admin/NotificationSender";
import { FaClipboardCheck, FaBell, FaChartLine, FaUsers } from "react-icons/fa";

type TabType = "approvals" | "notifications" | "analytics" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("approvals");

  const tabs = [
    {
      id: "approvals" as TabType,
      label: "Listing Approvals",
      icon: FaClipboardCheck,
      description: "Review and approve pending listings"
    },
    {
      id: "notifications" as TabType,
      label: "Send Notifications",
      icon: FaBell,
      description: "Send messages to users"
    },
    {
      id: "analytics" as TabType,
      label: "Analytics",
      icon: FaChartLine,
      description: "View platform statistics"
    },
    {
      id: "users" as TabType,
      label: "User Management",
      icon: FaUsers,
      description: "Manage user accounts"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "approvals":
        return <ListingApproval />;
      case "notifications":
        return <NotificationSender />;
      case "analytics":
        return (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <FaChartLine className="text-4xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-400">Platform analytics and reporting features will be available here.</p>
          </div>
        );
      case "users":
        return (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <FaUsers className="text-4xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">User Management Coming Soon</h3>
            <p className="text-gray-400">User management features will be available here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage listings, users, and platform notifications</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Description */}
            <div className="mt-4">
              <p className="text-gray-400 text-sm">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}