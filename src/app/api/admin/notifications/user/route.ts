// src/app/api/admin/notifications/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { createNotification } from "@/app/api/notifications/route";

// Helper: Check if user is admin
const checkAdminAccess = async (token: string) => {
  const decoded = await getAuth().verifyIdToken(token);
  const userId = decoded.uid;
  
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }
  
  return { userId, userData };
};

// POST - Send notification to specific user
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkAdminAccess(token);
    const { userId, title, message } = await req.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "User ID, title and message are required" },
        { status: 400 }
      );
    }

    // Verify target user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Create notification
    await createNotification({
      userId: userId,
      type: "admin_message",
      title: title,
      message: message,
    });

    return NextResponse.json({ 
      message: "Notification sent successfully" 
    });
  } catch (error: any) {
    console.error("User notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}