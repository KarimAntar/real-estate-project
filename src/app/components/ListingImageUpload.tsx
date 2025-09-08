// src/app/components/ListingImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { FaUpload, FaTrash, FaSpinner, FaImage } from "react-icons/fa";
import { storage } from "../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

interface ListingImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadProgress {
  [key: string]: number;
}

export default function ListingImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className = "",
}: ListingImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!user) {
      toast.error("Please log in to upload images");
      return;
    }

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate files
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Unsupported file type. Please use JPEG, PNG, WebP, or GIF.`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size must be less than 5MB`);
        return;
      }
    }

    setUploading(true);
    const newUploadProgress: UploadProgress = {};

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileId = `${Date.now()}-${index}`;
        newUploadProgress[fileId] = 0;
        setUploadProgress(prev => ({ ...prev, ...newUploadProgress }));

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `listings/${user.uid}/${timestamp}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Create storage reference
        const storageRef = ref(storage, fileName);

        // Create upload task with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({
                ...prev,
                [fileId]: Math.round(progress)
              }));
            }, 
            (error) => {
              console.error(`Upload error for ${file.name}:`, error);
              reject(new Error(`Failed to upload ${file.name}`));
            }, 
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(new Error(`Failed to get download URL for ${file.name}`));
              }
            }
          );
        });
      });

      const newImageUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newImageUrls]);
      
      toast.success(`Successfully uploaded ${files.length} image(s)`);

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    if (!confirm("Are you sure you want to remove this image?")) return;

    try {
      // Try to delete from Firebase Storage
      await deleteImageFromStorage(imageUrl);

      // Remove from images array
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      toast.success("Image removed successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to remove image");
    }
  };

  const deleteImageFromStorage = async (imageUrl: string) => {
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
      } else if (imageUrl.includes('storage.googleapis.com')) {
        const urlParts = imageUrl.split(`storage.googleapis.com/`)[1];
        if (urlParts) {
          const pathParts = urlParts.split('/');
          pathParts.shift(); // Remove bucket name
          filePath = pathParts.join('/');
        }
      }

      if (filePath && filePath.startsWith(`listings/${user?.uid}/`)) {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
      }
    } catch (error) {
      console.warn('Failed to delete image from storage:', error);
      // Don't throw error here as the main goal is to remove from UI
    }
  };

  const averageProgress = Object.keys(uploadProgress).length > 0 
    ? Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length)
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Property Images ({images.length}/{maxImages})
        </label>
        
        <div 
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="space-y-2">
              <FaSpinner className="mx-auto text-2xl text-blue-500 animate-spin" />
              <p className="text-gray-400">Uploading images... {averageProgress}%</p>
            </div>
          ) : (
            <div className="space-y-2">
              <FaUpload className="mx-auto text-2xl text-gray-400" />
              <p className="text-gray-400">
                Click to upload images or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP, GIF up to 5MB each (max {maxImages} images)
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && Object.keys(uploadProgress).length > 0 && (
          <div className="space-y-2">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Uploading...</span>
              <span>{averageProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Uploaded Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-700">
                  <Image
                    src={imageUrl}
                    alt={`Property image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-image.jpg';
                    }}
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveImage(imageUrl, index)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <FaTrash className="w-3 h-3" />
                </button>

                {/* Image Number */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || images.length >= maxImages}
        multiple
      />

      {/* Image Limit Warning */}
      {images.length >= maxImages && (
        <div className="text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg">
          <FaImage className="inline w-4 h-4 mr-2" />
          Maximum number of images ({maxImages}) reached. Remove some images to upload new ones.
        </div>
      )}
    </div>
  );
}