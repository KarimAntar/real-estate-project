// src/app/components/admin/NotificationSender.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPaperPlane, FaSpinner, FaUsers, FaUser } from "react-icons/fa";
import { 
  sendNotificationToAllUsers, 
  sendNotificationToUser, 
  getAllUsers 
} from "../../services/notificationService";

interface User {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  role: string;
}

export default function NotificationSender() {
  const [type, setType] = useState<"all_users" | "specific_user">("all_users");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for specific user selection
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      setUsers(data.filter((user: User) => user.role !== "admin")); // Exclude admins
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (type === "specific_user") {
      fetchUsers();
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (type === "specific_user" && !selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      if (type === "all_users") {
        await sendNotificationToAllUsers({ title: title.trim(), message: message.trim() });
        toast.success("Notification sent to all users!");
      } else {
        await sendNotificationToUser(selectedUserId, { title: title.trim(), message: message.trim() });
        const selectedUser = users.find(u => u.uid === selectedUserId);
        toast.success(`Notification sent to ${selectedUser?.fullName || selectedUser?.email}!`);
      }

      // Reset form
      setTitle("");
      setMessage("");
      setSelectedUserId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Send Notification</h2>
        <p className="text-gray-400">Send notifications to users</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Send To
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("all_users")}
              className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                type === "all_users"
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              <FaUsers className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">All Users</div>
                <div className="text-sm opacity-75">Send to everyone</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType("specific_user")}
              className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                type === "specific_user"
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              <FaUser className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Specific User</div>
                <div className="text-sm opacity-75">Send to one person</div>
              </div>
            </button>
          </div>
        </div>

        {/* User Selection (if specific user) */}
        {type === "specific_user" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select User
            </label>
            {loadingUsers ? (
              <div className="p-3 bg-gray-700 rounded-lg text-gray-400 text-center">
                <FaSpinner className="animate-spin inline mr-2" />
                Loading users...
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message..."
            rows={4}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {message.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (type === "specific_user" && loadingUsers)}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            loading
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg"
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <FaPaperPlane className="w-5 h-5" />
              Send Notification
            </>
          )}
        </button>
      </form>
    </div>
  );
}