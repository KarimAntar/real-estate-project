// src/app/api/notifications/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { createNotification } from "@/app/api/notifications/route";

// POST - Send notification to a specific user (non-admin)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const senderId = decoded.uid;

    const { userId, title, message, listingId } = await req.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "User ID, title and message are required" },
        { status: 400 }
      );
    }

    // Security Check: A user can only create a notification for themselves.
    if (senderId !== userId) {
        return NextResponse.json({ error: "Forbidden: You can only create notifications for yourself." }, { status: 403 });
    }

    // Verify the target user exists in the database
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Create the notification using your helper function
    await createNotification({
      userId: userId,
      type: "listing_review", // This type is specific to new listing submissions
      title: title,
      message: message,
      listingId: listingId,
    });

    return NextResponse.json({
      message: "Notification created successfully"
    });
  } catch (error: any) {
    console.error("User notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}