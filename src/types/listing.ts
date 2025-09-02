// src/types/listing.ts

// What your DB / API expects
export interface Listing {
  id: string; // Firestore ID or UUID
  title: string;
  description: string;
  price: number; // stored as number
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  images: string[]; // stored as URLs
}

// What the form gives you
export interface ListingFormData {
  title: string;
  description: string;
  price: string; // still string for input binding
  city: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  bedrooms: number;
  bathrooms: number;
  area: number;

  existingImages: string[]; // already in DB
  newImages: File[];        // pending uploads
}

// ✅ The payload you send to DB
export type ListingPayload = Omit<ListingFormData, "newImages" | "existingImages" | "price"> & {
  price: number;
  images: string[];
};
