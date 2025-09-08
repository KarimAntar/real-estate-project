// src/types/user.ts

// Type for authenticated user from Firebase
export interface AppUser {
  uid: string;
  email: string;
  fullName?: string;
  emailVerified?: boolean;
  role?: "user" | "admin"; // role from your Firestore "users" collection
  profilePicture?: string; // URL to profile picture
  googlePhotoURL?: string; // Original Google profile photo URL (if signed up with Google)
  signInMethod?: 'email' | 'google.com'; // How user signed up
}

// Profile update payload
export interface ProfileUpdateData {
  fullName?: string;
  profilePicture?: string;
  // Add other profile fields as needed
}