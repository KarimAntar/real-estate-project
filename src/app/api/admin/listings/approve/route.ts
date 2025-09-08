// src/app/api/admin/listings/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { createNotification } from "@/app/api/notifications/route";
import { ListingStatus } from "@/types/notification";

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

// POST - Approve or decline listing
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: adminId, userData: adminData } = await checkAdminAccess(token);
    const { listingId, status, adminNote } = await req.json();

    if (!listingId || !status) {
      return NextResponse.json(
        { error: "Listing ID and status are required" },
        { status: 400 }
      );
    }

    if (!["approved", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'declined'" },
        { status: 400 }
      );
    }

    // Get the listing
    const listingRef = db.collection("listings").doc(listingId);
    const listingSnap = await listingRef.get();

    if (!listingSnap.exists) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const listingData = listingSnap.data();
    
    // Update listing status
    const updateData: any = {
      status: status as ListingStatus,
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (status === "declined" && adminNote) {
      updateData.adminNote = adminNote;
    }

    await listingRef.update(updateData);

    // Create notification for the listing owner
    const notificationTitle = status === "approved" 
      ? "Listing Approved! 🎉" 
      : "Listing Declined";
    
    const notificationMessage = status === "approved"
      ? `Your listing "${listingData?.title}" has been approved and is now live on the platform.`
      : `Your listing "${listingData?.title}" has been declined. ${adminNote ? `Reason: ${adminNote}` : 'Please review and resubmit.'}`;

    await createNotification({
      userId: listingData?.ownerId || listingData?.userId,
      type: status === "approved" ? "listing_approved" : "listing_declined",
      title: notificationTitle,
      message: notificationMessage,
      listingId: listingId,
      adminNote: status === "declined" ? adminNote : undefined,
    });

    return NextResponse.json({ 
      message: `Listing ${status} successfully`,
      listingId,
      status,
    });
  } catch (error: any) {
    console.error("Listing approval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process listing approval" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}