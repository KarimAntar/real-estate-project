// src/firebase/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT!.replace(/\\n/g, "\n")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
export const storage = admin.storage();
export const bucket = storage.bucket(); // 👈 export bucket directly
