// src/types/notification.ts

export interface Notification {
  id: string;
  userId: string;
  type: "listing_review" | "listing_approved" | "listing_declined" | "admin_message" | "system";
  title: string;
  message: string;
  listingId?: string; // For listing-related notifications
  adminNote?: string; // For declined listings
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCreateData {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  listingId?: string;
  adminNote?: string;
}

// Listing approval status
export type ListingStatus = "pending" | "approved" | "declined";

// Extended listing interface with approval status
export interface ListingWithStatus {
  id: string;
  docId?: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  images: string[];
  userId: string;
  ownerId?: string;
  userName?: string;
  userEmail?: string;
  status: ListingStatus; // New field for approval status
  adminNote?: string; // Note from admin when declining
  reviewedBy?: string; // Admin who reviewed
  reviewedAt?: string; // When it was reviewed
  createdAt?: string;
  updatedAt?: string;
}

// Admin notification form data
export interface AdminNotificationData {
  type: "all_users" | "specific_user";
  userId?: string; // For specific user notifications
  title: string;
  message: string;
}