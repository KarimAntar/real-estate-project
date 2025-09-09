// src/app/dashboard/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/app/components/dashboard/ProtectedRoute";
import { FaBell, FaTrash, FaCheck, FaEye, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";
import { Notification } from "@/types/notification";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from "../../services/notificationService";
import { formatDistanceToNow, format } from "date-fns";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return;
    
    setProcessingIds(prev => new Set([...prev, notificationId]));
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error("Failed to mark notification as read");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return;
    if (!confirm("Are you sure you want to delete this notification?")) return;
    
    setProcessingIds(prev => new Set([...prev, notificationId]));
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'listing_approved':
        return '✅';
      case 'listing_declined':
        return '❌';
      case 'listing_review':
        return '👁️';
      case 'admin_message':
        return '📢';
      default:
        return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'listing_approved':
        return 'text-green-400';
      case 'listing_declined':
        return 'text-red-400';
      case 'listing_review':
        return 'text-yellow-400';
      case 'admin_message':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
              <p className="text-gray-400">Loading notifications...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FaCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "all", label: "All", count: notifications.length },
                  { key: "unread", label: "Unread", count: unreadCount },
                  { key: "read", label: "Read", count: notifications.length - unreadCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      filter === tab.key
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        filter === tab.key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaBell className="text-4xl text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === "all" ? "No Notifications" : `No ${filter} Notifications`}
              </h3>
              <p className="text-gray-400">
                {filter === "all" 
                  ? "You don't have any notifications yet." 
                  : `You don't have any ${filter} notifications.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-800 rounded-lg p-6 shadow-lg border transition-all hover:shadow-xl ${
                    !notification.read 
                      ? 'border-blue-500/50 bg-gray-800/80' 
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <span className="text-3xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold ${
                          !notification.read ? 'text-white' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <p className={`mb-3 ${
                        !notification.read ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {notification.message}
                      </p>

                      {/* Admin note for declined listings */}
                      {notification.adminNote && (
                        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-red-300">
                            <strong>Admin Note:</strong> {notification.adminNote}
                          </p>
                        </div>
                      )}
                      
                      {/* Meta information */}
                      <div className="flex justify-between items-center text-sm">
                        <span className={`${getNotificationColor(notification.type)} font-medium`}>
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        <div className="flex items-center gap-4 text-gray-500">
                          <span title={format(new Date(notification.createdAt), 'PPpp')}>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={processingIds.has(notification.id)}
                                className="text-blue-400 hover:text-blue-300 p-1 disabled:opacity-50"
                                title="Mark as read"
                              >
                                {processingIds.has(notification.id) ? (
                                  <FaSpinner className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FaEye className="w-3 h-3" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              disabled={processingIds.has(notification.id)}
                              className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                              title="Delete"
                            >
                              {processingIds.has(notification.id) ? (
                                <FaSpinner className="w-3 h-3 animate-spin" />
                              ) : (
                                <FaTrash className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}