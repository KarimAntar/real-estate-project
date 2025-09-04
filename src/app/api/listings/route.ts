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

// POST create new listing
export async function POST(req: NextRequest) {
  try {
    const body: Listing = await req.json();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc();
    await docRef.set({
      ...body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, ...body });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
