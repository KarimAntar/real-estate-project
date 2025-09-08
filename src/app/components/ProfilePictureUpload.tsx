// src/app/components/ProfilePictureUpload.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { FaCamera, FaTrash, FaSpinner, FaGoogle, FaUser, FaUpload, FaImage } from "react-icons/fa";
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
    setHovering(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHovering(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHovering(false);
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast.error("Please log in to upload a profile picture");
      return;
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error(`Unsupported file type. Please use JPEG, PNG, WebP, or GIF.`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`File size must be less than 5MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Delete old profile picture if exists
      if (user.profilePicture && user.profilePicture.includes('firebasestorage.googleapis.com')) {
        await deleteOldProfilePicture(user.profilePicture);
      }

      // Generate unique filename with better organization
      const timestamp = Date.now();
      const fileExtension = file.type.split('/')[1];
      const fileName = `profiles/${user.uid}/profile-${timestamp}.${fileExtension}`;
      
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
      if (error.code === 'storage/unauthorized') {
        toast.error("Upload failed: Please check your permissions");
      } else if (error.code === 'storage/quota-exceeded') {
        toast.error("Storage quota exceeded. Please try again later.");
      } else {
        toast.error(error.message || "Failed to upload profile picture");
      }
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
      // Don't throw error as this shouldn't stop the upload process
    }
  };

  const handleImportFromGoogle = async () => {
    if (!user?.googlePhotoURL) {
      toast.error("No Google profile photo available");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Delete old profile picture if exists
      if (user.profilePicture && user.profilePicture.includes('firebasestorage.googleapis.com')) {
        await deleteOldProfilePicture(user.profilePicture);
      }

      setUploadProgress(30);

      // Fetch Google photo with higher resolution
      let photoUrl = user.googlePhotoURL;
      if (photoUrl.includes('googleusercontent.com')) {
        // Remove existing size parameters and add high resolution
        photoUrl = photoUrl.replace(/=s\d+-c/, '=s400-c');
        if (!photoUrl.includes('=s')) {
          photoUrl = `${photoUrl}=s400-c`;
        }
      }

      setUploadProgress(50);

      const response = await fetch(photoUrl);
      if (!response.ok) throw new Error('Failed to fetch Google photo');

      const blob = await response.blob();
      const file = new File([blob], 'google-profile.jpg', { type: 'image/jpeg' });

      setUploadProgress(70);

      // Upload the file using the same upload logic
      const timestamp = Date.now();
      const fileName = `profiles/${user.uid}/google-profile-${timestamp}.jpg`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = 70 + (snapshot.bytesTransferred / snapshot.totalBytes) * 30;
            setUploadProgress(Math.round(progress));
          }, 
          (error) => reject(error), 
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              await updateUserProfile({ profilePicture: downloadURL });
              toast.success("Google photo imported successfully!");
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        );
      });

    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import Google photo");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!user?.profilePicture) {
      toast.error("No profile picture to remove");
      return;
    }
    
    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setUploading(true);
    try {
      // Delete the image from Firebase Storage
      if (user.profilePicture.includes('firebasestorage.googleapis.com')) {
        await deleteOldProfilePicture(user.profilePicture);
      }
      
      // Update user profile to remove the picture URL
      await updateUserProfile({ 
        profilePicture: undefined // Set to undefined to clear it
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
      {/* Profile Picture Display with Drag & Drop */}
      <div 
        className={`relative rounded-full overflow-hidden border-4 transition-all duration-200 group cursor-pointer ${
          hovering 
            ? 'border-blue-500 shadow-lg shadow-blue-500/25 scale-105' 
            : uploading 
              ? 'border-yellow-500' 
              : 'border-gray-600 hover:border-gray-500'
        }`}
        style={{ width: actualSize, height: actualSize }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onDrop={showUploadButton ? handleDrop : undefined}
        onDragOver={showUploadButton ? handleDragOver : undefined}
        onDragLeave={showUploadButton ? handleDragLeave : undefined}
        onClick={() => showUploadButton && !uploading && fileInputRef.current?.click()}
      >
        <ProfileImage 
          user={user}
          size={actualSize}
          className=""
          alt="Profile Picture"
        />
        
        {/* Upload Overlay */}
        {showUploadButton && (hovering || uploading) && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center transition-opacity rounded-full backdrop-blur-sm">
            {uploading ? (
              <>
                <FaSpinner className="text-white text-xl animate-spin mb-2" />
                <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-white text-xs mt-1 font-medium">{uploadProgress}%</span>
              </>
            ) : (
              <>
                <FaCamera className="text-white text-xl mb-1" />
                <span className="text-white text-xs font-medium">
                  {hovering ? 'Drop to upload' : 'Click to upload'}
                </span>
              </>
            )}
          </div>
        )}

        {/* Loading Ring */}
        {uploading && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                stroke="rgba(59, 130, 246, 0.2)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="48"
                stroke="rgb(59, 130, 246)"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${uploadProgress * 3.02} 302`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showUploadButton && (
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <FaUpload className="w-4 h-4" />
            Upload Photo
          </button>

          {showImportButton && hasGooglePhoto && !hasCustomPicture && (
            <button
              onClick={handleImportFromGoogle}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <FaGoogle className="w-4 h-4" />
              Import from Google
            </button>
          )}

          {hasCustomPicture && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <FaTrash className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-center">
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Maximum 5MB • JPEG, PNG, WebP, GIF supported</p>
          {showUploadButton && (
            <p>• Drag & drop or click to upload</p>
          )}
          {hasGooglePhoto && !hasCustomPicture && (
            <p className="text-red-400">• Import your Google photo or upload a custom one</p>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}