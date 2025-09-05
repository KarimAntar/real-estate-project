// src/types/listing.ts

// What your DB / API expects
export interface Listing {
  id: string;                  // business ID / UUID
  docId?: string;              // Firestore document ID (optional)
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  images: string[];
  ownerId: string;             // User who owns this listing
  userName?: string;           // Fetched from users collection (optional)
  userEmail?: string;          // Optional (for fallback or debugging)
  createdAt?: string;          // ✅ Added timestamp fields
  updatedAt?: string;          // ✅ Added timestamp fields
}

// What the form gives you
export interface ListingFormData {
  title: string;
  description: string;
  city: string;
  price: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  bedrooms: number;
  bathrooms: number;
  area: number;
  existingImages: string[]; // already uploaded images
  newImages: File[];        // newly selected files
  docId?: string;           // Firestore document ID for editing
}

// ✅ The payload you send to DB
export type ListingPayload = Omit<ListingFormData, "newImages" | "existingImages" | "price"> & {
  price: number;
  images: string[];
  createdAt?: string;         // ✅ Added timestamp fields
  updatedAt?: string;         // ✅ Added timestamp fields
};