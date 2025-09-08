// src/app/components/ProfilePictureUpload.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { FaCamera, FaTrash, FaSpinner, FaGoogle, FaUser, FaUpload } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { storage } from "../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hovering, setHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!user) {
      toast.error("Please log in to upload a profile picture");
      return;
    }

    // Validate file
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast.error(`Unsupported file type. Please use JPEG, PNG, or WebP.`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`File size must be less than 2MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        await deleteOldProfilePicture(user.profilePicture);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `profiles/${user.uid}/profile-${timestamp}.${file.type.split('/')[1]}`;
      
      // Create storage reference
      const storageRef = ref(storage, fileName);

      // Create upload task with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Promise to handle upload completion
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            // Progress tracking
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
            console.log('Upload progress:', progress);
          }, 
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          }, 
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Update user profile
              await updateUserProfile({ 
                profilePicture: downloadURL 
              });

              toast.success("Profile picture updated successfully!");
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        );
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteOldProfilePicture = async (imageUrl: string) => {
    try {
      if (!imageUrl.includes('firebasestorage.googleapis.com') && 
          !imageUrl.includes('storage.googleapis.com')) {
        return; // External URL, can't delete
      }

      let filePath = '';
      
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        const urlParts = imageUrl.split('/o/')[1];
        if (urlParts) {
          filePath = decodeURIComponent(urlParts.split('?')[0]);
        }
      }

      if (filePath && filePath.startsWith(`profiles/${user?.uid}/`)) {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
        console.log('Old profile picture deleted');
      }
    } catch (error) {
      console.warn('Failed to delete old profile picture:', error);
    }
  };

  const handleImportFromGoogle = async () => {
    if (!user?.googlePhotoURL) {
      toast.error("No Google profile photo available");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        await deleteOldProfilePicture(user.profilePicture);
      }

      // Fetch Google photo
      let photoUrl = user.googlePhotoURL;
      if (photoUrl.includes('googleusercontent.com')) {
        photoUrl = photoUrl.replace(/=s\d+-c/, '=s400-c');
        if (!photoUrl.includes('=s')) {
          photoUrl = `${photoUrl}=s400-c`;
        }
      }

      const response = await fetch(photoUrl);
      if (!response.ok) throw new Error('Failed to fetch Google photo');

      const blob = await response.blob();
      const file = new File([blob], 'google-profile.jpg', { type: 'image/jpeg' });

      // Upload the file
      await handleUpload(file);

    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import Google photo");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!user?.profilePicture) return;
    
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setUploading(true);
    try {
      await deleteOldProfilePicture(user.profilePicture);
      
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
            className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center cursor-pointer transition-opacity rounded-full"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <FaSpinner className="text-white text-xl animate-spin mb-1" />
                <span className="text-white text-xs">{uploadProgress}%</span>
              </>
            ) : (
              <FaCamera className="text-white text-xl" />
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">{uploadProgress}% uploaded</p>
        </div>
      )}

      {/* Action Buttons */}
      {showUploadButton && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <FaUpload className="w-3 h-3" />
            Upload
          </button>

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