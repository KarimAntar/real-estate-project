// src/app/api/listings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

interface ListingUpdate {
  title?: string;
  description?: string;
  price?: number;
  city?: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  [key: string]: any;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const body: ListingUpdate = await req.json();
    const docRef = db.collection("listings").doc(params.id);
    const listingSnap = await docRef.get();

    if (!listingSnap.exists) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listingData = listingSnap.data();
    if (listingData?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    );

    await docRef.update({ ...cleanedData, updatedAt: new Date().toISOString() });

    return NextResponse.json({ id: params.id, ...cleanedData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const listingData = docSnap.data();
    if (listingData?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ message: "Deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
