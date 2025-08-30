import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

interface ListingUpdate {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  [key: string]: any;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const body: ListingUpdate = await req.json();
    const docRef = db.collection("listings").doc(params.id);

    await docRef.update({ ...body, userId });

    return NextResponse.json({ id: params.id, ...body });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc(params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if ((docSnap.data() as ListingUpdate).userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ message: "Deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
