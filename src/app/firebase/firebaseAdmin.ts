// src/firebase/firebaseAdmin.ts
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountString) {
  throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is not set. The API cannot start.");
}

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!storageBucket) {
  throw new Error("The NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set.");
}

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(serviceAccountString.replace(/\\n/g, "\n"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
    // Throw an error to make it clear that initialization failed
    throw new Error("Failed to initialize Firebase Admin SDK. Check your FIREBASE_SERVICE_ACCOUNT format.");
  }
}

export const db = getFirestore();
export const authAdmin = admin.auth();
export const storage = getStorage();
export const bucket = storage.bucket();