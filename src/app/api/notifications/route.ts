// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { Notification, NotificationCreateData } from "@/types/notification";

// Helper function to create notification
export const createNotification = async (data: NotificationCreateData): Promise<string> => {
  const docRef = db.collection("notifications").doc();
  
  const notification: Notification = {
    id: docRef.id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    listingId: data.listingId,
    adminNote: data.adminNote,
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docRef.set(notification);
  return docRef.id;
};

// GET - Get user notifications
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const notificationsQuery = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const notifications = notificationsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Mark all notifications as read
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action !== "mark-all-read") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}