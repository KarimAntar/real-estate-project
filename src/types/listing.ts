// src/types/listing.ts

// What your DB / API expects
export interface Listing {
  id: string;          // keep string for Firestore/UUID
  title: string;
  description: string;
  price: number;       // stored as number
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  images: string[];    // stored as URLs
}

// What the form gives you
export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  city: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: (File | string)[];  // can be File[] before upload OR string[] (URLs) after upload
}
