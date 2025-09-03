// src/app/services/userService.ts
import axios from "axios";
import { Listing, ListingFormData } from "@/types/listing";
import { auth } from "@/app/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // <- added for unique IDs

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
export const getUserListings = async (admin = false): Promise<Listing[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const res = await api.get("/listings", {
    headers: { Authorization: `Bearer ${token}` },
    params: admin ? { admin: "true" } : {},
  });

  // Ensure each listing has an id
  return Array.isArray(res.data)
    ? res.data.map((l) => ({ ...l, id: l.id || uuidv4() }))
    : [];
};

// Add Listing
export const addListing = async (listing: Listing): Promise<Listing> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const token = await user.getIdToken();

  // Generate an ID if missing
  if (!listing.id) listing.id = uuidv4();

  const res = await api.post("/listings", listing, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data; // should include `id`
};

// Update Listing
export const updateListing = async (
  id: string,
  data: Partial<Omit<Listing, "id" | "ownerId">>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();

  const payload = {
    ...data,
    price: data.price !== undefined ? Number(data.price) : undefined,
  };

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

  const res = await api.delete(`/listings?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Upload Image
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
