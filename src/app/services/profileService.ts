// src/app/services/profileService.ts
import { auth, storage } from "@/app/firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Upload profile picture directly to Firebase Storage
export const uploadProfilePicture = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  // Validate file
  const maxSize = 2 * 1024 * 1024; // 2MB for profile pictures
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Please use JPEG, PNG, or WebP.`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds 2MB limit`);
  }

  // Generate unique filename for profile picture
  const timestamp = Date.now();
  const fileName = `profiles/${user.uid}/profile-${timestamp}.${file.type.split('/')[1]}`;

  // Create storage reference
  const storageRef = ref(storage, fileName);

  try {
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw new Error('Failed to upload profile picture');
  }
};

// Delete old profile picture from Firebase Storage
export const deleteProfilePicture = async (imageUrl: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    // Skip deletion for Google photos or external URLs
    if (!imageUrl.includes('firebasestorage.googleapis.com') && 
        !imageUrl.includes('storage.googleapis.com')) {
      return; // External URL, can't delete
    }

    // Extract file path from Firebase Storage URL
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

    if (!filePath) return; // Couldn't parse URL

    // Verify the file belongs to the current user
    if (!filePath.startsWith(`profiles/${user.uid}/`)) {
      throw new Error('Unauthorized to delete this image');
    }

    // Delete from Firebase Storage
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    console.log('Old profile picture deleted successfully:', filePath);
  } catch (error) {
    console.warn('Failed to delete old profile picture:', error);
    // Don't throw error here as it's not critical
  }
};

// Import Google profile photo to Firebase Storage
export const importGoogleProfilePhoto = async (googlePhotoURL: string): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    // Modify Google photo URL to get higher quality image
    let highQualityUrl = googlePhotoURL;
    if (googlePhotoURL.includes('googleusercontent.com')) {
      // Remove size parameter to get original size, then add our desired size
      highQualityUrl = googlePhotoURL.replace(/=s\d+-c/, '=s400-c');
      if (!highQualityUrl.includes('=s')) {
        highQualityUrl = `${googlePhotoURL}=s400-c`;
      }
    }

    // Fetch the Google photo
    const response = await fetch(highQualityUrl);
    if (!response.ok) throw new Error('Failed to fetch Google photo');

    const blob = await response.blob();
    
    // Create a File object
    const file = new File([blob], 'google-profile.jpg', { type: 'image/jpeg' });

    // Upload to Firebase Storage
    return await uploadProfilePicture(file);
  } catch (error) {
    console.error('Failed to import Google photo:', error);
    throw new Error('Failed to import Google profile photo');
  }
};

// Get user's current profile picture with fallbacks
export const getUserProfilePicture = (user: any) => {
  // Priority: Custom uploaded picture > Google photo > Default avatar
  if (user?.profilePicture && user.profilePicture.trim()) {
    return user.profilePicture;
  }
  
  if (user?.googlePhotoURL && user.googlePhotoURL.trim()) {
    // Ensure high quality Google photo
    let photoUrl = user.googlePhotoURL;
    if (photoUrl.includes('googleusercontent.com')) {
      // Remove existing size parameter and add high quality one
      photoUrl = photoUrl.replace(/=s\d+-c/, '=s400-c');
      if (!photoUrl.includes('=s')) {
        photoUrl = `${photoUrl}=s400-c`;
      }
    }
    return photoUrl;
  }
  
  // Generate default avatar based on initials - fixed URL encoding
  if (user?.fullName && user.fullName.trim()) {
    const name = user.fullName.trim();
    // Use a more reliable avatar service
    return `https://ui-avatars.com/api/?name=${name}&background=4F46E5&color=fff&size=400&bold=true&format=png`;
  }
  
  // Default anonymous avatar
  return `https://ui-avatars.com/api/?name=User&background=6B7280&color=fff&size=400&bold=true&format=png`;
};

// Generate initials from name
export const getInitials = (name: string): string => {
  if (!name || !name.trim()) return 'U';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return 'U';
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Alternative: Generate a data URL avatar (doesn't require external service)
export const generateAvatarDataUrl = (name: string, size: number = 150): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return getUserProfilePicture({ fullName: name }); // Fallback
  
  canvas.width = size;
  canvas.height = size;
  
  // Background
  ctx.fillStyle = '#4F46E5';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const initials = getInitials(name);
  ctx.fillText(initials, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
};

// Check if URL is a data URL or external URL that might cause issues
export const isProblematicUrl = (url: string): boolean => {
  if (!url) return true;
  
  // Check for data URLs
  if (url.startsWith('data:')) return false;
  
  // Check for Firebase Storage URLs (these should work fine)
  if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) {
    return false;
  }
  
  // Check for Google user content URLs
  if (url.includes('googleusercontent.com')) return false;
  
  // UI Avatars should work fine
  if (url.includes('ui-avatars.com')) return false;
  
  // Default to potentially problematic
  return true;
};