// src/app/services/userService.ts
import axios from "axios";
import { Listing, ListingFormData } from "@/types/listing";
import { auth } from "@/app/firebase/firebaseConfig";

// ----------------------
// Axios instance
// ----------------------
const api = axios.create({
  baseURL: "/api", // relative to your Next.js app
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
  const res = await api.post("/auth/register", {
    fullName,
    email,
    password,
  });
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
export const getUserListings = async (): Promise<Listing[]> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken(); // use live token instead of localStorage

    const res = await api.get("/listings", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return Array.isArray(res.data) ? res.data : [];
  } catch (err: any) {
    console.error("Failed to fetch listings:", err.response?.data || err.message || err);
    throw new Error(err.response?.data?.error || err.message || "Failed to fetch listings");
  }
};
// ✅ Add Listing
export const addListing = async (listing: ListingFormData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const payload = { ...listing, price: Number(listing.price) };
  const response = await api.post("/listings", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ✅ Update Listing
export const updateListing = async (id: string, data: ListingFormData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const payload = {
    title: data.title,
    description: data.description,
    city: data.city,
    type: data.type,
    price: Number(data.price),
    bedrooms: Number(data.bedrooms),
    bathrooms: Number(data.bathrooms),
    area: Number(data.area),
    images: data.images || [],
  };

  try {
    const res = await api.put(`/listings/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status !== 200) {
      throw new Error(res.data?.error || "Failed to update listing");
    }

    return res.data;
  } catch (err: any) {
    console.error("Error updating listing:", err.response?.data || err);
    throw new Error(err.response?.data?.error || err.message || "Failed to update listing");
  }
};

// ✅ Delete Listing
export const deleteListing = async (id: string | number) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const res = await api.delete(`/listings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status !== 200) {
    throw new Error("Delete failed");
  }
};

// ✅ Upload Image
export const uploadImage = async (formData: FormData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const response = await api.post("/listings/upload", formData, {
    headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ✅ Transform form -> API listing
export function transformFormToListing(
  form: ListingFormData,
  id: string,
  imageUrls: string[]
): Listing {
  return {
    id,
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
