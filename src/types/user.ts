// src/types/user.ts

// Type for authenticated user from Firebase
export interface AppUser {
  uid: string;
  email: string;
  fullName?: string;
  emailVerified?: boolean;
  role?: "user" | "admin"; // role from your Firestore "users" collection
}
