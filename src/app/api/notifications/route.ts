// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import { Notification, NotificationCreateData } from "@/types/notification";

// 🔹 Helper function to create a notification (for use in other routes)
export const createNotification = async (
  data: NotificationCreateData
): Promise<string> => {
  const docRef = db.collection("notifications").doc();

  const now = Timestamp.now();

  // ⚡ Store Timestamps in Firestore
  await docRef.set({
    id: docRef.id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    listingId: data.listingId,
    adminNote: data.adminNote,
    read: false,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

// 🔹 GET - Get user notifications
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

    const notifications: Notification[] = notificationsQuery.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        listingId: data.listingId,
        adminNote: data.adminNote,
        read: data.read,
        // ⚡ Convert Firestore Timestamp → ISO string
        createdAt: data.createdAt?.toDate().toISOString() ?? "",
        updatedAt: data.updatedAt?.toDate().toISOString() ?? "",
      };
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Get notifications error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error?.message },
      { status: 500 }
    );
  }
}

// 🔹 POST - Mark all notifications as read
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    if (action !== "mark-all-read") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

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
