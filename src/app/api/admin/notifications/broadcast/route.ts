// src/app/api/admin/notifications/broadcast/route.ts
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

// POST - Send notification to all users
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: adminId } = await checkAdminAccess(token);
    const { title, message } = await req.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Get all users
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();

    // Create notifications for all users
    const promises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      
      // Don't send notification to the admin who is sending it
      if (userData.uid === adminId) return;
      
      return createNotification({
        userId: userData.uid,
        type: "admin_message",
        title: title,
        message: message,
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ 
      message: `Notification sent to ${usersSnapshot.docs.length - 1} users` 
    });
  } catch (error: any) {
    console.error("Broadcast notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send broadcast notification" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}