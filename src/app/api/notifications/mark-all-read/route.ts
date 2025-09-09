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