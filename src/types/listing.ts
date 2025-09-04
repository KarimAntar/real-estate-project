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
  ownerId: string;             // <-- add this
  userName?: string;           // <-- fetched from users collection
  userEmail?: string;          // optional (for fallback or debugging)
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
  newImages: File[];
  docId?: string;        // newly selected files
}

// ✅ The payload you send to DB
export type ListingPayload = Omit<ListingFormData, "newImages" | "existingImages" | "price"> & {
  price: number;
  images: string[];
};
