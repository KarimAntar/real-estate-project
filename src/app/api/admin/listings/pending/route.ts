// src/app/api/admin/listings/pending/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

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

// GET - Get all pending listings for review
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkAdminAccess(token);

    // Get all pending listings
    const listingsSnapshot = await db
      .collection("listings")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();

    // Get user data for each listing
    const listings = await Promise.all(
      listingsSnapshot.docs.map(async (doc) => {
        const listingData = doc.data();
        
        // Get user information
        let userName = "Unknown User";
        let userEmail = "Unknown Email";
        
        try {
          const userDoc = await db.collection("users").doc(listingData.ownerId || listingData.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.fullName || userData?.email || "Unknown User";
            userEmail = userData?.email || "Unknown Email";
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        return {
          id: doc.id,
          docId: doc.id,
          ...listingData,
          userName,
          userEmail,
        };
      })
    );

    return NextResponse.json(listings);
  } catch (error: any) {
    console.error("Get pending listings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pending listings" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}