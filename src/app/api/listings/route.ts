// src/app/api/listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

// ----------------------
// GET all listings for the logged-in user
// ----------------------
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const snapshot = await db.collection("listings")
      .where("userId", "==", userId)
      .get();

    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(listings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ----------------------
// CREATE a new listing
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc();
    await docRef.set({ ...body, userId });

    return NextResponse.json({ id: docRef.id, ...body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ----------------------
// UPDATE an existing listing
// ----------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc(id);
    await docRef.update({ ...data, userId });

    return NextResponse.json({ id, ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ----------------------
// DELETE a listing by ID
// ----------------------
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    // Optional: check if the user owns this listing
    if (docSnap.data()?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
