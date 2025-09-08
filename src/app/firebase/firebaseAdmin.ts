// src/firebase/firebaseAdmin.ts
import admin from "firebase-admin";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// --- START: Added Checks ---
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountString) {
  throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is not set. The API cannot start.");
}

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!storageBucket) {
  throw new Error("The NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set.");
}
// --- END: Added Checks ---

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(serviceAccountString.replace(/\\n/g, "\n"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket, // Use the checked variable
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
    // Throw an error to make it clear that initialization failed
    throw new Error("Failed to initialize Firebase Admin SDK. Check your FIREBASE_SERVICE_ACCOUNT format.");
  }
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ✅ Make sure this is set
  });
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
export const storage = admin.storage();
export const bucket = storage.bucket();
