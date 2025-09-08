// src/app/services/userService.ts
import axios from "axios";
import { Listing, ListingFormData } from "@/types/listing";
import { auth, db, storage } from "@/app/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
// Firebase Storage Image Upload (Client-side)
// ----------------------

// Upload Single Image using client-side Firebase Storage
export const uploadImageDirect = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds 5MB limit`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `listings/${user.uid}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // Create storage reference
  const storageRef = ref(storage, fileName);

  try {
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload Multiple Images using client-side Firebase Storage
export const uploadImagesDirect = async (files: File[]): Promise<string[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  if (files.length > 10) {
    throw new Error("Maximum 10 files allowed per upload");
  }

  const uploadPromises = files.map((file, index) => uploadImageDirect(file));
  
  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Upload Image via API (Server-side)
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

// Upload Multiple Images via API (Server-side)
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

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    // Extract file path from Firebase Storage URL
    // Firebase Storage URLs look like: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media&token=...
    // or: https://storage.googleapis.com/bucket/path/to/file
    
    let filePath = '';
    
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      // Extract from Firebase Storage URL
      const urlParts = imageUrl.split('/o/')[1];
      if (urlParts) {
        filePath = decodeURIComponent(urlParts.split('?')[0]);
      }
    } else if (imageUrl.includes('storage.googleapis.com')) {
      // Extract from Google Cloud Storage URL
      const urlParts = imageUrl.split(`storage.googleapis.com/`)[1];
      if (urlParts) {
        const pathParts = urlParts.split('/');
        pathParts.shift(); // Remove bucket name
        filePath = pathParts.join('/');
      }
    }

    if (!filePath) {
      throw new Error('Unable to parse image URL');
    }

    // Verify the file belongs to the current user
    if (!filePath.startsWith(`listings/${user.uid}/`)) {
      throw new Error('Unauthorized to delete this image');
    }

    // Delete from Firebase Storage
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    console.log('Image deleted successfully:', filePath);
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
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