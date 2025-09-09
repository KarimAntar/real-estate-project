// src/app/components/ListingStatusBadge.tsx
"use client";

import { FaClock, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { ListingStatus } from "@/types/notification";

interface ListingStatusBadgeProps {
  status: ListingStatus;
  adminNote?: string;
  className?: string;
}

export default function ListingStatusBadge({ 
  status, 
  adminNote, 
  className = "" 
}: ListingStatusBadgeProps) {
  const getStatusConfig = (status: ListingStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Under Review",
          icon: FaClock,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
          darkBgColor: "dark:bg-yellow-900/20",
          darkTextColor: "dark:text-yellow-300",
          darkBorderColor: "dark:border-yellow-700",
        };
      case "approved":
        return {
          label: "Approved",
          icon: FaCheck,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          darkBgColor: "dark:bg-green-900/20",
          darkTextColor: "dark:text-green-300",
          darkBorderColor: "dark:border-green-700",
        };
      case "declined":
        return {
          label: "Declined",
          icon: FaTimes,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          darkBgColor: "dark:bg-red-900/20",
          darkTextColor: "dark:text-red-300",
          darkBorderColor: "dark:border-red-700",
        };
      default:
        return {
          label: "Unknown",
          icon: FaEye,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          darkBgColor: "dark:bg-gray-900/20",
          darkTextColor: "dark:text-gray-300",
          darkBorderColor: "dark:border-gray-700",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          ${config.darkBgColor} ${config.darkTextColor} ${config.darkBorderColor}
        `}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>
      
      {/* Admin note for declined listings */}
      {status === "declined" && adminNote && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>Admin Feedback:</strong> {adminNote}
          </p>
        </div>
      )}
      
      {/* Help text */}
      {status === "pending" && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Your listing is being reviewed by our team. This usually takes 24-48 hours. 
            You'll receive a notification once it's approved.
          </p>
        </div>
      )}
      
      {status === "approved" && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            🎉 Your listing is live and visible to potential buyers on the platform!
          </p>
        </div>
      )}
    </div>
  );
}