// src/app/services/notificationService.ts

import { getAuth } from "firebase/auth";
import { Notification, NotificationCreateData, AdminNotificationData } from "@/types/notification";

const API_BASE_URL = "/api";

// Get auth token
const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not authenticated");
  return await user.getIdToken();
};

// Get user notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ read: true }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete notification");
  }
};

// Admin: Send notification to all users
export const sendNotificationToAllUsers = async (data: Omit<AdminNotificationData, "type" | "userId">): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to send broadcast notification");
  }
};

// Send notification to specific user
export const sendNotificationToUser = async (userId: string, data: Omit<AdminNotificationData, "type" | "userId">): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/user`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, ...data }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to send notification to user");
  }
};


// Admin: Get all users for notification targeting
export const getAllUsers = async () => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};