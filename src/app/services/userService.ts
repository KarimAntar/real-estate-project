// src/app/services/userService.ts - Updated addListing function
import axios from "axios";
import { Listing, ListingFormData } from "@/types/listing";
import { auth, db, storage } from "@/app/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable, StorageReference } from "firebase/storage";

// Axios instance with better error handling
const api = axios.create({
  baseURL: "/api",
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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
// Listings - Updated Functions
// ----------------------

// Add Listing - FIXED VERSION
export const addListing = async (listing: Listing): Promise<Listing> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  
  try {
    const token = await user.getIdToken();
    console.log("User token obtained successfully");

    // Ensure all required fields are present and properly formatted
    const listingData = {
      title: listing.title?.trim(),
      description: listing.description?.trim(),
      city: listing.city?.trim(),
      price: Number(listing.price),
      type: listing.type || "Home",
      bedrooms: Number(listing.bedrooms) || 0,
      bathrooms: Number(listing.bathrooms) || 0,
      area: Number(listing.area) || 0,
      images: listing.images || [],
      // Don't include id in the request body - let the server generate it
    };

    // Validate required fields
    if (!listingData.title) throw new Error("Title is required");
    if (!listingData.description) throw new Error("Description is required");
    if (!listingData.city) throw new Error("City is required");
    if (isNaN(listingData.price) || listingData.price <= 0) throw new Error("Valid price is required");

    console.log("Sending listing data:", listingData);

    const res = await api.post("/listings", listingData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Listing creation response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Add listing error:", error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const errorMsg = error.response.data?.error || error.response.data?.details || `Server error: ${error.response.status}`;
      throw new Error(errorMsg);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Something else happened
      throw new Error(error.message || "Failed to create listing");
    }
  }
};

// Get Listings - Updated
export const getListings = async (adminView = false): Promise<Listing[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  
  try {
    const token = await user.getIdToken();
    const url = adminView ? "/listings?admin=true" : "/listings";
    
    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data || [];
  } catch (error: any) {
    console.error("Get listings error:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch listings");
  }
};

// Update Listing
export const updateListing = async (
  id: string,
  data: Partial<Omit<Listing, "userId">>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  
  try {
    const token = await user.getIdToken();

    const payload = {
      ...data,
      price: data.price !== undefined ? Number(data.price) : undefined,
    };

    const res = await api.put(`/listings/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error: any) {
    console.error("Update listing error:", error);
    throw new Error(error.response?.data?.error || "Failed to update listing");
  }
};

// Delete Listing
export const deleteListing = async (id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  
  try {
    const token = await user.getIdToken();

    const res = await api.delete(`/listings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error: any) {
    console.error("Delete listing error:", error);
    throw new Error(error.response?.data?.error || "Failed to delete listing");
  }
};

// ----------------------
// Firebase Storage Image Upload (Client-side)
// ----------------------

// Upload Single Image using client-side Firebase Storage
export const uploadImageDirect = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
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
    // Use uploadBytesResumable for progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
        }, 
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Failed to upload image'));
        }, 
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(new Error('Failed to get download URL'));
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload multiple images with progress tracking
export const uploadImagesDirect = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  if (files.length > 10) {
    throw new Error("Maximum 10 files allowed per upload");
  }

  const uploadPromises = files.map((file, index) => 
    uploadImageDirect(file, (progress) => onProgress?.(index, progress))
  );
  
  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Upload Multiple Images via API (Server-side) - Alternative method
export const uploadImages = async (files: File[]): Promise<{ urls: string[] }> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  
  try {
    const token = await user.getIdToken();

    const formData = new FormData();
    files.forEach(file => {
      formData.append("images", file);
    });

    const res = await api.post("listings/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    
    return res.data;
  } catch (error: any) {
    console.error('Server upload error:', error);
    throw new Error(error.response?.data?.error || "Failed to upload images");
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
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
    id: id || uuidv4(),
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
// Listings Fetch Functions (Direct Firestore)
// ----------------------

// Get listings by specific user (Firestore query)
export const getListingsByUser = async (uid: string): Promise<Listing[]> => {
  const q = query(collection(db, "listings"), where("ownerId", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Listing;
    return {
      docId: docSnap.id,
      ...data,
    };
  });
};

// Get all listings with user info (Admin function)
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
      docId: listingDoc.id,
      ...listingData,
      userName,
      userEmail,
    });
  }

  return listings;
}