// src/app/firebase/firebaseAdmin.ts
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
  try {
    if (!serviceAccountEnv) {
      throw new Error(
        "Missing required Firebase Admin environment variable: FIREBASE_SERVICE_ACCOUNT."
      );
    }
    
    if (!storageBucket) {
        throw new Error(
          "Missing required Firebase Admin environment variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET."
        );
    }

    const serviceAccount = JSON.parse(serviceAccountEnv);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
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