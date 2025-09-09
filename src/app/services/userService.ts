// src/app/services/userService.ts
import axios from "axios";
import { Listing, ListingFormData } from "@/types/listing";
import { auth, db, storage } from "@/app/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable, StorageReference } from "firebase/storage";

// src/services/userService.ts - Updated with notification system

import { getAuth } from "firebase/auth";
import { createNotification } from "@/app/api/notifications/route";

const API_BASE_URL = "/api";

// Get auth token
const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not authenticated");
  return await user.getIdToken();
};

// Add listing (now creates as pending)
export const addListing = async (listingData: Listing): Promise<Listing> => {
  const token = await getAuthToken();
  
  // Add status as pending for all new listings
  const listingWithStatus = {
    ...listingData,
    status: "pending" as const,
  };

  const response = await fetch(`${API_BASE_URL}/listings`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingWithStatus),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create listing");
  }

  const result = await response.json();
  
  // Create notification for user about listing being under review
  await createNotification({
    userId: listingData.userId,
    type: "listing_review",
    title: "Listing Submitted for Review",
    message: `Your listing "${listingData.title}" has been submitted and is now under review. We'll notify you once it's approved.`,
    listingId: result.docId || result.id,
  });

  return result;
};

// Get listings by user (only approved + user's own pending/declined)
export const getListingsByUser = async (userId: string): Promise<Listing[]> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/listings?userId=${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
};

// Get all listings with users (admin only)
export const getAllListingsWithUsers = async (): Promise<Listing[]> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/listings?admin=true`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
};

// Get approved listings for public view
export const getApprovedListings = async (): Promise<Listing[]> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/listings/public`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch approved listings");
  }

  return response.json();
};

// Update listing
export const updateListing = async (listingId: string, updates: Partial<Listing>): Promise<Listing> => {
  const token = await getAuthToken();
  
  // When updating, set status back to pending if content changed
  const significantFields = ['title', 'description', 'price', 'city', 'type', 'bedrooms', 'bathrooms', 'area'];
  const hasSignificantChanges = significantFields.some(field => field in updates);
  
  const updateData = {
    ...updates,
    // Reset to pending if significant changes were made
    ...(hasSignificantChanges && { status: "pending" }),
  };

  const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update listing");
  }

  const result = await response.json();

  // If significant changes were made, notify user about re-review
  if (hasSignificantChanges) {
    await createNotification({
      userId: updates.userId || updates.ownerId!,
      type: "listing_review",
      title: "Listing Updated - Under Review",
      message: `Your updated listing "${updates.title || 'listing'}" is now under review again due to significant changes.`,
      listingId: listingId,
    });
  }

  return result;
};

// Delete listing
export const deleteListing = async (listingId: string): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete listing");
  }
};

// Upload images directly
export const uploadImagesDirect = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const token = await getAuthToken();
  
  const formData = new FormData();
  files.forEach(file => {
    formData.append("images", file);
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        // Call progress for all files (simplified)
        files.forEach((_, index) => onProgress(index, progress));
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.urls || []);
      } else {
        reject(new Error("Failed to upload images"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.open("POST", `${API_BASE_URL}/listings/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
};

// Delete image
export const deleteImage = async (imageUrl: string): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/listings/image`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete image");
  }
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const updateUser = async (id: string, updates: any) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, updates);
};

export const suspendUser = async (id: string, suspend: boolean) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, { suspended: suspend });
};