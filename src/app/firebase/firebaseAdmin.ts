// src/app/firebase/firebaseAdmin.ts
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
  try {
    // Check for the individual environment variables
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !storageBucket
    ) {
      throw new Error(
        "Missing required Firebase Admin environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY, STORAGE_BUCKET)."
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The replace call is important to handle the newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: storageBucket,
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
    throw new Error(
      "Failed to initialize Firebase Admin SDK. Check your environment variables."
    );
  }
}

export const db = getFirestore();
export const authAdmin = admin.auth();
export const storage = getStorage();
export const bucket = storage.bucket();