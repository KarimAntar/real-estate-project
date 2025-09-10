// src/app/services/userService.ts
import { Listing } from "@/types/listing";
import { db } from "@/app/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
  deleteDoc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { ListingWithStatus } from "@/types/notification";
import { getAuth } from "firebase/auth";
import { sendNotificationToUser } from "../services/notificationService";

const API_BASE_URL = "/api";

// Get auth token
const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not authenticated");
  return await user.getIdToken();
};

// Add listing (creates as pending) + notify
export const addListing = async (listingData: Listing): Promise<Listing> => {
  const token = await getAuthToken();

  const listingWithStatus = {
    ...listingData,
    status: "pending" as const,
  };

  const response = await fetch(`${API_BASE_URL}/listings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingWithStatus),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create listing");
  }

  const newListing: Listing = await response.json();

  // 🔔 Notify owner
  if (listingData.ownerId || listingData.userId) {
    await sendNotificationToUser(listingData.ownerId || listingData.userId, {
      title: "Listing Submitted for Review",
      message: `Your listing "${listingData.title}" has been submitted for review.`,
      listingId: newListing.id || newListing.docId,
    });
  }

  return newListing;
};

// Get approved listings (public)
export const getApprovedListings = async (): Promise<Listing[]> => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/listings/public`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch approved listings");
  }

  return response.json();
};

// Update listing + notify
export const updateListing = async (
  listingId: string,
  updates: Partial<Listing>
): Promise<Listing> => {
  const token = await getAuthToken();

  const significantFields = [
    "title",
    "description",
    "price",
    "city",
    "type",
    "bedrooms",
    "bathrooms",
    "area",
  ];
  const hasSignificantChanges = significantFields.some(
    (field) => field in updates
  );

  const updateData = {
    ...updates,
    ...(hasSignificantChanges && { status: "pending" }),
  };

  const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update listing");
  }

  const updatedListing: Listing = await response.json();

  // 🔔 Notify owner
  const ownerId = updates.ownerId || updates.userId;
  if (ownerId) {
    await sendNotificationToUser(ownerId, {
      title: "Listing Updated",
      message: `Your listing "${updates.title || "Untitled"}" has been updated.`,
      listingId: listingId,
    });
  }

  return updatedListing;
};

// Upload images
export const uploadImagesDirect = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const token = await getAuthToken();

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete image");
  }
};

// User management
export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const updateUser = async (id: string, updates: any) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, updates);
};

export const suspendUser = async (id: string, suspend: boolean) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, { suspended: suspend });
};

// Get listings by user
export const getListingsByUser = async (
  ownerId: string
): Promise<ListingWithStatus[]> => {
  try {
    const q = query(
      collection(db, "listings"),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    const listings: ListingWithStatus[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      docId: docSnap.id,
      ...docSnap.data(),
      status: docSnap.data().status || "pending",
    })) as ListingWithStatus[];

    return listings;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw new Error("Failed to fetch listings");
  }
};

// Get all listings (with user info)
export const getAllListingsWithUsers = async (): Promise<
  ListingWithStatus[]
> => {
  try {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const listingsWithUsers: ListingWithStatus[] = [];

    for (const docSnap of snapshot.docs) {
      const listingData = docSnap.data();

      let userName = "Unknown User";
      let userEmail = "unknown@email.com";

      if (listingData.ownerId || listingData.userId) {
        try {
          const userDoc = await getDoc(
            doc(db, "users", listingData.ownerId || listingData.userId)
          );
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.fullName || "Unknown User";
            userEmail = userData.email || "unknown@email.com";
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
        }
      }

      listingsWithUsers.push({
        id: docSnap.id,
        docId: docSnap.id,
        ...listingData,
        userName,
        userEmail,
        status: listingData.status || "pending",
      } as ListingWithStatus);
    }

    return listingsWithUsers;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw new Error("Failed to fetch listings");
  }
};

// Delete listing
export const deleteListing = async (docId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "listings", docId));
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing");
  }
};

// Admin: Get pending listings for review
export const getPendingListings = async (): Promise<ListingWithStatus[]> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/listings/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch pending listings");
  }

  return response.json();
};

// Admin: Approve or decline a listing
export const approveListing = async (
  listingId: string,
  status: "approved" | "declined",
  adminNote?: string
): Promise<void> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/listings/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listingId, status, adminNote }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to process listing approval");
  }
};