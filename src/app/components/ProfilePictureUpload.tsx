// src/app/components/ProfilePictureUpload.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { 
  FaCamera, 
  FaTrash, 
  FaSpinner, 
  FaGoogle, 
  FaUser,
  FaUpload 
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { 
  uploadProfilePicture, 
  deleteProfilePicture, 
  importGoogleProfilePhoto,
  getUserProfilePicture 
} from "../services/profileService";
import ProfileImage from "./ProfileImage";

interface ProfilePictureUploadProps {
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
  showImportButton?: boolean;
  className?: string;
}

export default function ProfilePictureUpload({ 
  size = "md", 
  showUploadButton = true,
  showImportButton = true,
  className = "" 
}: ProfilePictureUploadProps) {
  const { user, updateUserProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  // Map size prop to actual pixel size for inline style
  const sizeMap: Record<"sm" | "md" | "lg", number> = {
    sm: 64,
    md: 96,
    lg: 128,
  };
  const actualSize = sizeMap[size];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      // Delete old custom profile picture if exists
      if (user.profilePicture) {
        await deleteProfilePicture(user.profilePicture);
      }

      // Upload new profile picture
      const newProfileUrl = await uploadProfilePicture(file);
      
      // Update user profile
      await updateUserProfile({ 
        profilePicture: newProfileUrl 
      });

      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportFromGoogle = async () => {
    if (!user?.googlePhotoURL) {
      toast.error("No Google profile photo available");
      return;
    }

    setUploading(true);
    try {
      // Delete old custom profile picture if exists
      if (user.profilePicture) {
        await deleteProfilePicture(user.profilePicture);
      }

      // Import Google photo to Firebase Storage
      const newProfileUrl = await importGoogleProfilePhoto(user.googlePhotoURL);
      
      // Update user profile
      await updateUserProfile({ 
        profilePicture: newProfileUrl 
      });

      toast.success("Google profile photo imported successfully!");
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import Google photo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.profilePicture) return;
    
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setUploading(true);
    try {
      // Delete from Firebase Storage
      await deleteProfilePicture(user.profilePicture);
      
      // Update user profile
      await updateUserProfile({ 
        profilePicture: "" 
      });

      toast.success("Profile picture removed successfully!");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to remove profile picture");
    } finally {
      setUploading(false);
    }
  };

  const currentProfilePicture = getUserProfilePicture(user);
  const hasCustomPicture = user?.profilePicture;
  const hasGooglePhoto = user?.googlePhotoURL && user.signInMethod === 'google.com';

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      <div 
        className={`relative rounded-full overflow-hidden border-4 border-gray-600 hover:border-gray-500 transition-colors group`}
        style={{ width: actualSize, height: actualSize }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <ProfileImage 
          user={user}
          size={actualSize}
          className=""
          alt="Profile Picture"
        />
        
        {/* Upload Overlay */}
        {showUploadButton && (hovering || uploading) && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <FaSpinner className="text-white text-xl animate-spin" />
            ) : (
              <FaCamera className="text-white text-xl" />
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <FaSpinner className="text-white text-xl animate-spin" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showUploadButton && (
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <FaUpload className="w-3 h-3" />
            Upload
          </button>

          {/* Import from Google Button */}
          {showImportButton && hasGooglePhoto && !hasCustomPicture && (
            <button
              onClick={handleImportFromGoogle}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <FaGoogle className="w-3 h-3" />
              Import Google Photo
            </button>
          )}

          {/* Remove Button */}
          {hasCustomPicture && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <FaTrash className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Photo Source Indicator */}
      <div className="text-xs text-gray-400 text-center">
        {hasCustomPicture ? (
          <span className="flex items-center gap-1">
            <FaUpload className="w-3 h-3" />
            Custom Upload
          </span>
        ) : hasGooglePhoto ? (
          <span className="flex items-center gap-1">
            <FaGoogle className="w-3 h-3" />
            Google Photo
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <FaUser className="w-3 h-3" />
            Default Avatar
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}