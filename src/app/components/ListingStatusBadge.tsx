"use client";

import { FaClock, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { ListingStatus } from "@/types/notification";

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export default function ListingStatusBadge({ 
  status, 
  className = "" 
}: ListingStatusBadgeProps) {
  const getStatusConfig = (status: ListingStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Under Review",
          icon: FaClock,
          className: "bg-yellow-600 text-white",
        };
      case "approved":
        return {
          label: "Approved",
          icon: FaCheck,
          className: "bg-green-600 text-white",
        };
      case "declined":
        return {
          label: "Declined",
          icon: FaTimes,
          className: "bg-red-600 text-white",
        };
      default:
        return {
          label: "Unknown",
          icon: FaEye,
          className: "bg-gray-600 text-white",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>
  );
}