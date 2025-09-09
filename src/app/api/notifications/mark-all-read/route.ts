// src/app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

// POST - Mark all notifications as read
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    // Get all unread notifications for the user
    const notificationsQuery = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    // Update all to read
    const batch = db.batch();
    notificationsQuery.docs.forEach(doc => {
      batch.update(doc.ref, { 
        read: true, 
        updatedAt: new Date().toISOString() 
      });
    });

    await batch.commit();

    return NextResponse.json({ 
      message: "All notifications marked as read",
      updated: notificationsQuery.docs.length
    });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}