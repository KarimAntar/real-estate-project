// src/app/api/listings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const body = await req.json();
    const docRef = db.collection("listings").doc(params.id);

    await docRef.update({ ...body, userId });

    return NextResponse.json({ id: params.id, ...body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const docRef = db.collection("listings").doc(params.id);
    await docRef.delete();

    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
