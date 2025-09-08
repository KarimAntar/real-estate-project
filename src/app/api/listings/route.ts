// src/app/api/listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  city: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  userId?: string;
  [key: string]: any;
}

// Helper: get user data & role
const getUserData = async (uid: string) => {
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return { role: "user" };
  return userDoc.data() as { role?: string };
};

// GET all listings
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const userData = await getUserData(userId);
    const isAdmin = userData.role === "admin";

    const url = new URL(req.url);
    const isAdminQuery = url.searchParams.get("admin") === "true";

    let snapshot;
    if (isAdmin && isAdminQuery) {
      snapshot = await db.collection("listings").get(); // all listings
    } else {
      snapshot = await db.collection("listings").where("userId", "==", userId).get(); // only user's
    }

    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Listing) }));
    return NextResponse.json(listings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create new listing (FIXED)
export async function POST(req: NextRequest) {
  console.log("[LISTINGS API - POST] Received request to create listing.");

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      console.error("[LISTINGS API - POST] Error: No token provided.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;
    console.log(`[LISTINGS API - POST] Token verified for userId: ${userId}`);

    const body = await req.json();
    console.log("[LISTINGS API - POST] Request body received:", body);

    // --- Data Validation and Cleanup ---
    // This ensures no 'undefined' values are sent to Firestore, which would cause a crash.
    const listingData = {
      id: body.id || "", // Use the client-generated uuid
      title: body.title || "",
      description: body.description || "",
      price: Number(body.price) || 0,
      city: body.city || "",
      type: body.type || "Home",
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      area: Number(body.area) || 0,
      images: Array.isArray(body.images) ? body.images : [],
      userId: userId, // Always use the server-verified userId for security
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log("[LISTINGS API - POST] Cleaned data to be saved:", listingData);

    const docRef = db.collection("listings").doc();
    console.log(`[LISTINGS API - POST] Creating new document with ID: ${docRef.id}`);

    await docRef.set(listingData);
    console.log("[LISTINGS API - POST] Successfully wrote data to Firestore.");

    // --- FIX: Return Response Correctly ---
    // Spread the data first, then explicitly set the `id` to be the Firestore document ID.
    // This resolves the "id is specified more than once" error.
    return NextResponse.json({ ...listingData, id: docRef.id });

  } catch (err: unknown) {
    console.error("[LISTINGS API - POST] CRITICAL ERROR:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}