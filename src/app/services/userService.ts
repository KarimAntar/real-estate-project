// src/app/services/userService.ts
import axios from "axios";
import { Listing, ListingFormData } from "@/types/listing";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

// Axios instance
const api = axios.create({
  baseURL: "/api",
});

// ----------------------
// Auth
// ----------------------
export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (
  fullName: string,
  email: string,
  password: string
) => {
  const res = await api.post("/auth/register", { fullName, email, password });
  return res.data;
};

// ----------------------
// Profile
// ----------------------
export const getUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const res = await api.get("/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateUserProfile = async (data: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const res = await api.put("/user/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ----------------------
// Listings
// ----------------------

// Add Listing
export const addListing = async (listing: Listing): Promise<Listing> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  // Generate ID if missing
  if (!listing.id) listing.id = uuidv4();

  const res = await api.post("/listings", listing, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Update Listing
export const updateListing = async (
  id: string,
  data: Partial<Omit<Listing, "userId">>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const payload = {
    ...data,
    price: data.price !== undefined ? Number(data.price) : undefined,
  };

  // PUT to dynamic route /listings/:id
  const res = await api.put(`/listings/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Delete Listing
export const deleteListing = async (id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  // DELETE to dynamic route /listings/:id
  const res = await api.delete(`/listings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// ----------------------
// Image Upload (Updated for Vercel Blob)
// ----------------------

// Upload Single Image
export const uploadImage = async (formData: FormData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const res = await api.post("/listings/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Upload Multiple Images (New function for better handling)
export const uploadImages = async (files: File[]): Promise<{ urls: string[] }> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const formData = new FormData();
  files.forEach(file => {
    formData.append("images", file);
  });

  const res = await api.post("/listings/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Transform form -> Listing
export function transformFormToListing(
  form: ListingFormData,
  id?: string,
  imageUrls: string[] = []
): Listing {
  return {
    id: id || uuidv4(), // always ensure unique ID
    ownerId: auth.currentUser?.uid || "",
    title: form.title,
    description: form.description,
    price: Number(form.price),
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    area: Number(form.area),
    city: form.city,
    type: form.type,
    images: imageUrls,
  };
}

// ----------------------
// Listings Fetch Functions
// ----------------------

// 🔹 User: get listings by specific userId (Firestore query)
export const getListingsByUser = async (uid: string): Promise<Listing[]> => {
  const q = query(collection(db, "listings"), where("ownerId", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Listing;
    return {
      docId: docSnap.id,   // Firestore document ID (for edit/delete)
      ...data,             // internal id, title, etc.
    };
  });
};

// 🔹 Admin: get all listings with user info
export async function getAllListingsWithUsers(): Promise<Listing[]> {
  const listingsSnap = await getDocs(collection(db, "listings"));
  const listings: Listing[] = [];

  for (const listingDoc of listingsSnap.docs) {
    const listingData = listingDoc.data() as Listing;
    let userName = "Unknown User";
    let userEmail = "";

    if (listingData.ownerId) {
      const userDoc = await getDoc(doc(db, "users", listingData.ownerId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData?.fullName || "Unnamed";
        userEmail = userData?.email || "";
      }
    }

    listings.push({
      docId: listingDoc.id, // Firestore document ID
      ...listingData,
      userName,
      userEmail,
    });
  }

  return listings;
}

// ----------------------
// Helper Functions for Image Management
// ----------------------

// Delete image from Vercel Blob (if needed)
export const deleteImage = async (imageUrl: string) => {
  // Extract the blob filename from URL
  // Vercel Blob URLs typically look like: https://xyz.public.blob.vercel-storage.com/filename
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  try {
    // You might want to create a separate API endpoint for deleting images
    // For now, this is a placeholder - Vercel Blob deletion needs to be handled server-side
    console.log("Image deletion requested for:", imageUrl);
    // await api.delete("/listings/image", { 
    //   data: { imageUrl },
    //   headers: { Authorization: `Bearer ${token}` }
    // });
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw error;
  }
};