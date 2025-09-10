// src/app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";

// POST - Mark all notifications as read
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    // Find unread notifications
    const notificationsQuery = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    // Mark them as read
    const batch = db.batch();
    notificationsQuery.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Mark all read error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read", details: error?.message },
      { status: 500 }
    );
  }
}